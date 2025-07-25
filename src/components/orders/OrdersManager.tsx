import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ApiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Eye, RefreshCw, Filter, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Order {
  order_id: string;
  user_id: string;
  bond_symbol: string;
  order_type: 'buy' | 'sell';
  quantity: string;
  price: string;
  order_mode: 'market' | 'limit';
  status: 'pending' | 'completed' | 'cancelled' | 'partial';
  total_amount: string;
  created_at: string;
  expires_at: string;
}

interface OrderFilters {
  bond_symbol?: string;
  status?: 'pending' | 'completed' | 'cancelled' | 'partial';
  order_type?: 'buy' | 'sell';
  from_date?: string;
  to_date?: string;
}

const OrdersManager: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false
  });

  // Place new order form state
  const [newOrder, setNewOrder] = useState({
    bond_symbol: '',
    order_type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: '',
    order_mode: 'market' as 'market' | 'limit'
  });

  const [activeTab, setActiveTab] = useState('current');

  const fetchOrders = async (isHistory = false) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const options = {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset
      };

      const response = isHistory 
        ? await ApiService.getOrderHistory(user.id, options)
        : await ApiService.getUserOrders(user.id, options);

      if (response.status === 'success') {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await ApiService.getOrderDetails(orderId);
      if (response.status === 'success') {
        setSelectedOrder(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching order details",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await ApiService.cancelOrder(orderId);
      if (response.status === 'success') {
        toast({
          title: "Order Cancelled",
          description: "Order has been successfully cancelled",
        });
        fetchOrders(activeTab === 'history');
      }
    } catch (error: any) {
      toast({
        title: "Error cancelling order",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const placeOrder = async () => {
    if (!user?.id) return;

    try {
      const orderData = {
        user_id: user.id,
        bond_symbol: newOrder.bond_symbol,
        order_type: newOrder.order_type,
        quantity: newOrder.quantity,
        order_mode: newOrder.order_mode,
        ...(newOrder.order_mode === 'limit' && { price: newOrder.price })
      };

      const response = await ApiService.placeOrder(orderData);
      if (response.status === 'success') {
        toast({
          title: "Order Placed Successfully",
          description: `${newOrder.order_type.toUpperCase()} order for ${newOrder.quantity} ${newOrder.bond_symbol} has been placed`,
        });
        
        // Reset form
        setNewOrder({
          bond_symbol: '',
          order_type: 'buy',
          quantity: '',
          price: '',
          order_mode: 'market'
        });
        
        fetchOrders();
      }
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders(activeTab === 'history');
  }, [user?.id, filters, pagination.offset, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'PPp');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <Button onClick={() => fetchOrders(activeTab === 'history')} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Orders</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
          <TabsTrigger value="place">Place New Order</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="bond-filter">Bond Symbol</Label>
                <Input
                  id="bond-filter"
                  placeholder="e.g., RELIANCE25"
                  value={filters.bond_symbol || ''}
                  onChange={(e) => setFilters({...filters, bond_symbol: e.target.value || undefined})}
                />
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select 
                  value={filters.status || 'all'} 
                  onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type-filter">Order Type</Label>
                <Select 
                  value={filters.order_type || 'all'} 
                  onValueChange={(value) => setFilters({...filters, order_type: value === 'all' ? undefined : value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => fetchOrders()} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.order_id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-sm text-muted-foreground">Bond Symbol</p>
                        <p className="font-semibold">{order.bond_symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <Badge variant={order.order_type === 'buy' ? 'default' : 'secondary'}>
                          {order.order_type.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-semibold">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">₹{parseFloat(order.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mode</p>
                        <p className="font-semibold capitalize">{order.order_mode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm">{formatDateTime(order.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrderDetails(order.order_id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {order.status === 'pending' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this order? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancelOrder(order.order_id)}>
                                Yes, Cancel Order
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({...prev, offset: Math.max(0, prev.offset - prev.limit)}))}
                  disabled={pagination.offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({...prev, offset: prev.offset + prev.limit}))}
                  disabled={!pagination.has_more}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Date Range Filters for History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="datetime-local"
                  value={filters.from_date || ''}
                  onChange={(e) => setFilters({...filters, from_date: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                />
              </div>
              <div>
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="datetime-local"
                  value={filters.to_date || ''}
                  onChange={(e) => setFilters({...filters, to_date: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={() => fetchOrders(true)} className="w-full">
                  Apply Date Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Same order list as current orders */}
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.order_id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-sm text-muted-foreground">Bond Symbol</p>
                        <p className="font-semibold">{order.bond_symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <Badge variant={order.order_type === 'buy' ? 'default' : 'secondary'}>
                          {order.order_type.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-semibold">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">₹{parseFloat(order.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mode</p>
                        <p className="font-semibold capitalize">{order.order_mode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm">{formatDateTime(order.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrderDetails(order.order_id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="place" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Place New Order</CardTitle>
              <CardDescription>
                Create a new buy or sell order for bonds using market or limit pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bond-symbol">Bond Symbol</Label>
                <Input
                  id="bond-symbol"
                  placeholder="e.g., RELIANCE25"
                  value={newOrder.bond_symbol}
                  onChange={(e) => setNewOrder({...newOrder, bond_symbol: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="order-type">Order Type</Label>
                <Select 
                  value={newOrder.order_type} 
                  onValueChange={(value) => setNewOrder({...newOrder, order_type: value as 'buy' | 'sell'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Number of bonds"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="order-mode">Order Mode</Label>
                <Select 
                  value={newOrder.order_mode} 
                  onValueChange={(value) => setNewOrder({...newOrder, order_mode: value as 'market' | 'limit'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newOrder.order_mode === 'limit' && (
                <div className="md:col-span-2">
                  <Label htmlFor="price">Limit Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Price per bond"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({...newOrder, price: e.target.value})}
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <Button 
                  onClick={placeOrder}
                  className="w-full"
                  disabled={!newOrder.bond_symbol || !newOrder.quantity || (newOrder.order_mode === 'limit' && !newOrder.price)}
                >
                  Place {newOrder.order_type.toUpperCase()} Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {selectedOrder && (
        <AlertDialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Order Details</AlertDialogTitle>
              <AlertDialogDescription>
                Detailed information for order {selectedOrder.order_id}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm">{selectedOrder.order_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bond Symbol</p>
                <p className="font-semibold">{selectedOrder.bond_symbol}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Type</p>
                <Badge variant={selectedOrder.order_type === 'buy' ? 'default' : 'secondary'}>
                  {selectedOrder.order_type.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Mode</p>
                <p className="font-semibold capitalize">{selectedOrder.order_mode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-semibold">{selectedOrder.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold">₹{parseFloat(selectedOrder.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold">₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="text-sm">{formatDateTime(selectedOrder.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expires At</p>
                <p className="text-sm">{formatDateTime(selectedOrder.expires_at)}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setSelectedOrder(null)}>
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default OrdersManager; 