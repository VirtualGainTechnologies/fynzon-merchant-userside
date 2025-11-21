import { KycData } from './kycModel';

export interface AccountModel {
  message: string;
  error: boolean;
  data: AccountData;
}

export interface AccountData {
  kycData?: KycData;
}