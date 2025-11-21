export interface UploadSelfieData {
  selfieImage: string;
}

export interface UploadSelfieResponse {
  message: string;
  error: string;
  data: UploadSelfieData | null;
}