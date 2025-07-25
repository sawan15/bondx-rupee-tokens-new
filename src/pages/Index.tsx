import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Zap, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, switchDemoAccount, resetDemo, isDemoMode } = useAuthStore();

  const features = [
    {
      icon: TrendingUp,
      title: 'Fractional Bond Investing',
      description: 'Invest in corporate bonds starting from ₹500 with fractional ownership'
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'All transactions secured with blockchain technology and real-time tracking'
    },
    {
      icon: Zap,
      title: 'Instant Settlements',
      description: 'Quick settlements using INR tokens pegged 1:1 to Indian Rupees'
    },
    {
      icon: PieChart,
      title: 'Diversified Portfolio',
      description: 'Build a balanced bond portfolio across various sectors and ratings'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Demo Account Selector */}
      {!isAuthenticated && !isDemoMode && (
        <div className="bg-card border rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Demo Experience</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-xl font-semibold">NEW INVESTOR</h3>
                <p className="text-muted-foreground">(Arjun)</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Fresh to bonds
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Complete KYC journey
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  First purchase experience
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Learning journey
                </li>
              </ul>
              <Button 
                onClick={() => {
                  switchDemoAccount('new_investor');
                  navigate('/onboarding');
                }}
                className="w-full"
                variant="outline"
              >
                Start Fresh
              </Button>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="text-xl font-semibold">EXPERIENCED</h3>
                <p className="text-muted-foreground">(Priya)</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Active portfolio
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Rich transaction history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Performance tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Advanced features
                </li>
              </ul>
              <Button 
                onClick={() => {
                  switchDemoAccount('experienced_investor');
                  navigate('/portfolio');
                }}
                className="w-full"
              >
                View Portfolio
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Button 
              onClick={resetDemo}
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
            >
              🔄 Reset All Demo Data
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-bold gradient-text mb-6">
          Democratizing Bond
          <br />
          Investing in India
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Access high-yield corporate bonds with fractional ownership. Start building your bond portfolio with as little as ₹500.
        </p>
        
        {isAuthenticated && user?.isOnboarded ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace">
              <Button size="lg" className="btn-primary">
                Explore Marketplace
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button size="lg" variant="outline">
                View Portfolio
              </Button>
            </Link>
          </div>
        ) : isAuthenticated && !user?.isOnboarded ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-primary"
              onClick={() => navigate('/onboarding')}
            >
              Complete Setup
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link to="/learn">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-primary"
              onClick={() => navigate('/onboarding')}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link to="/learn">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">₹45Cr+</div>
          <div className="text-muted-foreground">Trading Volume</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-secondary mb-2">147</div>
          <div className="text-muted-foreground">Active Bonds</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-success mb-2">7.5%</div>
          <div className="text-muted-foreground">Avg. Returns</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-warning mb-2">₹500</div>
          <div className="text-muted-foreground">Min. Investment</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose BondX?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Revolutionary platform making bond investing accessible to retail investors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card-financial hover:shadow-medium transition-all duration-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="card-financial bg-gradient-primary text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Start Investing?</h3>
        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
          Join thousands of investors building wealth through bond investing. Start your journey today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/marketplace">
            <Button size="lg" variant="secondary">
              Browse Bonds
            </Button>
          </Link>
          <Link to="/learn">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Learn First
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
