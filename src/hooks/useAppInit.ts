import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore, debugAuthState } from '@/stores/authStore';
import { startMarketSimulation, stopMarketSimulation } from '@/stores/appStore';

export const useAppInit = () => {
  const loadDemoData = useAppStore((state) => state.loadDemoData);
  const isLoaded = useAppStore((state) => state.marketplace.bondTokens.length > 0);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize authentication from localStorage
    initializeAuth();
    
    // Make debug function available globally for testing
    (window as any).debugAuthState = debugAuthState;
    
    // Load demo data on app initialization
    if (!isLoaded) {
      loadDemoData();
      
      // Start market simulation
      startMarketSimulation();
    }

    // Cleanup on unmount
    return () => {
      stopMarketSimulation();
    };
  }, [loadDemoData, isLoaded, initializeAuth]);

  return { isLoaded };
};