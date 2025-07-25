import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, Calendar, IndianRupee, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const portfolioData = [
  { name: 'Corporate', value: 45, color: '#8b5cf6' },
  { name: 'Banking', value: 30, color: '#f97316' },
  { name: 'Technology', value: 25, color: '#10b981' }
];

const performanceData = [
  { month: 'Jan', returns: 8.2 },
  { month: 'Feb', returns: 7.8 },
  { month: 'Mar', returns: 9.1 },
  { month: 'Apr', returns: 8.7 },
  { month: 'May', returns: 9.3 },
  { month: 'Jun', returns: 8.9 }
];

const holdings = [
  {
    id: '1',
    issuer: 'Reliance Industries',
    investment: 15000,
    currentValue: 15750,
    yield: 7.25,
    maturity: '2027-03-15',
    rating: 'AAA'
  },
  {
    id: '2',
    issuer: 'HDFC Bank',
    investment: 8000,
    currentValue: 8320,
    yield: 6.85,
    maturity: '2026-08-20',
    rating: 'AAA'
  },
  {
    id: '3',
    issuer: 'Infosys Ltd',
    investment: 12000,
    currentValue: 12480,
    yield: 7.45,
    maturity: '2028-12-10',
    rating: 'AA+'
  }
];

const Portfolio = () => {
  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.investment, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalReturns = totalCurrentValue - totalInvestment;
  const returnsPercentage = (totalReturns / totalInvestment) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
          <p className="text-muted-foreground">
            Track your bond investments and performance
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Report
          </Button>
          <Button className="btn-secondary">
            <IndianRupee className="w-4 h-4 mr-2" />
            Invest More
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalInvestment)}</p>
            </div>
            <IndianRupee className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCurrentValue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success" />
          </div>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Returns</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalReturns)}</p>
            </div>
            <div className="text-success text-right">
              <p className="text-sm">+{returnsPercentage.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Yield</p>
              <p className="text-2xl font-bold text-foreground">7.18%</p>
            </div>
            <Calendar className="w-8 h-8 text-warning" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Allocation Chart */}
        <div className="card-financial">
          <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {portfolioData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="card-financial">
          <h3 className="text-lg font-semibold text-foreground mb-4">6-Month Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Returns']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="returns" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">My Holdings</h2>
        
        <div className="space-y-4">
          {holdings.map((holding) => {
            const returns = holding.currentValue - holding.investment;
            const returnsPercent = (returns / holding.investment) * 100;
            
            return (
              <div key={holding.id} className="card-financial hover:shadow-medium transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {holding.issuer}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {holding.rating}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Invested</p>
                        <p className="font-semibold">{formatCurrency(holding.investment)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Value</p>
                        <p className="font-semibold">{formatCurrency(holding.currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Yield</p>
                        <p className="font-semibold text-success">{holding.yield}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Maturity</p>
                        <p className="font-semibold">{formatDate(holding.maturity)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Returns</p>
                      <p className="font-semibold text-success">
                        +{formatCurrency(returns)} ({returnsPercent.toFixed(2)}%)
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;