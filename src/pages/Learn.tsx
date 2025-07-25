import { BookOpen, Play, FileText, TrendingUp, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Learn = () => {
  const learningModules = [
    {
      id: '1',
      title: 'Bond Basics',
      description: 'Understanding what bonds are and how they work',
      duration: '15 min',
      icon: BookOpen,
      type: 'article',
      difficulty: 'Beginner'
    },
    {
      id: '2',
      title: 'Corporate Bond Analysis',
      description: 'How to evaluate corporate bonds and credit ratings',
      duration: '20 min',
      icon: TrendingUp,
      type: 'video',
      difficulty: 'Intermediate'
    },
    {
      id: '3',
      title: 'Risk Management',
      description: 'Managing risks in your bond portfolio',
      duration: '18 min',
      icon: Shield,
      type: 'article',
      difficulty: 'Intermediate'
    },
    {
      id: '4',
      title: 'Fractional Bond Investing',
      description: 'Benefits of fractional ownership in bonds',
      duration: '12 min',
      icon: FileText,
      type: 'guide',
      difficulty: 'Beginner'
    }
  ];

  const faqs = [
    {
      question: 'What are fractional bonds?',
      answer: 'Fractional bonds allow you to invest in a portion of a bond rather than the full amount, making bond investing more accessible with lower minimum investments.'
    },
    {
      question: 'How are INR tokens used?',
      answer: 'INR tokens are digital representations of Indian Rupees (1:1 pegged) used for seamless transactions on our platform without traditional banking delays.'
    },
    {
      question: 'What happens when a bond matures?',
      answer: 'Upon maturity, you receive your principal investment plus any accrued interest directly to your wallet as INR tokens.'
    },
    {
      question: 'How do I earn interest?',
      answer: 'Interest is typically paid periodically (monthly, quarterly, or annually) based on the bond terms and is automatically credited to your wallet.'
    }
  ];

  const getIcon = (IconComponent: any) => {
    return <IconComponent className="w-6 h-6" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'guide':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-success-muted text-success border-success';
      case 'Intermediate':
        return 'bg-warning/10 text-warning border-warning';
      case 'Advanced':
        return 'bg-danger-muted text-danger border-danger';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-4">Learn Bond Investing</h1>
        <p className="text-lg text-muted-foreground">
          Master the fundamentals of bond investing and maximize your returns with our comprehensive learning resources.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-financial text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-foreground">12+</h3>
          <p className="text-muted-foreground">Learning Modules</p>
        </div>
        
        <div className="card-financial text-center">
          <Calendar className="w-12 h-12 text-secondary mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-foreground">2 Hours</h3>
          <p className="text-muted-foreground">Total Content</p>
        </div>
        
        <div className="card-financial text-center">
          <TrendingUp className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-foreground">7.5%</h3>
          <p className="text-muted-foreground">Avg. Returns</p>
        </div>
      </div>

      {/* Learning Modules */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Learning Modules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningModules.map((module) => (
            <Card key={module.id} className="card-financial hover:shadow-medium transition-all duration-200 cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getIcon(module.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      {getTypeIcon(module.type)}
                      <span className="capitalize">{module.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{module.duration}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Concepts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Key Concepts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-financial text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Yield</h3>
            <p className="text-sm text-muted-foreground">
              The annual return you earn from a bond, expressed as a percentage
            </p>
          </div>
          
          <div className="card-financial text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Maturity</h3>
            <p className="text-sm text-muted-foreground">
              The date when the bond expires and you receive your principal back
            </p>
          </div>
          
          <div className="card-financial text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Credit Rating</h3>
            <p className="text-sm text-muted-foreground">
              Assessment of the issuer's ability to repay debt (AAA, AA+, etc.)
            </p>
          </div>
          
          <div className="card-financial text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Coupon</h3>
            <p className="text-sm text-muted-foreground">
              Regular interest payments made by the bond issuer to investors
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="card-financial">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {faq.question}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="card-financial text-center bg-gradient-primary text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Start Investing?</h3>
        <p className="text-lg mb-6 opacity-90">
          Apply your knowledge and start building your bond portfolio today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" size="lg">
            View Marketplace
          </Button>
          <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Continue Learning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Learn;