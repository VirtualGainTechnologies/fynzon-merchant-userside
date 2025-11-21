export interface OtpPayload {
  type?: string;
  otp?: number;
  otpId?: string;
  email?: string;
  phone?: string;
  phoneCode?:string
}
