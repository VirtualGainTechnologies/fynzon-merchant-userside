export interface BackendErrorsData {
  message: string;
  error: boolean;
  data: any | null;
  errorCode?: string;
  completeErr?: any;
  stack?: any;
}
