import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, TrendingUp, Users } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">B</span>
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          Welcome to BondX
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          India's first tokenized bond exchange. Invest in corporate bonds with fractional ownership, 
          starting from just ₹1,000.
        </p>
      </div>

      {/* Education Box */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            What are Tokenized Bonds?
          </CardTitle>
          <CardDescription>
            Understanding the future of bond investing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold">Fractional Ownership</h4>
              <p className="text-sm text-muted-foreground">
                Own a piece of high-value corporate bonds starting from ₹1,000
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold">Transparent & Secure</h4>
              <p className="text-sm text-muted-foreground">
                Blockchain-backed tokens ensure transparency and security
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold">Higher Returns</h4>
              <p className="text-sm text-muted-foreground">
                Access institutional-grade bonds with attractive yields
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button 
          onClick={onNext}
          size="lg" 
          className="min-w-[200px] group"
        >
          Get Started
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="min-w-[200px]"
        >
          Learn More First
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="text-center space-y-2 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">Trusted by 10,000+ investors</p>
        <div className="flex justify-center items-center space-x-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            SEBI Registered
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Bank-Grade Security
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;