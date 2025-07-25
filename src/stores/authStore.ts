import { create } from 'zustand';
import { ApiService, SignupRequest } from '@/lib/api';

// Token persistence helpers
const TOKEN_KEY = 'bondx_auth_token';
const USER_KEY = 'bondx_user_data';

const saveTokenToStorage = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn('Failed to save token to localStorage:', error);
  }
};

const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
    return null;
  }
};

const saveUserToStorage = (user: User) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Failed to save user to localStorage:', error);
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.warn('Failed to get user from localStorage:', error);
    return null;
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.warn('Failed to clear auth from localStorage:', error);
  }
};

// Debug function to check localStorage state
export const debugAuthState = () => {
  const token = getTokenFromStorage();
  const user = getUserFromStorage();
  const currentState = useAuthStore.getState();
  
  console.log('🐛 Auth Debug State:', {
    localStorage: {
      hasToken: !!token,
      token: token?.substring(0, 20) + (token ? '...' : ''),
      hasUser: !!user,
      user: user?.name
    },
    zustandState: {
      isAuthenticated: currentState.isAuthenticated,
      isLoading: currentState.isLoading,
      isOnboarding: currentState.isOnboarding,
      userName: currentState.user?.name,
      userOnboarded: currentState.user?.isOnboarded
    }
  });
  
  return { token, user, currentState };
};

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  balance: number;
  avatar?: string;
  isVerified: boolean;
  isOnboarded: boolean;
  kycStatus?: string;
  riskProfile?: string;
  createdAt?: Date;
}

export interface DemoAccount {
  user: User;
  demoType: 'new_investor' | 'experienced_investor';
  demoDescription: string;
  startRoute: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarding: boolean;
  onboardingStep: number;
  isDemoMode: boolean;
  currentDemoType: string | null;
  
  // Actions
  signup: (data: SignupRequest) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  startOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: (userData: Partial<User>) => void;
  resetDemo: () => void;
  switchDemoAccount: (accountType: 'new_investor' | 'experienced_investor') => void;
  exitDemo: () => void;
  initializeAuth: () => void; // New method to restore session from localStorage
}

// Demo Account Data
const newInvestorAccount: DemoAccount = {
  user: {
    id: 'demo-new-001',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@demo.com',
    mobile: '+91 98765 43210',
    balance: 0,
    avatar: 'AK',
    isVerified: false,
    isOnboarded: false,
    kycStatus: 'pending',
    riskProfile: null,
    createdAt: new Date()
  },
  demoType: 'new_investor',
  demoDescription: 'Experience complete onboarding and first bond purchase',
  startRoute: '/onboarding'
};

const experiencedInvestorAccount: DemoAccount = {
  user: {
    id: 'demo-exp-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@demo.com',
    mobile: '+91 98765 12345',
    balance: 55237,
    avatar: 'PS',
    isVerified: true,
    isOnboarded: true,
    kycStatus: 'verified',
    riskProfile: 'intermediate',
    createdAt: new Date('2024-06-15')
  },
  demoType: 'experienced_investor',
  demoDescription: 'See portfolio management and advanced trading features',
  startRoute: '/portfolio'
};

// Original mock user for legacy support
const mockUser: User = {
  id: '1',
  name: 'Ajay Kumar',
  email: 'ajay@example.com',
  balance: 0,
  avatar: 'AK',
  isVerified: true,
  isOnboarded: true
};

export const useAuthStore = create<AuthState>((set, get) => ({
      user: null, // Start with no user for onboarding demo
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true to prevent premature redirects
      isOnboarding: false,
      onboardingStep: 1,
      isDemoMode: false,
      currentDemoType: null,

      signup: async (data: SignupRequest) => {
        set({ isLoading: true });
        
        try {
          const response = await ApiService.signup(data);
          
          if (response.status === 'success') {
            const { user_info, token } = response.data;
            
            const newUser: User = {
              id: user_info.id,
              name: user_info.name,
              email: user_info.email,
              mobile: user_info.phone,
              balance: 0, // Default balance
              avatar: user_info.name.charAt(0).toUpperCase(),
              isVerified: false, // Will be set to true after KYC
              isOnboarded: false // Will be set to true after completing all steps
            };
            
            // Save token and user to localStorage
            console.log('💾 Saving signup data to localStorage:', { 
              token: token.substring(0, 20) + '...', 
              userName: newUser.name 
            });
            saveTokenToStorage(token);
            saveUserToStorage(newUser);
            
            set({ 
              user: newUser,
              token,
              isAuthenticated: false, // Keep false until full onboarding complete
              isOnboarding: true, // Keep in onboarding mode
              isLoading: false 
            });
          } else {
            throw new Error(response.message || 'Signup failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Call real login API
          const response = await ApiService.login({ email, password });
          
          if (response.status === 'success') {
            const { user_info, token } = response.data;
            
            // Create user object from API response
            const user: User = {
              id: user_info.id,
              name: user_info.name,
              email: user_info.email,
              mobile: user_info.phone,
              balance: 0, // Will be updated from dashboard API
              isVerified: true,
              isOnboarded: true,
              kycStatus: 'verified',
              riskProfile: 'moderate'
            };
            
            // Save to localStorage
            saveTokenToStorage(token);
            saveUserToStorage(user);
            
            set({ 
              user,
              token,
              isAuthenticated: true, 
              isOnboarding: false,
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.message || 'Login failed');
        }
      },

  logout: () => {
    clearStoredAuth(); // Clear from localStorage
    set({ 
      user: null, 
      token: null,
      isAuthenticated: false,
      isOnboarding: false,
      onboardingStep: 1
    });
  },

  setToken: (token: string) => {
    set({ token });
  },

  updateBalance: (amount: number) => {
    const { user } = get();
    if (user) {
      set({ 
        user: { 
          ...user, 
          balance: user.balance + amount 
        } 
      });
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  startOnboarding: () => {
    set({ 
      isOnboarding: true, 
      onboardingStep: 1,
      isAuthenticated: false,
      user: null 
    });
  },

  setOnboardingStep: (step: number) => {
    set({ onboardingStep: step });
  },

  completeOnboarding: (userData: Partial<User>) => {
    const { user } = get();
    if (user) {
      // Update existing user with completed onboarding status
      const updatedUser: User = {
        ...user,
        ...userData,
        isVerified: true,
        isOnboarded: true
      };
      
      // Update localStorage with completed user data
      console.log('🎉 Completing onboarding and authenticating user:', { 
        userName: updatedUser.name, 
        isOnboarded: updatedUser.isOnboarded 
      });
      saveUserToStorage(updatedUser);
      
      set({ 
        user: updatedUser,
        isAuthenticated: true, // Now fully authenticate the user
        isOnboarding: false,
        onboardingStep: 1
      });
    }
  },

  resetDemo: () => {
    localStorage.removeItem('bondx_demo_mode');
    set({
      user: null,
      isAuthenticated: false,
      isOnboarding: false,
      onboardingStep: 1,
      isLoading: false,
      isDemoMode: false,
      currentDemoType: null
    });
  },

  switchDemoAccount: (accountType: 'new_investor' | 'experienced_investor') => {
    const account = accountType === 'new_investor' ? newInvestorAccount : experiencedInvestorAccount;
    
    localStorage.setItem('bondx_demo_mode', accountType);
    
    if (accountType === 'new_investor') {
      set({
        user: account.user,
        isAuthenticated: false,
        isOnboarding: true,
        onboardingStep: 1,
        isDemoMode: true,
        currentDemoType: accountType,
        isLoading: false
      });
    } else {
      set({
        user: account.user,
        isAuthenticated: true,
        isOnboarding: false,
        onboardingStep: 1,
        isDemoMode: true,
        currentDemoType: accountType,
        isLoading: false
      });
    }
  },

  exitDemo: () => {
    localStorage.removeItem('bondx_demo_mode');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isOnboarding: false,
      onboardingStep: 1,
      isLoading: false,
      isDemoMode: false,
      currentDemoType: null
    });
  },

  initializeAuth: () => {
    const storedToken = getTokenFromStorage();
    const storedUser = getUserFromStorage();
    
    console.log('🔍 Initializing auth:', { 
      hasToken: !!storedToken, 
      hasUser: !!storedUser,
      token: storedToken?.substring(0, 20) + '...',
      user: storedUser?.name 
    });
    
    if (storedToken && storedUser) {
      console.log('✅ Restoring session from localStorage');
      // Restore session from localStorage
      set({
        user: storedUser,
        token: storedToken,
        isAuthenticated: true,
        isOnboarding: false,
        isLoading: false
      });
    } else {
      console.log('❌ No valid session found in localStorage');
      set({ isLoading: false });
    }
  }
}));