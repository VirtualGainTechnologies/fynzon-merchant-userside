export interface ValidateUserData {
  message: string;
  error: boolean;
  data: { userExists: boolean } | null;
}