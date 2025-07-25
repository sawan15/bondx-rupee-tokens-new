import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ApiService, WalletResponse, DepositRequest, Transaction } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  History, 
  Shield, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Copy,
  IndianRupee,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Wallet = () => {
  const { user } = useAuthStore();
  
  // API State
  const [walletData, setWalletData] = useState<WalletResponse['data'] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Deposit Form State
  const [depositForm, setDepositForm] = useState({
    amount: '',
    payment_method: 'UPI' as const,
    transaction_reference: '',
    notes: ''
  });

  // Withdraw Form State
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bank_account_id: '',
    notes: ''
  });

  // Fetch wallet data and transactions
  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch wallet data
      const walletResponse = await ApiService.getUserWallet(user.id);
      if (walletResponse.status === 'success') {
        setWalletData(walletResponse.data);
      }

      // Fetch transaction history (will return 501 for now)
      try {
        const transactionResponse = await ApiService.getTransactionHistory(user.id, { limit: 10 });
        if (transactionResponse.status === 'success') {
          setTransactions(transactionResponse.data.transactions);
        }
      } catch (transactionError) {
        // Expected 501 error for transaction history
        console.log('Transaction history not yet implemented (501)');
        setTransactions([]);
      }

    } catch (err: any) {
      setError(err.message);
      // Fallback data
      setWalletData({
        balance: "0",
        blocked_amount: "0",
        available: "0",
        total_deposited: "0",
        max_deposit_limit: "1000000"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!user?.id || !depositForm.amount || !depositForm.transaction_reference) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsDepositing(true);
    
    try {
      const depositData: DepositRequest = {
        user_id: user.id,
        amount: depositForm.amount,
        payment_method: depositForm.payment_method,
        transaction_reference: depositForm.transaction_reference,
        notes: depositForm.notes || undefined
      };

      const response = await ApiService.depositFunds(depositData);
      
      if (response.status === 'success') {
        toast({
          title: "Deposit Successful",
          description: `₹${depositForm.amount} has been added to your wallet. Transaction ID: ${response.data.transaction_id}`,
        });
        
        // Reset form
        setDepositForm({
          amount: '',
          payment_method: 'UPI',
          transaction_reference: '',
          notes: ''
        });
        
        // Refresh wallet data
        await fetchWalletData();
        setActiveTab('overview');
      }
    } catch (err: any) {
      toast({
        title: "Deposit Failed",
        description: err.message || "Failed to process deposit",
        variant: "destructive"
      });
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle withdrawal (will return 501)
  const handleWithdraw = async () => {
    if (!user?.id || !withdrawForm.amount || !withdrawForm.bank_account_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);
    
    try {
      await ApiService.withdrawFunds({
        user_id: user.id,
        amount: withdrawForm.amount,
        bank_account_id: withdrawForm.bank_account_id,
        notes: withdrawForm.notes || undefined
      });
    } catch (err: any) {
      toast({
        title: "Withdrawal Not Available",
        description: "Withdrawal feature is not yet implemented (501)",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Transaction ID copied successfully"
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
            <p className="text-muted-foreground">Loading wallet data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Fetching wallet data from API...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !walletData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
            <p className="text-muted-foreground text-red-600">Error loading wallet: {error}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Failed to load wallet data. Please check if your backend API is running.
            </p>
            <div className="space-x-2">
              <Button onClick={fetchWalletData}>Retry</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableAmount = parseFloat(walletData?.available || '0');
  const blockedAmount = parseFloat(walletData?.blocked_amount || '0');
  const totalDeposited = parseFloat(walletData?.total_deposited || '0');
  const maxDepositLimit = parseFloat(walletData?.max_deposit_limit || '1000000');
  const depositProgress = (totalDeposited / maxDepositLimit) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds and view transaction history
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {/* API Status Indicator */}
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${walletData ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-muted-foreground">
              {walletData ? 'API Connected' : 'API Disconnected'}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={fetchWalletData}
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="w-5 h-5 text-primary" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(walletData?.balance || '0')}
            </div>
            <p className="text-sm text-muted-foreground">
              Available for trading and investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-success" />
              Available Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success mb-2">
              {formatCurrency(availableAmount)}
            </div>
            <p className="text-sm text-muted-foreground">
              Ready for bond purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-warning" />
              Blocked Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning mb-2">
              {formatCurrency(blockedAmount)}
            </div>
            <p className="text-sm text-muted-foreground">
              Locked in pending orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Limit Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit Limit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Total Deposited</span>
                <span>{formatCurrency(totalDeposited)} / {formatCurrency(maxDepositLimit)}</span>
              </div>
              <Progress value={depositProgress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(maxDepositLimit - totalDeposited)} remaining (₹10 lakh limit)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Actions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Transaction History Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Transaction history feature is planned for the next release (API returns 501)
                </p>
                <Badge variant="secondary">Feature in Development</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <h4 className="font-semibold">RBI Compliant</h4>
                    <p className="text-sm text-muted-foreground">Regulated financial platform</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <CheckCircle className="w-8 h-8 text-success" />
                  <div>
                    <h4 className="font-semibold">Bank Grade Security</h4>
                    <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Funds to Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm(prev => ({...prev, amount: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select 
                    value={depositForm.payment_method} 
                    onValueChange={(value: any) => setDepositForm(prev => ({...prev, payment_method: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="transaction_reference">Transaction Reference</Label>
                <Input
                  id="transaction_reference"
                  placeholder="Payment gateway reference ID"
                  value={depositForm.transaction_reference}
                  onChange={(e) => setDepositForm(prev => ({...prev, transaction_reference: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for this deposit"
                  value={depositForm.notes}
                  onChange={(e) => setDepositForm(prev => ({...prev, notes: e.target.value}))}
                />
              </div>

              <Button 
                onClick={handleDeposit} 
                disabled={isDepositing || !depositForm.amount || !depositForm.transaction_reference}
                className="w-full"
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Deposit...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Deposit Funds
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-orange-700">
                    Withdrawal feature is currently in development and will return a 501 error.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="withdraw_amount">Amount (₹)</Label>
                  <Input
                    id="withdraw_amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm(prev => ({...prev, amount: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="bank_account">Bank Account</Label>
                  <Input
                    id="bank_account"
                    placeholder="Bank account ID"
                    value={withdrawForm.bank_account_id}
                    onChange={(e) => setWithdrawForm(prev => ({...prev, bank_account_id: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="withdraw_notes">Notes (Optional)</Label>
                <Textarea
                  id="withdraw_notes"
                  placeholder="Add any notes for this withdrawal"
                  value={withdrawForm.notes}
                  onChange={(e) => setWithdrawForm(prev => ({...prev, notes: e.target.value}))}
                />
              </div>

              <Button 
                onClick={handleWithdraw} 
                disabled={isWithdrawing || !withdrawForm.amount || !withdrawForm.bank_account_id}
                className="w-full"
                variant="outline"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Withdraw Funds (501 - In Development)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Wallet;