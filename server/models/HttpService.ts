import { IServerResponse } from './IServerResponse.js';
import { Request } from 'express';

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

class HttpService {
  // Static method to perform a fetch request with default settings and handle IServerResponse

  public static async Fetch<T>(url: string, data: any = undefined, options: FetchOptions = {}): Promise<IServerResponse<T>> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    let modifiedUrl = url;
    const method = options.method || 'GET';

    // If data is provided and method is GET, append data as query parameters
    if (method === 'GET' && data) {
      const queryParams = new URLSearchParams(data).toString();
      modifiedUrl += `?${queryParams}`;
    }

    const fetchOptions: RequestInit = {
      method, // Use determined method
      headers: { ...defaultHeaders, ...options.headers },
      body: method !== 'GET' && method !== 'HEAD' && data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await fetch(modifiedUrl, fetchOptions);
      if (!response.ok) {
        const errorResponse: IServerResponse<T> = {
          message: 'HTTP error',
          type: 'error',
          statusCode: response.status,
          data: undefined,
          details: response.statusText,
        };
        return errorResponse;
      }

      const responseData: IServerResponse<T> = await response.json();
      return responseData;
    } catch (error) {
      const errorResponse: IServerResponse<T> = {
        message: 'HTTP error',
        type: 'error',
        statusCode: 500,
        data: undefined,
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      return errorResponse;
    }
  }

  public static createResponseObject(req: Request): Record<string, any> {
    let response: Record<string, any> = {};

    if (req.method === "GET") {
      response = {
        ...req.query, // Spread all query parameters into the response object
      };
    } else if (req.method === "POST") {
      response = {
        ...req.body, // Spread all body properties into the response object
      };
    } else {
      response = {
        message: `Unsupported HTTP method: ${req.method}`,
        method: req.method,
      };
    }

    return response;
  }


}

export default HttpService;
