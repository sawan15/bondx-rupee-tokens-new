import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, User, Mail, Phone, Lock, Loader2, CheckCircle } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';
import { useAuthStore } from '@/stores/authStore';

interface BasicInfoStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const BasicInfoStep = ({ data, updateData, onNext, onBack }: BasicInfoStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signup } = useAuthStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (data.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(data.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!data.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(data.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number and special character';
    }

    if (!data.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSigningUp(true);
    setErrors({}); // Clear any previous errors
    
    try {
      // Call the signup API with the collected data
      await signup({
        name: data.fullName,
        email: data.email,
        phone: `91${data.mobile.replace(/\s/g, '')}`, // Format as 918904298214
        password: data.password
      });
      
      // Show success state
      setIsSuccess(true);
      
      // Small delay to show success, then proceed
      setTimeout(() => {
        onNext(); // This will trigger the redirect in the parent component
      }, 1500);
      
    } catch (error: any) {
      setErrors({ general: error.message || 'Signup failed. Please try again.' });
    } finally {
      setIsSigningUp(false);
    }
  };

  const formatMobile = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    return limited;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Basic Information</h2>
        <p className="text-muted-foreground">
          Let's start with some basic details to set up your account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (as per PAN)</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <div className="flex">
                <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm">
                  +91
                </div>
                <Input
                  id="mobile"
                  placeholder="9876543210"
                  value={data.mobile}
                  onChange={(e) => updateData({ mobile: formatMobile(e.target.value) })}
                  className={`rounded-l-none pl-3 ${errors.mobile ? 'border-destructive' : ''}`}
                />
              </div>
            </div>
            {errors.mobile && (
              <p className="text-sm text-destructive">{errors.mobile}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={data.password}
                onChange={(e) => updateData({ password: e.target.value })}
                className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Must contain uppercase, lowercase, number and special character (min 8 chars)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={data.confirmPassword}
                onChange={(e) => updateData({ confirmPassword: e.target.value })}
                className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {errors.general && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      {isSuccess && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h3 className="text-lg font-semibold text-success">Account Created Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Welcome to BondX! Redirecting you to the marketplace...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSigningUp || isSuccess}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSigningUp || isSuccess}>
          {isSigningUp ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Success
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;