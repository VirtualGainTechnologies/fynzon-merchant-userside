import { UserData } from "./userModel";

export interface AuthData {
  message: string;
  error: boolean;
  data: UserData | null;
}
