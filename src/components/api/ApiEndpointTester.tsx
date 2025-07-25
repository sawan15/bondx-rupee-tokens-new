import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface EndpointTest {
  name: string;
  method: string;
  url: string;
  requiresAuth: boolean;
  testData?: any;
  status: 'untested' | 'success' | 'error';
  response?: string;
}

const ApiEndpointTester: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [endpoints, setEndpoints] = useState<EndpointTest[]>([
    // Authentication endpoints
    { name: 'Health Check', method: 'GET', url: '/health', requiresAuth: false, status: 'untested' },
    
    // User endpoints
    { name: 'User Dashboard', method: 'GET', url: `/api/user/dashboard?user_id=${user?.id}`, requiresAuth: true, status: 'untested' },
    { name: 'User Portfolio', method: 'GET', url: `/api/user/portfolio?user_id=${user?.id}`, requiresAuth: true, status: 'untested' },
    { name: 'User Transactions', method: 'GET', url: `/api/user/transactions?user_id=${user?.id}`, requiresAuth: true, status: 'untested' },
    { name: 'User Wallet', method: 'GET', url: `/api/user/wallet?user_id=${user?.id}`, requiresAuth: true, status: 'untested' },
    
    // Bond endpoints
    { name: 'Bonds List', method: 'GET', url: '/api/bonds', requiresAuth: false, status: 'untested' },
    { name: 'Bond Details', method: 'GET', url: '/api/bonds/RELIANCE25', requiresAuth: false, status: 'untested' },
    
    // Order endpoints
    { name: 'User Orders', method: 'GET', url: `/api/orders?user_id=${user?.id}`, requiresAuth: true, status: 'untested' },
    { name: 'Order History', method: 'GET', url: `/api/orders/history?user_id=${user?.id}`, requiresAuth: true, status: 'untested' },
  ]);

  const [isTestingAll, setIsTestingAll] = useState(false);

  const getAuthHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    const storedToken = localStorage.getItem('bondx_auth_token');
    if (storedToken) {
      headers.Authorization = `Bearer ${storedToken}`;
    }

    if (user?.id) {
      headers['User-ID'] = user.id;
    }
    
    return headers;
  };

  const testEndpoint = async (index: number) => {
    const endpoint = endpoints[index];
    const newEndpoints = [...endpoints];
    
    try {
      const response = await fetch(`https://ff616ef0fdef.ngrok-free.app${endpoint.url}`, {
        method: endpoint.method,
        headers: endpoint.requiresAuth ? getAuthHeaders() : { 'ngrok-skip-browser-warning': 'true' },
        ...(endpoint.testData && { body: JSON.stringify(endpoint.testData) })
      });

      const responseText = await response.text();
      let parsedResponse;
      
      try {
        parsedResponse = JSON.parse(responseText);
        newEndpoints[index].status = parsedResponse.status === 'success' || response.ok ? 'success' : 'error';
        newEndpoints[index].response = JSON.stringify(parsedResponse, null, 2);
      } catch {
        // Not JSON response
        newEndpoints[index].status = response.ok ? 'success' : 'error';
        newEndpoints[index].response = responseText;
      }
    } catch (error: any) {
      newEndpoints[index].status = 'error';
      newEndpoints[index].response = error.message;
    }
    
    setEndpoints(newEndpoints);
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    
    for (let i = 0; i < endpoints.length; i++) {
      await testEndpoint(i);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between requests
    }
    
    setIsTestingAll(false);
    
    const successCount = endpoints.filter(e => e.status === 'success').length;
    const totalCount = endpoints.length;
    
    toast({
      title: "API Testing Complete",
      description: `${successCount}/${totalCount} endpoints working correctly`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '✅ Working';
      case 'error': return '❌ Error';
      default: return '⏳ Not Tested';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Endpoint Tester</h1>
          <p className="text-muted-foreground">Test all backend API endpoints from Go source</p>
        </div>
        <Button 
          onClick={testAllEndpoints} 
          disabled={isTestingAll}
          size="lg"
        >
          {isTestingAll ? 'Testing...' : 'Test All Endpoints'}
        </Button>
      </div>

      <div className="grid gap-4">
        {endpoints.map((endpoint, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mr-2">{endpoint.method}</Badge>
                    <code className="text-sm">{endpoint.url}</code>
                  </CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge className={getStatusColor(endpoint.status)}>
                    {getStatusText(endpoint.status)}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testEndpoint(index)}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {endpoint.response && (
              <CardContent className="pt-0">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-2">Response:</p>
                  <pre className="text-xs overflow-auto max-h-32">
                    {endpoint.response}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backend API Endpoints (from Go source)</CardTitle>
          <CardDescription>
            Complete list of all available endpoints in your backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Authentication:</strong></div>
            <div>• POST /api/auth/signup - User registration</div>
            <div>• POST /api/auth/login - User authentication</div>
            
            <div className="pt-2"><strong>User & Wallet:</strong></div>
            <div>• GET /api/user/dashboard - User dashboard</div>
            <div>• GET /api/user/portfolio - User portfolio</div>
            <div>• GET /api/user/transactions - Transaction history</div>
            <div>• GET /api/user/wallet - Wallet information</div>
            <div>• POST /api/user/wallet/deposit - Deposit funds</div>
            <div>• POST /api/user/wallet/withdraw - Withdraw funds</div>
            
            <div className="pt-2"><strong>Bonds:</strong></div>
            <div>• GET /api/bonds - List all bonds</div>
            <div>• GET /api/bonds/{`{symbol}`} - Bond details with OHLC & order book</div>
            
            <div className="pt-2"><strong>Orders:</strong></div>
            <div>• POST /api/orders - Place order</div>
            <div>• GET /api/orders - List user orders</div>
            <div>• GET /api/orders/history - Get order history</div>
            <div>• GET /api/orders/{`{order_id}`} - Get order details</div>
            <div>• DELETE /api/orders/{`{order_id}`} - Cancel order</div>
            
            <div className="pt-2"><strong>System:</strong></div>
            <div>• GET /health - Health check</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiEndpointTester; 