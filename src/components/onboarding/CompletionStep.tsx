import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Target, TrendingUp, Shield, BookOpen } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

const CompletionStep = ({ onComplete }: CompletionStepProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Success Animation */}
      <div className="text-center space-y-6">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse opacity-20"></div>
          <div className="relative w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">
            Welcome to BondX! 🎉
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Your account is now fully set up and verified. You're ready to start investing in tokenized bonds.
          </p>
        </div>
      </div>

      {/* What's Next Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            What's Next?
          </CardTitle>
          <CardDescription>
            Here's how to get started with your bond investment journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Explore Marketplace</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse available bonds and find investments that match your profile
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Start Small</h4>
                  <p className="text-sm text-muted-foreground">
                    Begin with a small investment (₹1,000) to get familiar with the platform
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Learn & Grow</h4>
                  <p className="text-sm text-muted-foreground">
                    Access our learning center to understand bond investing better
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Track Portfolio</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your investments and returns in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <Card className="border-success bg-success/5">
        <CardHeader>
          <CardTitle className="text-success">Account Status: Verified ✓</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">✓</div>
              <div className="text-sm text-muted-foreground">KYC Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">✓</div>
              <div className="text-sm text-muted-foreground">Bank Linked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">✓</div>
              <div className="text-sm text-muted-foreground">Profile Set</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">₹0</div>
              <div className="text-sm text-muted-foreground">Initial Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Button 
          onClick={onComplete}
          size="lg" 
          className="min-w-[250px] group"
        >
          Start Investing
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          You'll be redirected to the marketplace to explore available bonds
        </p>
      </div>

      {/* Trust & Security Footer */}
      <div className="text-center space-y-2 pt-8 border-t border-border">
        <div className="flex justify-center items-center space-x-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            256-bit SSL Encryption
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            SEBI Registered
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            RBI Compliant
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompletionStep;