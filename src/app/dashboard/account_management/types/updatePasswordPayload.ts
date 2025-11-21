export interface UpadtePasswordPayload {
  otpType?: string;
  otpId?: string;
  currentPassword: string;
  newPassword: string;
}