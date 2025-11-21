import { AadharData, BankData, GstData, PanData, SelfieData } from "../../../auth/types/userProfile";

export interface KycModel {
  message: string;
  error: string;
  data: KycData;
}

export interface KycData {
  aadhaar: AadharData | null;
  pan: PanData | null;
  gst: GstData | null;
  bank: BankData | null;
  selfie: SelfieData | null;
  kycStatus: string;
}

export interface AadharModel {
  message: string;
  error: string;
  data: AadharData | null;
}

export interface PanModel {
  message: string;
  error: string;
  data: PanData | null;
}

export interface GstModel {
  message: string;
  error: string;
  data: GstData | null;
}

export interface BankModel {
  message: string;
  error: string;
  data: BankData | null;
}

export interface SelfieModel {
  message: string;
  error: string;
  data: SelfieData | null;
}