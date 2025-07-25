import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated, resetDemo, startOnboarding, isDemoMode, currentDemoType, exitDemo } = useAuthStore();
  const { wallet } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Wallet', path: '/wallet' },
    { name: 'History', path: '/history' },
    { name: 'Learn', path: '/learn' }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(balance);
  };

  return (
    <header className="sticky top-0 z-50 bg-nav-background/95 backdrop-blur-md border-b border-nav-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold gradient-text">BondX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item relative ${
                  isActiveRoute(item.path) 
                    ? 'text-primary font-semibold' 
                    : 'text-nav-foreground hover:text-primary'
                }`}
              >
                {item.name}
                {isActiveRoute(item.path) && (
                  <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search bonds..."
                    className="w-64 pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full text-xs"></span>
                </Button>

                {/* Wallet Balance */}
                <Link to="/wallet">
                  <div className="glass-card px-4 py-2 hover:bg-muted/80 transition-colors cursor-pointer">
                    <div className="text-xs text-muted-foreground">INR Tokens</div>
                    <div className="font-semibold text-success">
                      {formatBalance(wallet.inrTokenBalance)}
                    </div>
                  </div>
                </Link>

                {/* Demo Mode Indicator */}
                {isDemoMode && (
                  <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-1">
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-200">
                      🎭 Demo: {currentDemoType === 'new_investor' ? 'Arjun' : 'Priya'}
                    </div>
                  </div>
                )}

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.isVerified && (
                        <span className="text-success">● Verified</span>
                      )}
                    </div>
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.avatar || user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Demo Controls */}
                {isDemoMode && (
                  <div className="flex items-center space-x-2 pl-4 border-l border-border">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        exitDemo();
                        window.location.href = '/';
                      }}
                      className="text-muted-foreground"
                    >
                      Exit Demo
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={resetDemo}
                    >
                      Reset Demo
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/onboarding">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-nav-border py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-item ${
                    isActiveRoute(item.path) 
                      ? 'text-primary font-semibold' 
                      : 'text-nav-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Wallet */}
              <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="pt-4 border-t border-nav-border">
                  <div className="text-sm text-muted-foreground">Wallet Balance</div>
                  <div className="text-lg font-semibold text-success">
                    {formatBalance(wallet.inrTokenBalance)}
                  </div>
                </div>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;