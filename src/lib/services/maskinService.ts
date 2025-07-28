export class MaskingService {
  static maskDni(dni: string | null): string {
    if (!dni) return "";
    return dni.replace(/\d(?=\d{4})/g, "*"); // *****1234
  }

  static maskAccountNumber(account: string | null): string {
    if (!account) return "";
    return account.replace(/\d(?=\d{4})/g, "*"); // ************5678
  }

  static maskAlias(alias: string | null): string {
    if (!alias) return "";
    if (alias.length <= 4) return "*".repeat(alias.length);
    const visible = alias.slice(-4);
    return "*".repeat(alias.length - 4) + visible; // *******lias
  }

  static maskAll(data: {
    dni?: string;
    accountNumber?: string;
    alias?: string;
  }) {
    return {
      dni: data.dni ? this.maskDni(data.dni) : undefined,
      accountNumber: data.accountNumber ? this.maskAccountNumber(data.accountNumber) : undefined,
      alias: data.alias ? this.maskAlias(data.alias) : undefined,
    };
  }
}
