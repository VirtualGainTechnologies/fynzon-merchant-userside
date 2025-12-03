export interface ApiSettingModel {
  message: string;
  error: boolean;
  data: ApiSettingData;
}

export interface ApiSettingData {
  test_api_key?: ApiKeyData;
  live_api_key?: ApiKeyData;
  test_ip?: IpData[];
  live_ip?: IpData[];
  test_webhook_url?: WebHookUrlData[];
  live_webhook_url?: WebHookUrlData[];
}

export interface ApiKeyData {
  api_key: string;
  secret_key: string;
  status: string;
  url: string;
  created_at: Date;
}

export interface IpData {
  ip_address: string;
  status: string;
  created_at: Date;
}

export interface WebHookUrlData {
  url: string;
  event: string;
  created_at: Date;
}
