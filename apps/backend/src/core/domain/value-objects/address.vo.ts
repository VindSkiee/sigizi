export interface AddressProps {
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
}

export class Address {
  readonly province: string;
  readonly regency: string;
  readonly district: string;
  readonly village?: string;
  readonly postalCode?: string;

  constructor(props: AddressProps) {
    if (!props.province) throw new Error("Province is required");
    if (!props.regency) throw new Error("Regency is required");
    if (!props.district) throw new Error("District is required");

    this.province = props.province;
    this.regency = props.regency;
    this.district = props.district;
    this.village = props.village;
    this.postalCode = props.postalCode;
  }

  toString(): string {
    const parts = [
      this.village,
      this.district,
      this.regency,
      this.province,
    ].filter(Boolean);
    return parts.join(", ");
  }

  equals(other: Address): boolean {
    return (
      this.province === other.province &&
      this.regency === other.regency &&
      this.district === other.district &&
      this.village === other.village &&
      this.postalCode === other.postalCode
    );
  }

  static fromPrisma(data: {
    province: string;
    regency: string;
    district: string;
    village?: string | null;
    postalCode?: string | null;
  }): Address {
    return new Address({
      province: data.province,
      regency: data.regency,
      district: data.district,
      village: data.village ?? undefined,
      postalCode: data.postalCode ?? undefined,
    });
  }
}
