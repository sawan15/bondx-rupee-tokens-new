import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useDemoInit = () => {
  const { switchDemoAccount } = useAuthStore();

  useEffect(() => {
    // Check for demo mode in localStorage on app init
    const demoMode = localStorage.getItem('bondx_demo_mode');
    if (demoMode && (demoMode === 'new_investor' || demoMode === 'experienced_investor')) {
      switchDemoAccount(demoMode);
    }
  }, [switchDemoAccount]);
};