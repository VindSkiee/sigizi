export type DistributionStatus =
  | "belum_sync"
  | "menunggu"
  | "sedang_dikirim"
  | "terkirim";

export interface BeneficiaryClass {
  id: string;
  schoolName: string;
  className: string;
  teacherName: string;
  totalRegistered: number;
  presentToday: number | null;
  sickCount: number;
  absentCount: number;
  targetPortions: number | null;
  distributionStatus: DistributionStatus;
  lastSyncTime?: string;
}

export interface BeneficiaryStats {
  totalRegistered: number;
  totalSchools: number;
  presentToday: number;
  absentToday: number;
  syncedClasses: number;
  totalClasses: number;
}
