export interface RegisterPayload {
  otpId?: string;
  otp?: string;
  category: string;
  email: string;
  businessName?: string;
  businessCategory?: string;
  fullName?: string;
  profession?: string;
  phoneCode: string;
  phone: string;
  password: string;
}