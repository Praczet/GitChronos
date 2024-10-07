export interface IServerResponse<T = any> {
  message: string;
  type: 'error' | 'info' | 'warn';
  statusCode: number;
  data?: T;
  details?: any;
}
