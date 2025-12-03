export interface OtpData {
  message: string;
  error: boolean;
  data: {
    mode?: string;
    oldIpAddress?: string;
    ipAddres?: string;
    otpId: string;
    email?: string;
  } | null;
}
