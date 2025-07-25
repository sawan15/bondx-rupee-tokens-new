const API_BASE_URL = 'https://ff616ef0fdef.ngrok-free.app/api';

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

export interface BondApiResponse {
  symbol: string;
  name: string;
  current_price: string;
  change: string;
  change_percent: string;
  yield_rate: string;
  maturity_date: string;
  is_active: boolean;
}

export interface DashboardResponse {
  status_code: number;
  status: string;
  data: {
    user: {
      name: string;
      wallet_balance: string;
      available_to_invest: string;
    };
    marketplace_stats: {
      total_bonds: number;
      average_ytm: string;
    };
  };
}

export interface LoginRequest {
  email?: string;
  mobile?: string;
  password: string;
}

export interface LoginResponse {
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

// Wallet API Interfaces (Fully Implemented)
export interface WalletResponse {
  status_code: number;
  status: string;
  message: string;
  data: {
    balance: string;
    blocked_amount: string;
    available: string;
    total_deposited: string;
    max_deposit_limit: string;
  };
}

export interface DepositRequest {
  user_id: string;
  amount: string;
  payment_method: 'UPI' | 'Bank Transfer' | 'Debit Card' | 'Credit Card';
  transaction_reference: string;
  notes?: string;
}

export interface DepositResponse {
  status_code: number;
  status: string;
  message: string;
  data: {
    transaction_id: string;
    amount: string;
    new_balance: string;
    deposit_time: string;
  };
}

export interface WithdrawRequest {
  user_id: string;
  amount: string;
  bank_account_id: string;
  notes?: string;
}

export interface WithdrawResponse {
  status_code: number;
  status: string;
  message: string;
  data: {
    transaction_id: string;
    amount: string;
    new_balance: string;
    processing_time: string;
    withdrawal_time: string;
  };
}

export interface Transaction {
  transaction_id: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'coupon';
  amount: string;
  balance_after: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  reference: string;
}

export interface TransactionHistoryResponse {
  status_code: number;
  status: string;
  message: string;
  data: {
    transactions: Transaction[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  };
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: string;
  average_buy_price: string;
  current_price: string;
  market_value: string;
  total_cost: string;
  pnl: string;
  pnl_percent: string;
}

export interface PortfolioResponse {
  status_code: number;
  status: string;
  data: {
    holdings: PortfolioHolding[];
    summary: {
      total_invested: string;
      total_market_value: string;
      total_pnl: string;
      total_pnl_percent: string;
    };
  };
}

// Bond Details API Interfaces (Actual Backend Response)
export interface BondDetailsResponse {
  status_code: number;
  status: string;
  data: {
    symbol: string;
    name: string;
    actual_price: string;
    current_price: string;
    change: string;
    change_percent: string;
    yield_rate: string;
    maturity_date: string;
    face_value: string;
    ohlc: Array<{
      date: string;
      open: string;
      high: string;
      low: string;
      close: string;
      volume: string;
    }>;
    order_book: {
      bids: Array<{
        price: string;
        quantity: string;
      }> | null;
      asks: Array<{
        price: string;
        quantity: string;
      }> | null;
    };
    is_active: boolean;
  };
}

export interface OrderRequest {
  user_id: string;
  bond_symbol: string;
  order_type: 'buy' | 'sell';
  quantity: string;
  price?: string; // Optional for market orders
  order_mode: 'market' | 'limit';
}

export interface OrderResponse {
  status_code: number;
  status: string;
  message: string;
  data: {
    order_id: string;
    user_id: string;
    bond_symbol: string;
    order_type: 'buy' | 'sell';
    quantity: string;
    price: string;
    order_mode: 'market' | 'limit';
    status: 'pending' | 'completed' | 'cancelled' | 'partial';
    total_amount: string;
    created_at: string;
    expires_at: string;
  };
}

export interface UserOrdersResponse {
  status_code: number;
  status: string;
  message: string;
  data: {
    orders: OrderResponse['data'][];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  };
}

export interface BondsListResponse {
  status_code: number;
  status: string;
  data: BondApiResponse[];
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export class ApiService {
  private static getAuthHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning page
    };
    
    // Use provided token or get from localStorage
    const authToken = token || this.getStoredToken();
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    
    return headers;
  }

  private static getStoredToken(): string | null {
    try {
      return localStorage.getItem('bondx_auth_token');
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
      return null;
    }
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

  static async getBonds(): Promise<BondsListResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bonds/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: BondsListResponse = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getUserDashboard(userId: string): Promise<DashboardResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/dashboard?user_id=${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: DashboardResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Get dashboard API error:', error);
      throw error;
    }
  }

  // Wallet API Methods (All Working)
  static async getUserWallet(userId: string): Promise<WalletResponse> {
    const response = await fetch(`${API_BASE_URL}/user/wallet/?user_id=${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async depositFunds(data: DepositRequest): Promise<DepositResponse> {
    const response = await fetch(`${API_BASE_URL}/user/wallet/deposit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async withdrawFunds(data: WithdrawRequest): Promise<WithdrawResponse> {
    const response = await fetch(`${API_BASE_URL}/user/wallet/withdraw`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'coupon';
    }
  ): Promise<TransactionHistoryResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.offset && { offset: options.offset.toString() }),
      ...(options?.type && { type: options.type }),
    });

    const response = await fetch(`${API_BASE_URL}/user/transactions?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: LoginResponse = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getUserPortfolio(userId: string): Promise<PortfolioResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/portfolio?user_id=${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: PortfolioResponse = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Bond Details API Methods (All Working)
  static async getBondDetails(symbol: string): Promise<BondDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/bonds/${symbol}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async placeOrder(data: OrderRequest): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async getUserOrders(
    userId: string,
    options?: {
      bond_symbol?: string;
      status?: 'pending' | 'completed' | 'cancelled' | 'partial';
      order_type?: 'buy' | 'sell';
      limit?: number;
      offset?: number;
    }
  ): Promise<UserOrdersResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      ...(options?.bond_symbol && { bond_symbol: options.bond_symbol }),
      ...(options?.status && { status: options.status }),
      ...(options?.order_type && { order_type: options.order_type }),
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.offset && { offset: options.offset.toString() }),
    });

    const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async getOrderDetails(orderId: string): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async cancelOrder(orderId: string): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async getOrderHistory(
    userId: string,
    options?: {
      from_date?: string; // ISO 8601 format
      to_date?: string; // ISO 8601 format
      bond_symbol?: string;
      order_type?: 'buy' | 'sell';
      status?: 'pending' | 'completed' | 'cancelled' | 'partial';
      limit?: number;
      offset?: number;
    }
  ): Promise<UserOrdersResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      ...(options?.from_date && { from_date: options.from_date }),
      ...(options?.to_date && { to_date: options.to_date }),
      ...(options?.bond_symbol && { bond_symbol: options.bond_symbol }),
      ...(options?.order_type && { order_type: options.order_type }),
      ...(options?.status && { status: options.status }),
      ...(options?.limit && { limit: options.limit.toString() }),
      ...(options?.offset && { offset: options.offset.toString() }),
    });

    const response = await fetch(`${API_BASE_URL}/orders/history?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  static async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: HealthResponse = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Generic authenticated request method for future use
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