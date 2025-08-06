import { supabaseClient } from "../../supabaseClient";
import { SUPABASE_TABLES } from "@/app/config";
import { MaskingService } from "@/lib/services/maskinService";
import { JwtService } from "@/lib/services/jwtService";
import { EncryptionService } from "@/lib/services/encryptionService";

export interface BankPersonalInfoInput {
    bank_id: number;
    bank_name: string;
    account_number: string;
    account_type: string;
    dni_number: string;
    dni_type: string;
    alias: string;
    profile_id: number;
    isPrimary: boolean;
}

export interface PreparedBankInfo {
    bank_id: number;
    bank_name: string;
    account_number_masked: string;
    account_type: string;
    dni_number_masked: string;
    dni_type: string;
    alias_masked: string;
    isActive: boolean;
    isPrimary: boolean;
    profile_id: number;
    code: string;
    tokenized: string;
}

export const getActiveBanks = async () => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.BANKS)
            .select("*")
            .eq("isActive", true);

        if (error) {
            console.error("Error fetching active banks:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Unexpected error fetching active banks:", error);
        return [];
    }
};

export const getBankPersonalInfo = async (bankId: string) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.BANK_INFORMATION)
            .select("*")
            .eq("code", bankId)
            .single();

        if (error) {
            console.error("Error fetching bank personal info:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error fetching bank personal info:", error);
        return null;
    }
};

export const createBankPersonalInfo = async (input: BankPersonalInfoInput) => {
    const jwtService = new JwtService();
    const encryptionService = new EncryptionService();
    const { bank_id, bank_name, account_number, account_type, dni_number, dni_type, alias, profile_id, isPrimary } = input;

    const token = await jwtService.sign({
        bank_id: encryptionService.encrypt(bank_id.toString()),
        account_number: encryptionService.encrypt(account_number),
        account_type: encryptionService.encrypt(account_type),
        dni_number: encryptionService.encrypt(dni_number),
        dni_type: encryptionService.encrypt(dni_type),
        alias : encryptionService.encrypt(alias),
    });

    const code = await generateBankCode();

    const prepared: PreparedBankInfo = {
        bank_id,
        bank_name,
        account_number_masked: MaskingService.maskAccountNumber(account_number),
        account_type,
        dni_number_masked: MaskingService.maskDni(dni_number),
        dni_type,
        alias_masked: MaskingService.maskAlias(alias),
        isActive: true,
        isPrimary,
        profile_id,
        code,
        tokenized: token,
    };

    return await saveBankPersonalInfo(prepared);
};

const saveBankPersonalInfo = async (info: PreparedBankInfo): Promise<void> => {
    try {
        // Si esta cuenta es primaria, actualiza las demás a no primarias
        if (info.isPrimary) {
            const { error: updateError } = await supabaseClient
                .from(SUPABASE_TABLES.BANK_INFORMATION)
                .update({ isPrimary: false })
                .eq("profile_id", info.profile_id)
                .eq("isPrimary", true);

            if (updateError) {
                console.error("Error actualizando cuentas previas a no primarias:", updateError);
            }
        }

        // Luego insertas la nueva cuenta bancaria
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.BANK_INFORMATION)
            .insert({
                bank_id: info.bank_id,
                bank_name: info.bank_name,
                account_number: info.account_number_masked,
                account_type: info.account_type,
                dni_number: info.dni_number_masked,
                dni_type: info.dni_type,
                alias: info.alias_masked,
                isActive: info.isActive,
                isPrimary: info.isPrimary,
                profile_id: info.profile_id,
                code: info.code,
                tokenized: info.tokenized,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error inserting bank info:", error);
        } else {
            console.log("Inserted bank info:", data);
        }
    } catch (error) {
        console.error("Error saving bank personal info:", error);
    }
};


const generateBankCode = async (): Promise<string> => {
    const randomCode = `BNK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return randomCode;
};

export const updateBankPersonalInfo = async (
  bankCode: string,
  input: Partial<BankPersonalInfoInput>
) => {
  try {
    // Obtener el registro actual
    const { data: current, error: fetchError } = await supabaseClient
      .from(SUPABASE_TABLES.BANK_INFORMATION)
      .select("*")
      .eq("code", bankCode)
      .single();

    if (fetchError || !current) {
      console.error(`No se encontró la cuenta bancaria con code: ${bankCode}`, fetchError);
      return null;
    }

    // Desmarcar otras primarias si esta pasa a ser primaria
    if (input.isPrimary === true && current.profile_id) {
      const { error: updateOthersError } = await supabaseClient
        .from(SUPABASE_TABLES.BANK_INFORMATION)
        .update({ isPrimary: false })
        .eq("profile_id", current.profile_id)
        .eq("isPrimary", true)
        .neq("code", bankCode);

      if (updateOthersError) {
        console.error("Error al desmarcar cuentas primarias previas:", updateOthersError);
        return null;
      }
    }

    // Determinar si hay cambios sensibles
    const needsSensitiveUpdate =
      (input.account_number && input.account_number !== current.account_number) ||
      (input.account_type && input.account_type !== current.account_type) ||
      (input.dni_number && input.dni_number !== current.dni_number) ||
      (input.dni_type && input.dni_type !== current.dni_type) ||
      (input.alias && input.alias !== current.alias);

    const updatePayload: Record<string, any> = {
      ...(input.bank_name !== undefined ? { bank_name: input.bank_name } : {}),
      ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
    };

    if (needsSensitiveUpdate) {
      const jwtService = new JwtService();
      const encryptionService = new EncryptionService();

      const newAccountNumber = input.account_number || current.account_number;
      const newDniNumber = input.dni_number || current.dni_number;
      const newAlias = input.alias || current.alias;
      const newAccountType = input.account_type || current.account_type;
      const newDniType = input.dni_type || current.dni_type;

      const token = await jwtService.sign({
        bank_id: current.bank_id !== null && current.bank_id !== undefined
          ? encryptionService.encrypt(current.bank_id.toString())
          : "null", // no cambia
        account_number: encryptionService.encrypt(newAccountNumber),
        account_type: encryptionService.encrypt(newAccountType),
        dni_number: encryptionService.encrypt(newDniNumber),
        dni_type: encryptionService.encrypt(newDniType),
        alias: encryptionService.encrypt(newAlias),
      });

      updatePayload.tokenized = token;
      updatePayload.account_number = MaskingService.maskAccountNumber(newAccountNumber);
      updatePayload.dni_number = MaskingService.maskDni(newDniNumber);
      updatePayload.alias = MaskingService.maskAlias(newAlias);
      updatePayload.account_type = newAccountType;
      updatePayload.dni_type = newDniType;
      updatePayload.updated_at = new Date().toISOString();
    }

    const { data, error: updateError } = await supabaseClient
      .from(SUPABASE_TABLES.BANK_INFORMATION)
      .update(updatePayload)
      .eq("code", bankCode)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error actualizando la información bancaria:", updateError);
      return null;
    }

    return data;
  } catch (e) {
    console.error("Error inesperado en updateBankPersonalInfo:", e);
    return null;
  }
};


export const getBankInfoByCode = async (code: string) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.BANK_INFORMATION)
            .select("*")
            .eq("code", code)
            .single();

        if (error) {
            console.error("Error fetching bank info by code:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Unexpected error fetching bank info by code:", error);
        return null;
    }
};

export const getBankInfoByProfileId = async (profileId: number) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.BANK_INFORMATION)
            .select("code, bank_name, account_number, account_type, dni_number, dni_type, alias, isActive, isPrimary, profile_id")
            .eq("profile_id", profileId)
            .eq("isActive", true);

        if (error) {
            console.error("Error fetching bank info by profile ID:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Unexpected error fetching bank info by profile ID:", error);
        return [];
    }
};

export const getBankTokenByCode = async (code: string) => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.BANK_INFORMATION)
            .select("tokenized, profile_id")
            .eq("code", code)
            .eq("isActive", true)
            .single();

        if (error) {
            console.error("Error fetching bank info by bank code:", error);
            return null;
        }

        return data || null;
    } catch (error) {
        console.error("Unexpected error fetching bank info by Bank code:", error);
        return null;
    }
};

export const getAllActiveAccounts = async () => {
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLES.BANK_INFORMATION)
            .select("code, bank_name, account_number, account_type, dni_number, dni_type, alias, isActive, isPrimary, profile_id")
            .eq("isActive", true);

        if (error) {
            console.error("Error fetching all active bank accounts:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Unexpected error fetching all active bank accounts:", error);
        return [];
    }
};