import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Smartphone, 
  CreditCard, 
  Building2, 
  CheckCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DepositFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'amount' | 'method' | 'preview' | 'processing' | 'success';

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'PhonePe, GooglePay, Paytm',
    time: 'Instant',
    icon: Smartphone,
    recommended: true
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    description: 'All major banks supported',
    time: '2-5 minutes',
    icon: Building2,
    recommended: false
  },
  {
    id: 'neft',
    name: 'NEFT Transfer',
    description: 'Bank transfer',
    time: '30 minutes',
    icon: CreditCard,
    recommended: false
  }
];

export const DepositFlow = ({ onBack, onComplete }: DepositFlowProps) => {
  const { wallet, depositFunds } = useAppStore();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [processingStep, setProcessingStep] = useState(0);

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

  const validateAmount = (value: string): string | null => {
    const numAmount = parseInt(value.replace(/,/g, ''));
    
    if (!numAmount || numAmount < 1000) {
      return 'Minimum deposit is ₹1,000';
    }
    
    if (numAmount > wallet.dailyDepositLimit) {
      return `Maximum daily deposit is ${formatCurrency(wallet.dailyDepositLimit)}`;
    }
    
    const remainingDaily = wallet.dailyDepositLimit - wallet.todayDeposited;
    if (numAmount > remainingDaily) {
      return `You can deposit ${formatCurrency(remainingDaily)} more today`;
    }
    
    const remainingMonthly = wallet.monthlyDepositLimit - wallet.monthDeposited;
    if (numAmount > remainingMonthly) {
      return `Monthly limit exceeded. You can deposit ${formatCurrency(remainingMonthly)} more this month`;
    }
    
    return null;
  };

  const handleAmountChange = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format with commas
    if (numbers) {
      const formatted = new Intl.NumberFormat('en-IN').format(parseInt(numbers));
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(formatNumber(quickAmount));
  };

  const proceedToMethod = () => {
    const error = validateAmount(amount);
    if (error) {
      toast({
        title: "Invalid Amount",
        description: error,
        variant: "destructive"
      });
      return;
    }
    setStep('method');
  };

  const proceedToPreview = () => {
    setStep('preview');
  };

  const startProcessing = async () => {
    setStep('processing');
    
    const steps = [
      'Connecting to your bank...',
      'Verifying payment details...',
      'Converting to INR tokens...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Update wallet balance
    const depositAmount = parseInt(amount.replace(/,/g, ''));
    await depositFunds(depositAmount, selectedMethod);
    
    setStep('success');
    setTimeout(onComplete, 2000);
  };

  const numAmount = amount ? parseInt(amount.replace(/,/g, '')) : 0;
  const processingFee = 0; // No fees for demo
  const tokensReceived = numAmount;

  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center py-12">
            <div className="mb-6 relative">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Deposit Successful!</h2>
            <p className="text-muted-foreground mb-6">
              {formatNumber(tokensReceived)} INR tokens have been added to your wallet
            </p>
            
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
              <div className="text-sm text-muted-foreground">New Balance</div>
              <div className="text-2xl font-bold text-success">
                {formatNumber(wallet.inrTokenBalance)} INR
              </div>
            </div>
            
            <Button onClick={onComplete} className="w-full">
              Continue Trading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    const steps = [
      'Connecting to your bank...',
      'Verifying payment details...',
      'Converting to INR tokens...'
    ];
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            </div>
            
            <h2 className="text-xl font-bold mb-6">Processing Your Deposit</h2>
            
            <div className="space-y-4">
              {steps.map((stepText, index) => (
                <div key={index} className="flex items-center gap-3">
                  {index < processingStep ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : index === processingStep ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-muted rounded-full" />
                  )}
                  <span className={index <= processingStep ? 'text-foreground' : 'text-muted-foreground'}>
                    {stepText}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              Please don't close this window
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Wallet
      </Button>

      {step === 'amount' && (
        <Card>
          <CardHeader>
            <CardTitle>Add Funds to Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="amount">Enter Amount</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="10,000"
                  className="pl-8 text-lg font-semibold"
                />
              </div>
              {amount && validateAmount(amount) && (
                <p className="text-destructive text-sm mt-1">{validateAmount(amount)}</p>
              )}
            </div>

            <div>
              <Label>Quick Amounts</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_AMOUNTS.map(quickAmount => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className={amount === formatNumber(quickAmount) ? 'border-primary bg-primary/10' : ''}
                  >
                    {formatCurrency(quickAmount)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Deposit Limits</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Daily Remaining:</span>
                  <span className="font-medium">{formatCurrency(wallet.dailyDepositLimit - wallet.todayDeposited)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Remaining:</span>
                  <span className="font-medium">{formatCurrency(wallet.monthlyDepositLimit - wallet.monthDeposited)}</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={proceedToMethod} 
              className="w-full"
              disabled={!amount || !!validateAmount(amount)}
            >
              Continue to Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'method' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {PAYMENT_METHODS.map(method => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-success">{method.time}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button onClick={proceedToPreview} className="w-full">
              Continue to Preview
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span>You Pay:</span>
                <span className="font-semibold">{formatCurrency(numAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold text-success">
                  {formatCurrency(processingFee)} <span className="text-xs">(We don't charge conversion fees!)</span>
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span>You Receive:</span>
                  <span className="font-bold text-primary">{formatNumber(tokensReceived)} INR Tokens</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Exchange Rate: 1:1 (Always guaranteed)
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <selectedPaymentMethod.icon className="w-6 h-6 text-primary" />
              <div>
                <div className="font-medium">{selectedPaymentMethod.name}</div>
                <div className="text-sm text-muted-foreground">
                  Processing time: {selectedPaymentMethod.time}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('method')} className="flex-1">
                Back
              </Button>
              <Button onClick={startProcessing} className="flex-1">
                Confirm Deposit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};