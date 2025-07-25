import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ApiService, OrderRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface FractionalOrder {
  id: string;
  symbol: string;
  order_type: 'buy' | 'sell';
  order_mode: 'market' | 'limit';
  status: 'pending' | 'completed' | 'cancelled' | 'partial';
  quantity: string;
  price: string;
  amount: string;
  filled_quantity: string;
  filled_amount: string;
  created_at: string;
  updated_at: string;
}

const FractionalOrdersManager: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<FractionalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Fractional trading form state
  const [orderForm, setOrderForm] = useState({
    bond_symbol: 'RELIANCE25',
    order_type: 'buy' as 'buy' | 'sell',
    amount: '',
    price: '',
    order_mode: 'market' as 'market' | 'limit'
  });

  // Calculate fractional quantity based on amount and price
  const calculateFractionalQuantity = () => {
    if (!orderForm.amount) return '0';
    
    const amount = parseFloat(orderForm.amount);
    let price = 0;
    
    if (orderForm.order_mode === 'limit' && orderForm.price) {
      price = parseFloat(orderForm.price);
    } else {
      // For market orders, use estimated market price
      price = 1050; // Example market price - should come from real market data
    }
    
    if (price > 0) {
      const fractionalQuantity = amount / price;
      return fractionalQuantity.toFixed(6);
    }
    
    return '0';
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await ApiService.getUserOrders(user.id, { limit: 20 });
      console.log('🔍 Orders API Response:', response);
      
      if (response.status === 'success') {
        // Handle both possible response formats:
        // 1. Backend returns direct array: response.data = [...]
        // 2. Backend returns nested: response.data = {orders: [...], pagination: {...}}
        let ordersArray = [];
        if (Array.isArray(response.data)) {
          ordersArray = response.data;
        } else if (response.data?.orders && Array.isArray(response.data.orders)) {
          ordersArray = response.data.orders;
        }
        
        console.log('📋 Processed orders:', ordersArray);
        
        // Map backend field names to frontend expected format
        const mappedOrders = ordersArray.map((order: any) => ({
          ...order,
          id: order.id || order.order_id || order._id, // Handle different ID field names
        }));
        
        console.log('🔧 Mapped orders with IDs:', mappedOrders);
        setOrders(mappedOrders);
      }
    } catch (error: any) {
      console.error('❌ Orders fetch error:', error);
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!user?.id || !orderForm.amount || !orderForm.bond_symbol) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData: OrderRequest = {
        user_id: user.id,
        bond_symbol: orderForm.bond_symbol,
        order_type: orderForm.order_type,
        amount: orderForm.amount,
        order_mode: orderForm.order_mode,
        ...(orderForm.order_mode === 'limit' && { price: orderForm.price })
      };

      const response = await ApiService.placeOrder(orderData);
      if (response.status === 'success') {
        const fractionalQty = calculateFractionalQuantity();
        toast({
          title: "✅ Order Placed Successfully",
          description: `${orderForm.order_type.toUpperCase()} order for ₹${orderForm.amount} (${fractionalQty} units) of ${orderForm.bond_symbol}`,
        });
        
        // Reset form
        setOrderForm({
          bond_symbol: 'RELIANCE25',
          order_type: 'buy',
          amount: '',
          price: '',
          order_mode: 'market'
        });
        fetchOrders();
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    console.log('🗑️ Cancelling order with ID:', orderId);
    
    if (!orderId || orderId === 'undefined') {
      toast({
        title: "Cancel Failed",
        description: "Order ID is missing or invalid",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await ApiService.cancelOrder(orderId);
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully"
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">💰 Fractional Bond Trading</h1>
        <Button onClick={fetchOrders} variant="outline">
          Refresh Orders
        </Button>
      </div>

      {/* Place New Order Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Place New Order (Amount-Based)
          </CardTitle>
          <CardDescription>
            Enter the amount you want to invest and get fractional units
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bond-symbol">Bond Symbol</Label>
              <Select 
                value={orderForm.bond_symbol} 
                onValueChange={(value) => setOrderForm({...orderForm, bond_symbol: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RELIANCE25">RELIANCE25</SelectItem>
                  <SelectItem value="TATA24">TATA24</SelectItem>
                  <SelectItem value="HDFC26">HDFC26</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="order-type">Order Type</Label>
              <Select 
                value={orderForm.order_type} 
                onValueChange={(value) => setOrderForm({...orderForm, order_type: value as 'buy' | 'sell'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Buy
                    </div>
                  </SelectItem>
                  <SelectItem value="sell">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      Sell
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount">Investment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to invest"
                value={orderForm.amount}
                onChange={(e) => setOrderForm({...orderForm, amount: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="order-mode">Order Mode</Label>
              <Select 
                value={orderForm.order_mode} 
                onValueChange={(value) => setOrderForm({...orderForm, order_mode: value as 'market' | 'limit'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit">Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {orderForm.order_mode === 'limit' && (
              <div className="md:col-span-2">
                <Label htmlFor="price">Limit Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter limit price"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({...orderForm, price: e.target.value})}
                />
              </div>
            )}
          </div>
          
          {/* Fractional Quantity Display */}
          {orderForm.amount && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800">
                💎 You will receive approximately <span className="font-bold text-lg">{calculateFractionalQuantity()}</span> fractional units
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Based on {orderForm.order_mode === 'limit' ? 'your limit price' : 'current market price'}
              </div>
            </div>
          )}
          
          <Button 
            onClick={placeOrder}
            disabled={isPlacingOrder || !orderForm.amount || !orderForm.bond_symbol}
            className="w-full"
            size="lg"
          >
            {isPlacingOrder ? (
              "Placing Order..."
            ) : (
              `${orderForm.order_type === 'buy' ? '🟢 BUY' : '🔴 SELL'} ₹${orderForm.amount || '0'} worth of ${orderForm.bond_symbol}`
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found. Place your first fractional order above!
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={order.order_type === 'buy' ? 'default' : 'secondary'}>
                      {order.order_type.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="font-medium">{order.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{order.amount} • {order.quantity} units • {order.order_mode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'pending' ? 'secondary' :
                      order.status === 'cancelled' ? 'destructive' : 'outline'
                    }>
                      {order.status}
                    </Badge>
                    {order.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FractionalOrdersManager; 