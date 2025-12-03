import { ApiSettingData } from './apiSettingDataModel';

export interface DeveloperControlModel {
  message: string;
  error: boolean;
  data: DeveloperData;
}

export interface DeveloperData {
  apiSettingData?: ApiSettingData;
}
