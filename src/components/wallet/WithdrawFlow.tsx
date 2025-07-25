import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WithdrawFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'amount' | 'preview' | 'processing' | 'success';

export const WithdrawFlow = ({ onBack, onComplete }: WithdrawFlowProps) => {
  const { wallet, updateBalance, addTransaction } = useAppStore();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
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
    
    if (!numAmount || numAmount < 100) {
      return 'Minimum withdrawal is ₹100';
    }
    
    if (numAmount > wallet.availableBalance) {
      return `Insufficient balance. You have ${formatCurrency(wallet.availableBalance)} available`;
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

  const proceedToPreview = () => {
    const error = validateAmount(amount);
    if (error) {
      toast({
        title: "Invalid Amount",
        description: error,
        variant: "destructive"
      });
      return;
    }
    setStep('preview');
  };

  const startProcessing = async () => {
    setStep('processing');
    
    const steps = [
      'Initiating withdrawal request...',
      'Verifying bank details...',
      'Processing transfer...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Update wallet balance
    const withdrawAmount = parseInt(amount.replace(/,/g, ''));
    updateBalance(-withdrawAmount, `Withdrawal to bank account`);
    addTransaction({
      type: 'withdrawal',
      amount: -withdrawAmount,
      description: 'Withdrawal to registered bank account',
      status: 'completed',
      referenceId: `WD${Date.now().toString().slice(-8)}`
    });
    
    setStep('success');
    setTimeout(onComplete, 2000);
  };

  const numAmount = amount ? parseInt(amount.replace(/,/g, '')) : 0;
  const processingFee = 0; // No fees for demo
  const amountToReceive = numAmount - processingFee;

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Withdrawal Initiated!</h2>
            <p className="text-muted-foreground mb-6">
              {formatCurrency(amountToReceive)} will be credited to your bank account within 2-4 hours
            </p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="text-sm text-muted-foreground">Reference ID</div>
              <div className="font-mono font-bold">WD{Date.now().toString().slice(-8)}</div>
            </div>
            
            <Button onClick={onComplete} className="w-full">
              Back to Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    const steps = [
      'Initiating withdrawal request...',
      'Verifying bank details...',
      'Processing transfer...'
    ];
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="text-center py-12">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            </div>
            
            <h2 className="text-xl font-bold mb-6">Processing Withdrawal</h2>
            
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
            <CardTitle>Withdraw Funds</CardTitle>
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

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Available Balance</div>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(wallet.availableBalance)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(wallet.reservedBalance)} is reserved in pending orders
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Bank Account</h4>
                  <p className="text-sm text-blue-700">
                    Funds will be transferred to your registered bank account ending in ****4567
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    HDFC Bank • Processing time: 2-4 hours
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={proceedToPreview} 
              className="w-full"
              disabled={!amount || !!validateAmount(amount)}
            >
              Continue to Preview
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span className="font-semibold">{formatCurrency(numAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-semibold text-success">
                  {formatCurrency(processingFee)} <span className="text-xs">(No fees!)</span>
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span>You'll Receive:</span>
                  <span className="font-bold text-primary">{formatCurrency(amountToReceive)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Processing Time</h4>
                <p className="text-sm text-yellow-700">
                  Your withdrawal will be processed within 2-4 hours during banking hours.
                  Transfers initiated after 6 PM or on weekends will be processed the next working day.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Destination Account</h4>
                  <p className="text-sm text-blue-700">
                    HDFC Bank • Account ending in ****4567
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Registered account holder: {wallet.lastUpdated ? 'John Doe' : 'Demo User'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('amount')} className="flex-1">
                Back
              </Button>
              <Button onClick={startProcessing} className="flex-1">
                Confirm Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};