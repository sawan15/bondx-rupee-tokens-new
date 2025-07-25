import { create } from 'zustand';
import { ApiService, SignupRequest } from '@/lib/api';

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
      isLoading: false,
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
              balance: 0, // Start with zero balance
              avatar: user_info.name.charAt(0).toUpperCase(),
              isVerified: true,
              isOnboarded: true
            };
            
            set({ 
              user: newUser,
              token,
              isAuthenticated: true,
              isOnboarding: false,
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
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock login validation
        if (email === 'ajay@example.com' && password === 'password') {
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid credentials');
        }
      },

  logout: () => {
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
    const newUser: User = {
      id: userData.id || '1',
      name: userData.name || '',
      email: userData.email || '',
      balance: userData.balance || 0,
      avatar: userData.avatar || userData.name?.charAt(0).toUpperCase() || 'U',
      isVerified: true,
      isOnboarded: true
    };
    
    set({ 
      user: newUser,
      isAuthenticated: true,
      isOnboarding: false,
      onboardingStep: 1
    });
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
  }
}));