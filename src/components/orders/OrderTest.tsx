import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ApiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const OrderTest: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPlaceOrder = async () => {
    if (!user?.id) {
      addResult("❌ No user logged in");
      return;
    }

    setIsLoading(true);
    addResult("🚀 Testing order placement with ngrok endpoint...");

    try {
      const orderData = {
        user_id: user.id,
        bond_symbol: "RELIANCE25",
        order_type: "buy" as const,
        quantity: "10",
        order_mode: "market" as const
      };

      addResult(`📤 Sending POST to: https://ff616ef0fdef.ngrok-free.app/api/orders`);
      addResult(`📤 Order data: ${JSON.stringify(orderData, null, 2)}`);

      const response = await ApiService.placeOrder(orderData);
      
      if (response.status === 'success') {
        addResult(`✅ Order placed successfully! Order ID: ${response.data.order_id}`);
        addResult(`✅ Response: ${JSON.stringify(response, null, 2)}`);
      } else {
        addResult(`❌ Order failed: ${response.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
      console.error('Order placement error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetOrders = async () => {
    if (!user?.id) {
      addResult("❌ No user logged in");
      return;
    }

    setIsLoading(true);
    addResult("📋 Testing get orders with ngrok endpoint...");

    try {
      addResult(`📤 Sending GET to: https://ff616ef0fdef.ngrok-free.app/api/orders?user_id=${user.id}`);
      
      const response = await ApiService.getUserOrders(user.id, {
        limit: 10,
        offset: 0
      });
      
      if (response.status === 'success') {
        addResult(`✅ Orders retrieved! Found ${response.data.orders.length} orders`);
        addResult(`✅ Total orders: ${response.data.pagination.total}`);
        response.data.orders.forEach((order, index) => {
          addResult(`📋 Order ${index + 1}: ${order.bond_symbol} ${order.order_type} ${order.quantity} (${order.status})`);
        });
      } else {
        addResult(`❌ Get orders failed: ${response.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
      console.error('Get orders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testOrderHistory = async () => {
    if (!user?.id) {
      addResult("❌ No user logged in");
      return;
    }

    setIsLoading(true);
    addResult("📚 Testing order history with ngrok endpoint...");

    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30); // Last 30 days
      
      addResult(`📤 Sending GET to: https://ff616ef0fdef.ngrok-free.app/api/orders/history`);
      
      const response = await ApiService.getOrderHistory(user.id, {
        from_date: fromDate.toISOString(),
        to_date: new Date().toISOString(),
        limit: 20
      });
      
      if (response.status === 'success') {
        addResult(`✅ Order history retrieved! Found ${response.data.orders.length} historical orders`);
        addResult(`✅ Total historical orders: ${response.data.pagination.total}`);
      } else {
        addResult(`❌ Get order history failed: ${response.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
      console.error('Order history error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Orders API Integration Test</CardTitle>
          <CardDescription>
            Test the OpenAPI-compliant orders endpoints using ngrok: https://ff616ef0fdef.ngrok-free.app/api
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testPlaceOrder} disabled={isLoading}>
              🚀 Test Place Order
            </Button>
            <Button onClick={testGetOrders} disabled={isLoading}>
              📋 Test Get Orders
            </Button>
            <Button onClick={testOrderHistory} disabled={isLoading}>
              📚 Test Order History
            </Button>
            <Button onClick={clearResults} variant="outline">
              🧹 Clear Results
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>API Endpoint</Label>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                https://ff616ef0fdef.ngrok-free.app/api
              </code>
            </div>
            
            <div className="flex justify-between items-center">
              <Label>Current User</Label>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {user?.name || 'Not logged in'} ({user?.id || 'No ID'})
              </code>
            </div>
            
            <div className="flex justify-between items-center">
              <Label>Authentication</Label>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                Bearer Token {localStorage.getItem('bondx_auth_token') ? '✅' : '❌'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
              {isLoading && (
                <div className="animate-pulse">
                  ⏳ Processing...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderTest; 