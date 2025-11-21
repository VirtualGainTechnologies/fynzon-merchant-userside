export interface OtpData {
  message: string;
  error: boolean;
  data: {
    otpId: string;
    email?: string;
  } | null;
}
