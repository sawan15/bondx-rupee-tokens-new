import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface BankLinkingStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const banks = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank'
];

const BankLinkingStep = ({ data, updateData, onNext, onBack }: BankLinkingStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.bankName) {
      newErrors.bankName = 'Please select your bank';
    }

    if (!data.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(data.accountNumber)) {
      newErrors.accountNumber = 'Please enter a valid account number (9-18 digits)';
    }

    if (!data.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatIFSC = (value: string) => {
    return value.toUpperCase().slice(0, 11);
  };

  const formatAccountNumber = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 18);
  };

  const simulatePennyDrop = async () => {
    if (!validateForm()) return;

    setIsVerifying(true);
    // Simulate penny drop verification
    await new Promise(resolve => setTimeout(resolve, 4000));
    setIsVerifying(false);
    setIsVerified(true);
    
    // Auto proceed after verification
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Link Bank Account</h2>
        <p className="text-muted-foreground">
          Connect your bank account for seamless money transfers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Bank Account Details
          </CardTitle>
          <CardDescription>
            We'll verify your account with a small deposit (₹1) that will be refunded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Select Your Bank</Label>
            <Select 
              value={data.bankName} 
              onValueChange={(value) => updateData({ bankName: value })}
            >
              <SelectTrigger className={errors.bankName ? 'border-destructive' : ''}>
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankName && (
              <p className="text-sm text-destructive">{errors.bankName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter your account number"
              value={data.accountNumber}
              onChange={(e) => updateData({ accountNumber: formatAccountNumber(e.target.value) })}
              className={errors.accountNumber ? 'border-destructive' : ''}
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive">{errors.accountNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              placeholder="SBIN0001234"
              value={data.ifscCode}
              onChange={(e) => updateData({ ifscCode: formatIFSC(e.target.value) })}
              className={errors.ifscCode ? 'border-destructive' : ''}
            />
            {errors.ifscCode && (
              <p className="text-sm text-destructive">{errors.ifscCode}</p>
            )}
            <p className="text-xs text-muted-foreground">
              You can find your IFSC code on your cheque book or bank statement
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium">Bank-Level Security</h4>
              <p className="text-sm text-muted-foreground">
                Your bank details are encrypted with 256-bit SSL encryption. We only use this 
                information for fund transfers and never store your banking credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isVerified && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h3 className="text-lg font-semibold text-success">Account Verified!</h3>
              <p className="text-sm text-muted-foreground">
                Penny drop successful. Your bank account is now linked.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isVerifying}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={simulatePennyDrop} disabled={isVerifying || isVerified}>
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying Account...
            </>
          ) : isVerified ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified
            </>
          ) : (
            <>
              Verify & Link Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BankLinkingStep;