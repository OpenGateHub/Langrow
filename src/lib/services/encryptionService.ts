import crypto from "crypto";

export class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly key: Buffer;

  constructor() {
    const envKey = process.env.ENCRYPTION_KEY;
    if (!envKey) {
      throw new Error("ENCRYPTION_KEY is missing");
    }

    this.key = Buffer.from(envKey, "hex");
    if (this.key.length !== 32) {
      throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
    }
  }

  encrypt(value: string | null): string {
    if (value === null) {
      return null as unknown as string; // Return null if input is null
    }
    const iv = crypto.randomBytes(12); // 96 bits recomendado para GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(value as string, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Formato final: [IV | TAG | ENCRYPTED_DATA]
    const result = Buffer.concat([iv, tag, encrypted]);
    return result.toString("base64");
  }

  decrypt(encryptedBase64: string | null): string {
    if (encryptedBase64 === null) {
      return null as unknown as string; // Return null if input is null
    }
    const data = Buffer.from(encryptedBase64 as string, "base64");

    const iv = data.subarray(0,12);
    const tag = data.subarray(12, 28);
    const encryptedText = data.subarray(28);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    const decrypted = decipher.update(encryptedText, undefined, "utf8") + decipher.final("utf8");
    return decrypted;
  }
}
