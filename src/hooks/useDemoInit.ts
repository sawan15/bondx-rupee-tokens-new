import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useDemoInit = () => {
  const { switchDemoAccount } = useAuthStore();

  useEffect(() => {
    // Check if user has real authentication first
    const realToken = localStorage.getItem('bondx_auth_token');
    const realUser = localStorage.getItem('bondx_user_data');
    
    console.log('🎭 Demo Init Check:', { 
      hasRealToken: !!realToken, 
      hasRealUser: !!realUser,
      shouldSkipDemo: !!(realToken && realUser)
    });
    
    // Only activate demo mode if there's no real authentication
    if (realToken && realUser) {
      console.log('🚫 Skipping demo mode - real authentication exists');
      return;
    }
    
    // Check for demo mode in localStorage on app init
    const demoMode = localStorage.getItem('bondx_demo_mode');
    if (demoMode && (demoMode === 'new_investor' || demoMode === 'experienced_investor')) {
      console.log('🎭 Activating demo mode:', demoMode);
      switchDemoAccount(demoMode);
    }
  }, [switchDemoAccount]);
};