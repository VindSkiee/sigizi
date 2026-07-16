export type InstitutionType =
  | 'SEKOLAH'
  | 'PANTI_ASUHAN'
  | 'PESANTREN'
  | 'RUMAH_SAKIT'
  | 'POSYANDU'
  | 'PUSKESMAS'
  | 'LAINNYA';

export interface Beneficiary {
  id: string;
  name: string;
  institution: string;
  institutionType: InstitutionType;
  totalBeneficiary: number;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  sppgId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeneficiaryStats {
  totalBeneficiaries: number;
  totalInstitutions: number;
  totalPortions: number;
}
