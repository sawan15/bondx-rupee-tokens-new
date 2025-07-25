import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isOnboarding } = useAuthStore();
  
  // Hide header during onboarding or on onboarding page
  const isOnboardingPage = location.pathname === '/onboarding';
  const shouldHideHeader = isOnboarding || isOnboardingPage;
  
  return (
    <div className="min-h-screen bg-gradient-bg">
      {!shouldHideHeader && <Header />}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${shouldHideHeader ? 'py-0' : 'py-8'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;