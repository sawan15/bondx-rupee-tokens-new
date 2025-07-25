import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import BasicInfoStep from '@/components/onboarding/BasicInfoStep';
import KYCStep from '@/components/onboarding/KYCStep';
import BankLinkingStep from '@/components/onboarding/BankLinkingStep';
import RiskAssessmentStep from '@/components/onboarding/RiskAssessmentStep';
import CompletionStep from '@/components/onboarding/CompletionStep';

export interface OnboardingData {
  // Basic Info
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  
  // KYC (kept for UI flow but not sent to backend)
  panNumber: string;
  aadhaarNumber: string;
  panCardFile: File | null;
  
  // Bank (kept for UI flow but not sent to backend)
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  
  // Risk (kept for UI flow but not sent to backend)
  investmentExperience: 'beginner' | 'intermediate' | 'advanced' | '';
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { startOnboarding, setOnboardingStep, completeOnboarding, onboardingStep, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    panNumber: '',
    aadhaarNumber: '',
    panCardFile: null,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    investmentExperience: ''
  });

  const totalSteps = 6;

  // Initialize onboarding when component mounts
  useEffect(() => {
    startOnboarding();
  }, [startOnboarding]);

  // Redirect to marketplace if user becomes authenticated (after signup)
  useEffect(() => {
    if (isAuthenticated && currentStep === 2) {
      // User just completed signup, redirect to marketplace
      navigate('/marketplace');
    }
  }, [isAuthenticated, currentStep, navigate]);

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setOnboardingStep(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setOnboardingStep(newStep);
    }
  };

  const handleCompleteOnboarding = () => {
    // Complete onboarding with user data
    completeOnboarding({
      id: '1',
      name: onboardingData.fullName,
      email: onboardingData.email,
      balance: 55000
    });
    
    // Redirect to marketplace
    navigate('/marketplace');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={nextStep} />;
      case 2:
        return (
          <BasicInfoStep
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <KYCStep
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <BankLinkingStep
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <RiskAssessmentStep
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return <CompletionStep onComplete={handleCompleteOnboarding} />;
      default:
        return <WelcomeStep onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      {currentStep > 1 && currentStep < 6 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep - 1} of {totalSteps - 1}
              </span>
              <span className="text-sm font-medium">
                {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}% Complete
              </span>
            </div>
            <Progress value={((currentStep - 1) / (totalSteps - 1)) * 100} className="h-2" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;