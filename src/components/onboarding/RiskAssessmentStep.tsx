import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface RiskAssessmentStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const riskProfiles = [
  {
    id: 'beginner' as const,
    title: 'Conservative Investor',
    subtitle: 'New to bonds, prefer safer options',
    description: 'Focus on government bonds and high-rated corporate bonds with lower yields but stable returns.',
    expectedReturn: '6-8% annually',
    riskLevel: 'Low',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    features: [
      'Government and AAA-rated bonds',
      'Capital preservation focus',
      'Regular income generation',
      'Low volatility'
    ]
  },
  {
    id: 'intermediate' as const,
    title: 'Balanced Investor',
    subtitle: 'Some experience, moderate risk acceptable',
    description: 'Mix of government and corporate bonds with moderate risk for better returns.',
    expectedReturn: '8-12% annually',
    riskLevel: 'Medium',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    features: [
      'Mix of government & corporate bonds',
      'Balanced risk-return profile',
      'Diversified portfolio approach',
      'Moderate volatility'
    ]
  },
  {
    id: 'advanced' as const,
    title: 'Growth Investor',
    subtitle: 'Experienced, open to higher yields',
    description: 'Higher-yield corporate bonds and emerging market debt for maximum returns.',
    expectedReturn: '12-18% annually',
    riskLevel: 'High',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    features: [
      'High-yield corporate bonds',
      'Emerging market exposure',
      'Maximum return potential',
      'Higher volatility accepted'
    ]
  }
];

const RiskAssessmentStep = ({ data, updateData, onNext, onBack }: RiskAssessmentStepProps) => {
  const selectedProfile = riskProfiles.find(profile => profile.id === data.investmentExperience);

  const handleSelect = (profileId: 'beginner' | 'intermediate' | 'advanced') => {
    updateData({ investmentExperience: profileId });
  };

  const canProceed = data.investmentExperience !== '';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Investment Profile</h2>
        <p className="text-muted-foreground">
          Help us understand your investment goals and risk tolerance
        </p>
      </div>

      {/* Risk Profile Cards */}
      <div className="grid gap-4">
        {riskProfiles.map((profile) => {
          const Icon = profile.icon;
          const isSelected = data.investmentExperience === profile.id;
          
          return (
            <Card 
              key={profile.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? `ring-2 ring-primary ${profile.bgColor}` 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelect(profile.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{profile.title}</CardTitle>
                      <CardDescription>{profile.subtitle}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{profile.expectedReturn}</div>
                    <div className={`text-xs ${profile.color}`}>{profile.riskLevel} Risk</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {profile.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {profile.features.map((feature, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className="w-1 h-1 bg-current rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Educational Context */}
      {selectedProfile && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Your Investment Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              As a <strong>{selectedProfile.title}</strong>, we'll recommend bonds that match your 
              risk tolerance and return expectations. You can always adjust your preferences later.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Expected Returns</div>
                <div>{selectedProfile.expectedReturn}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Risk Level</div>
                <div className={selectedProfile.color}>{selectedProfile.riskLevel}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium">Important</h4>
              <p className="text-sm text-muted-foreground">
                All investments carry risk. Past performance doesn't guarantee future returns. 
                Consider your financial situation carefully before investing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Complete Setup
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default RiskAssessmentStep;