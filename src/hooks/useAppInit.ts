import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { startMarketSimulation } from '@/stores/appStore';

export const useAppInit = () => {
  const loadDemoData = useAppStore((state) => state.loadDemoData);
  const isLoaded = useAppStore((state) => state.marketplace.bondTokens.length > 0);

  useEffect(() => {
    // Load demo data on app initialization
    if (!isLoaded) {
      loadDemoData();
      
      // Start market simulation
      startMarketSimulation();
    }

    // Cleanup on unmount
    return () => {
      const { stopMarketSimulation } = require('@/stores/appStore');
      stopMarketSimulation();
    };
  }, [loadDemoData, isLoaded]);

  return { isLoaded };
};