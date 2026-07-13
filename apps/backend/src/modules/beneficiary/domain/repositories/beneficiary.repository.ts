import { Beneficiary } from "../entities/beneficiary.entity";

export interface FindAllBeneficiaryParams {
  skip?: number;
  take?: number;
  sppgId?: string;
  search?: string;
}

export interface CreateBeneficiaryData {
  name: string;
  institution: string;
  institutionType?: string;
  totalBeneficiary: number;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  sppgId: string;
}

export interface UpdateBeneficiaryData {
  name?: string;
  institution?: string;
  institutionType?: string;
  totalBeneficiary?: number;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface BeneficiaryRepository {
  findAll(params?: FindAllBeneficiaryParams): Promise<Beneficiary[]>;
  findById(id: string): Promise<Beneficiary | null>;
  count(params?: { sppgId?: string; search?: string }): Promise<number>;
  create(data: CreateBeneficiaryData): Promise<Beneficiary>;
  update(id: string, data: UpdateBeneficiaryData): Promise<Beneficiary>;
  delete(id: string): Promise<void>;
}
