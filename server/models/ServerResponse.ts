import { IServerResponse } from './IServerResponse.js';

export class ServerResponse implements IServerResponse {
  message: string;
  type: 'error' | 'info' | 'warn';
  statusCode: number;
  data?: any;
  details?: any;

  constructor(messageOrResponse: string | IServerResponse, type?: 'error' | 'info' | 'warn', statusCode?: number, data?: any, details?: any) {
    if (typeof messageOrResponse === 'string') {
      // Initialize using individual parameters
      this.message = messageOrResponse;
      this.type = type!;
      this.statusCode = statusCode!;
      this.data = data;
      this.details = details;
    } else {
      // Initialize using an object
      this.message = messageOrResponse.message;
      this.type = messageOrResponse.type;
      this.statusCode = messageOrResponse.statusCode;
      this.data = messageOrResponse.data;
      this.details = messageOrResponse.details;
    }
  }

  isError(): boolean {
    return this.type === 'error';
  }
}
