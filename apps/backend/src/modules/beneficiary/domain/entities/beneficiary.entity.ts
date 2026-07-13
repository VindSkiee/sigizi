export class Beneficiary {
  constructor(
    public readonly id: string,
    public name: string,
    public institution: string,
    public institutionType: string | null,
    public totalBeneficiary: number,
    public address: string | null,
    public contactPhone: string | null,
    public contactEmail: string | null,
    public readonly sppgId: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  update(data: {
    name?: string;
    institution?: string;
    institutionType?: string;
    totalBeneficiary?: number;
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
  }): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.institution !== undefined) this.institution = data.institution;
    if (data.institutionType !== undefined)
      this.institutionType = data.institutionType;
    if (data.totalBeneficiary !== undefined)
      this.totalBeneficiary = data.totalBeneficiary;
    if (data.address !== undefined) this.address = data.address;
    if (data.contactPhone !== undefined) this.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) this.contactEmail = data.contactEmail;
    this.updatedAt = new Date();
  }
}
