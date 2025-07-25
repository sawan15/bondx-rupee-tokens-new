import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute mounted, waiting for auth initialization...');
    // Wait longer for auth initialization to complete
    const timer = setTimeout(() => {
      console.log('⏰ ProtectedRoute timer finished, ready to check auth');
      setIsCheckingAuth(false);
    }, 300); // Increased from 100ms to 300ms

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after we've finished checking auth state
    if (!isCheckingAuth && !isLoading) {
      console.log('🔒 ProtectedRoute check:', { 
        isAuthenticated, 
        isOnboarded: user?.isOnboarded,
        userName: user?.name,
        isCheckingAuth,
        isLoading,
        currentPath: window.location.pathname
      });
      
      if (!isAuthenticated) {
        console.log('🚫 No authentication - redirecting to onboarding');
        navigate('/onboarding');
      } else if (isAuthenticated && !user?.isOnboarded) {
        console.log('🚫 User authenticated but onboarding incomplete - redirecting to onboarding');
        navigate('/onboarding');
      } else {
        console.log('✅ User is fully authenticated and onboarded - allowing access');
      }
    } else {
      console.log('⏳ Still checking auth state...', { isCheckingAuth, isLoading });
    }
  }, [isAuthenticated, user, navigate, isCheckingAuth, isLoading]);

  // Show loading while checking auth state
  if (isCheckingAuth || isLoading) {
    console.log('🔄 ProtectedRoute showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isOnboarded) {
    console.log('🚫 ProtectedRoute blocking access - user not ready');
    return null;
  }

  console.log('✅ ProtectedRoute allowing access');
  return <>{children}</>;
};

export default ProtectedRoute;