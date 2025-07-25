import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.isOnboarded) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user?.isOnboarded) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;