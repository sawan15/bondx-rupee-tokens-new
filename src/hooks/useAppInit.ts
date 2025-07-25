import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore, debugAuthState, testTokenPersistence } from '@/stores/authStore';
import { startMarketSimulation, stopMarketSimulation } from '@/stores/appStore';

export const useAppInit = () => {
  const loadDemoData = useAppStore((state) => state.loadDemoData);
  const isLoaded = useAppStore((state) => state.marketplace.bondTokens.length > 0);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    console.log('🚀 App initializing...');
    
    // Initialize authentication from localStorage
    initializeAuth();
    
    // Debug: Show token state after initialization
    setTimeout(() => {
      const token = localStorage.getItem('bondx_auth_token');
      const user = localStorage.getItem('bondx_user_data');
      console.log('🔍 Token state after init:', {
        hasToken: !!token,
        hasUser: !!user,
        userOnboarded: user ? JSON.parse(user).isOnboarded : 'N/A'
      });
    }, 200);
    
    // Make debug functions available globally for testing
    (window as any).debugAuthState = debugAuthState;
    (window as any).testTokenPersistence = testTokenPersistence;
    
    // Load demo data on app initialization
    if (!isLoaded) {
      loadDemoData();
      
      // Start market simulation
      startMarketSimulation();
    }

    console.log('✅ App initialization complete');

    // Cleanup on unmount
    return () => {
      stopMarketSimulation();
    };
  }, [loadDemoData, isLoaded, initializeAuth]);

  return { isLoaded };
};