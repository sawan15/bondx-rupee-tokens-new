import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  IndianRupee
} from 'lucide-react';
import { DepositFlow } from '@/components/wallet/DepositFlow';
import { WithdrawFlow } from '@/components/wallet/WithdrawFlow';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { toast } from '@/hooks/use-toast';

const Wallet = () => {
  const { wallet, portfolio, user } = useAppStore();
  const [showDepositFlow, setShowDepositFlow] = useState(false);
  const [showWithdrawFlow, setShowWithdrawFlow] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Transaction ID copied successfully"
    });
  };

  const dailyDepositProgress = (wallet.todayDeposited / wallet.dailyDepositLimit) * 100;
  const monthlyDepositProgress = (wallet.monthDeposited / wallet.monthlyDepositLimit) * 100;

  if (showDepositFlow) {
    return (
      <DepositFlow 
        onBack={() => setShowDepositFlow(false)}
        onComplete={() => {
          setShowDepositFlow(false);
          toast({
            title: "Deposit Successful!",
            description: "Your INR tokens have been added to your wallet."
          });
        }}
      />
    );
  }

  if (showWithdrawFlow) {
    return (
      <WithdrawFlow 
        onBack={() => setShowWithdrawFlow(false)}
        onComplete={() => {
          setShowWithdrawFlow(false);
          toast({
            title: "Withdrawal Initiated!",
            description: "Your funds will be credited to your bank account within 2-4 hours."
          });
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <WalletIcon className="inline-block w-10 h-10 mr-3 text-primary" />
          My Wallet
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your INR tokens, deposit funds, and track your trading capital. 
          All funds are held securely in RBI-compliant escrow accounts.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Main Balance */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              INR Token Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-4">
              {formatNumber(wallet.inrTokenBalance)} INR
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Available to Trade</div>
                <div className="text-xl font-semibold text-success">
                  {formatCurrency(wallet.availableBalance)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ready for bond purchases
                </div>
              </div>
              
              <div className="glass-card p-4">
                <div className="text-sm text-muted-foreground mb-1">Reserved in Orders</div>
                <div className="text-xl font-semibold text-warning">
                  {formatCurrency(wallet.reservedBalance)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Locked in pending trades
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowDepositFlow(true)}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowWithdrawFlow(true)}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
              <Button variant="ghost" size="icon">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              Security & Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Security Badges */}
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center py-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                RBI Compliant
              </Badge>
              <Badge variant="secondary" className="w-full justify-center py-2">
                <Shield className="w-3 h-3 mr-1" />
                Funds in Escrow
              </Badge>
              <Badge variant="secondary" className="w-full justify-center py-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                256-bit SSL
              </Badge>
            </div>

            {/* Daily Limit */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Daily Deposit Limit</span>
                <span>{formatCurrency(wallet.todayDeposited)} / {formatCurrency(wallet.dailyDepositLimit)}</span>
              </div>
              <Progress value={dailyDepositProgress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(wallet.dailyDepositLimit - wallet.todayDeposited)} remaining today
              </div>
            </div>

            {/* Monthly Limit */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Monthly Deposit Limit</span>
                <span>{formatCurrency(wallet.monthDeposited)} / {formatCurrency(wallet.monthlyDepositLimit)}</span>
              </div>
              <Progress value={monthlyDepositProgress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(wallet.monthlyDepositLimit - wallet.monthDeposited)} remaining this month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Panels */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* How INR Tokens Work */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              How INR Tokens Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              INR Tokens are digital currency pegged 1:1 to Indian Rupees. Use them to buy 
              fractional bond tokens instantly. Convert back to cash anytime with no fees.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Zero conversion fees</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Instant bond token purchases</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Fractional ownership starting ₹100</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>24/7 trading capability</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 glass-card">
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(wallet.todayDeposited)}
                </div>
                <div className="text-xs text-muted-foreground">Deposited</div>
              </div>
              
              <div className="text-center p-3 glass-card">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(portfolio.totalInvested)}
                </div>
                <div className="text-xs text-muted-foreground">Invested</div>
              </div>
            </div>
            
            <div className="text-center p-3 glass-card">
              <div className="text-lg font-semibold">
                {portfolio.holdings.length} Active Positions
              </div>
              <div className="text-xs text-muted-foreground">
                Across {new Set(portfolio.holdings.map(h => h.bondId)).size} different bonds
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistory 
            transactions={wallet.transactionHistory.slice(0, 10)}
            onCopyTransactionId={copyToClipboard}
          />
          
          {wallet.transactionHistory.length > 10 && (
            <div className="text-center mt-4">
              <Button variant="outline">
                View All Transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;