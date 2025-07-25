import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, FileText, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';
import { useAuthStore } from '@/stores/authStore';

interface KYCStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const KYCStep = ({ data, updateData, onNext, onBack }: KYCStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { setUser, user } = useAuthStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.panNumber.trim()) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }

    if (!data.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(data.aadhaarNumber.replace(/\s/g, ''))) {
      newErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 12);
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatPAN = (value: string) => {
    return value.toUpperCase().slice(0, 10);
  };

  const simulateVerification = async () => {
    if (!validateForm()) return;

    setIsVerifying(true);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsVerifying(false);
    setIsVerified(true);
    
    // Update user verification status in auth store
    if (user) {
      setUser({
        ...user,
        isVerified: true,
        kycStatus: 'verified'
      });
    }
    
    // Auto proceed after verification
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  const handleFileUpload = (file: File) => {
    updateData({ panCardFile: file });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">KYC Verification</h2>
        <p className="text-muted-foreground">
          We need to verify your identity to comply with financial regulations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Identity Documents
          </CardTitle>
          <CardDescription>
            Your information is encrypted and stored securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="panNumber">PAN Number</Label>
            <Input
              id="panNumber"
              placeholder="ABCDE1234F"
              value={data.panNumber}
              onChange={(e) => updateData({ panNumber: formatPAN(e.target.value) })}
              className={errors.panNumber ? 'border-destructive' : ''}
            />
            {errors.panNumber && (
              <p className="text-sm text-destructive">{errors.panNumber}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Why do we need this? PAN is mandatory for financial transactions above ₹50,000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
            <Input
              id="aadhaarNumber"
              placeholder="1234 5678 9012"
              value={data.aadhaarNumber}
              onChange={(e) => updateData({ aadhaarNumber: formatAadhaar(e.target.value) })}
              className={errors.aadhaarNumber ? 'border-destructive' : ''}
            />
            {errors.aadhaarNumber && (
              <p className="text-sm text-destructive">{errors.aadhaarNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>PAN Card Upload</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload PAN card image or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG (Max 5MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </div>
            {data.panCardFile && (
              <p className="text-sm text-success flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {data.panCardFile.name} uploaded successfully
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {isVerified && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h3 className="text-lg font-semibold text-success">Verification Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your documents have been verified. Proceeding to next step...
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
        <Button onClick={simulateVerification} disabled={isVerifying || isVerified}>
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : isVerified ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified
            </>
          ) : (
            <>
              Verify Documents
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default KYCStep;