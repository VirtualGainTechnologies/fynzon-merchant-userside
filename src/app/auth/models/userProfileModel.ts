import { UserProfile } from "../types/userProfile";

export interface UserProfileResponse {
  message: string; 
  error: boolean;
  data: UserProfile;
}