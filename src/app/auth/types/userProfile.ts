export interface UserProfile {
  aadhaar: AadharData;
  pan: PanData;
  gst: GstData;
  bank: BankData;
  selfie: SelfieData;
  kycStatus: string;
  fullName?: string;
  businessName?: string;
}

export interface AadharData {
  registeredName: string;
  aadhaarNumber: string;
  dateOfBirth: string;
  registeredAddress: string;
  frontImage: string;
  backImage: string;
  status: string;
  kycStatus: string;
}

export interface PanData {
  registeredName: string;
  panNumber: string;
  typeOfHolder: string;
  dateOfBirth: string;
  registeredAddress: string;
  panImage: string;
  status: string;
  kycStatus: string;
}

export interface GstData {
  gstinNumber: string;
  businessName: string;
  businessType: string;
  registeredAddress: string;
  status: string;
  kycStatus: string;
}

export interface BankData {
  bankName: string;
  branch: string;
  ifscCode: string;
  accountNumber: string;
  accountType: string;
  registeredAddress: string;
  chequeImage: string;
  status: string;
  kycStatus: string;
}

export interface SelfieData {
  selfieImage: string;
  status: string;
  kycStatus: string;
}
