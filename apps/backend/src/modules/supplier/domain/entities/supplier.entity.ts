export class Supplier {
  constructor(
    public readonly id: string,
    public name: string,
    public nib: string,
    public phone: string | null,
    public address: string | null,
    public province: string,
    public regency: string,
    public district: string,
    public village: string | null,
    public postalCode: string | null,
    public latitude: number | null,
    public longitude: number | null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  updateProfile(data: {
    name?: string;
    phone?: string;
    address?: string;
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  }): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
    if (data.province !== undefined) this.province = data.province;
    if (data.regency !== undefined) this.regency = data.regency;
    if (data.district !== undefined) this.district = data.district;
    if (data.village !== undefined) this.village = data.village;
    if (data.postalCode !== undefined) this.postalCode = data.postalCode;
    if (data.latitude !== undefined) this.latitude = data.latitude;
    if (data.longitude !== undefined) this.longitude = data.longitude;
    this.updatedAt = new Date();
  }
}
