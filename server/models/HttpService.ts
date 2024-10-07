import { IServerResponse } from './IServerResponse.js';

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

class HttpService {
  // Static method to perform a fetch request with default settings and handle IServerResponse
  public static async Fetch<T>(url: string, options: FetchOptions = {}): Promise<IServerResponse<T>> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const fetchOptions: RequestInit = {
      method: options.method || 'GET', // Default to 'GET' if method is not provided
      headers: { ...defaultHeaders, ...options.headers }, // Merge default headers with custom headers
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        // Create an error response object if the response is not ok
        const errorResponse: IServerResponse<T> = {
          message: 'HTTP error',
          type: 'error',
          statusCode: response.status,
          data: undefined,
          details: response.statusText,
        };
        return errorResponse;
      }
      // Parse the response as JSON
      const data: IServerResponse<T> = await response.json();
      return data;
    } catch (error) {
      // Handle any network errors
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
}

export default HttpService;
