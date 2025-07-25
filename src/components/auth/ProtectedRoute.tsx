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
    // Wait a brief moment for auth initialization to complete
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after we've finished checking auth state
    if (!isCheckingAuth && !isLoading) {
      console.log('🔒 ProtectedRoute check:', { 
        isAuthenticated, 
        isOnboarded: user?.isOnboarded,
        userName: user?.name 
      });
      
      if (!isAuthenticated || !user?.isOnboarded) {
        console.log('🚫 Redirecting to onboarding');
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, user, navigate, isCheckingAuth, isLoading]);

  // Show loading while checking auth state
  if (isCheckingAuth || isLoading) {
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
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;