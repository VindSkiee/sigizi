import { Sppg } from "../entities/sppg.entity";

export interface FindAllSppgParams {
  skip?: number;
  take?: number;
}

export interface CreateSppgData {
  name: string;
  mitraId?: string;
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateSppgData {
  name?: string;
  mitraId?: string;
  address?: string;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface SppgRepository {
  findAll(params?: FindAllSppgParams): Promise<Sppg[]>;
  findById(id: string): Promise<Sppg | null>;
  count(): Promise<number>;
  create(data: CreateSppgData): Promise<Sppg>;
  update(id: string, data: UpdateSppgData): Promise<Sppg>;
  delete(id: string): Promise<void>;
}
