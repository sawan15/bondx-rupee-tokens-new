import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderTest from '@/components/orders/OrderTest';

const Debug = () => {
  const authState = useAuthStore();

  const testTokenPersistence = () => {
    const token = localStorage.getItem('bondx_auth_token');
    const user = localStorage.getItem('bondx_user_data');
    
    console.log('🔍 Manual Token Test:', {
      localStorage: {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'null',
        hasUser: !!user,
        userPreview: user ? JSON.parse(user).name : 'null'
      },
      authStore: {
        isAuthenticated: authState.isAuthenticated,
        isOnboarding: authState.isOnboarding,
        userName: authState.user?.name || 'null',
        hasToken: !!authState.token
      }
    });
  };

  const clearAuth = () => {
    localStorage.removeItem('bondx_auth_token');
    localStorage.removeItem('bondx_user_data');
    authState.logout();
    console.log('🧹 Cleared all auth data');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🐛 Authentication Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Auth Store State</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {JSON.stringify({
                  isAuthenticated: authState.isAuthenticated,
                  isOnboarding: authState.isOnboarding,
                  isLoading: authState.isLoading,
                  userName: authState.user?.name,
                  userId: authState.user?.id,
                  isOnboarded: authState.user?.isOnboarded,
                  hasToken: !!authState.token
                }, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">LocalStorage</h3>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {JSON.stringify({
                  hasToken: !!localStorage.getItem('bondx_auth_token'),
                  tokenPreview: localStorage.getItem('bondx_auth_token')?.substring(0, 20) + '...',
                  hasUser: !!localStorage.getItem('bondx_user_data'),
                  userPreview: localStorage.getItem('bondx_user_data') ? 
                    JSON.parse(localStorage.getItem('bondx_user_data')!).name : 'null'
                }, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button onClick={testTokenPersistence}>
              Test Token Persistence
            </Button>
            <Button onClick={clearAuth} variant="destructive">
              Clear Auth Data
            </Button>
            <Button onClick={() => authState.initializeAuth()}>
              Re-initialize Auth
            </Button>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <div className="flex space-x-2">
              <Button asChild size="sm">
                <a href="/marketplace">Marketplace</a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="/onboarding">Onboarding</a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="/signin">Signin</a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="/">Home</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders API Testing */}
      <OrderTest />
    </div>
  );
};

export default Debug; 