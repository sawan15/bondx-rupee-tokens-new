const API_BASE_URL = 'https://345c070a6e45.ngrok-free.app/api';

export interface SignupRequest {
  email: string;
  phone: string;
  name: string;
  password: string;
}

export interface SignupResponse {
  status_code: number;
  status: string;
  message: string;
  data: {
    user_info: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    token: string;
  };
}

export class ApiService {
  private static getAuthHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  static async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: SignupResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Signup API error:', error);
      throw error;
    }
  }

  // Future API methods can be added here
  static async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}, token: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(token),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
} 