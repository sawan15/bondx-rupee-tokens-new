import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, TrendingUp, TrendingDown, Info, Clock, 
  Building2, Calendar, DollarSign, BarChart3, Eye, ShoppingCart,
  AlertTriangle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BondData {
  id: string;
  name: string;
  issuer: string;
  rating: string;
  sector: string;
  ytm: number;
  tokenPrice: number;
  priceChange: number;
  priceChangePercent: number;
  totalTokens: number;
  availableTokens: number;
  volume24h: string;
  maturityDate: string;
  maturityYears: number;
  couponRate: number;
  tags: string[];
  isPopular: boolean;
  originalBondValue: number;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  side: 'bid' | 'ask';
}

interface RecentTrade {
  price: number;
  quantity: number;
  timestamp: string;
}

// Demo bond data
const bondDatabase: { [key: string]: BondData } = {
  'rel-85-27': {
    id: 'rel-85-27',
    name: 'Reliance Industries 8.5% 2027',
    issuer: 'Reliance Industries Limited',
    rating: 'AAA',
    sector: 'Energy',
    ytm: 8.5,
    tokenPrice: 100.15,
    priceChange: 0.15,
    priceChangePercent: 0.15,
    totalTokens: 150,
    availableTokens: 67.5,
    volume24h: '₹2.3Cr',
    maturityDate: '15 Mar 2027',
    maturityYears: 3.2,
    couponRate: 8.5,
    tags: ['popular'],
    isPopular: true,
    originalBondValue: 15000
  },
  'hdfc-78-26': {
    id: 'hdfc-78-26',
    name: 'HDFC Bank 7.8% 2026',
    issuer: 'HDFC Bank Limited',
    rating: 'AAA',
    sector: 'Banking',
    ytm: 7.8,
    tokenPrice: 98.50,
    priceChange: -1.50,
    priceChangePercent: -1.5,
    totalTokens: 250,
    availableTokens: 89,
    volume24h: '₹1.8Cr',
    maturityDate: '15 Dec 2026',
    maturityYears: 2.1,
    couponRate: 7.8,
    tags: [],
    isPopular: false,
    originalBondValue: 25000
  }
};

const BondDetails = () => {
  const { bondId } = useParams();
  const navigate = useNavigate();
  
  // Mock user data
  const userBalance = 55237;
  const userHoldings = 0; // User doesn't own this bond yet
  
  // Component state
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [tradingTab, setTradingTab] = useState<'buy' | 'sell'>('buy');
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [priceFluctuation, setPriceFluctuation] = useState(false);
  const [lossRisk, setLossRisk] = useState(false);
  
  // Get bond data
  const bond = bondDatabase[bondId || ''] || bondDatabase['rel-85-27'];
  
  // Live order book simulation
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({
    bids: [
      { price: 99.90, quantity: 5, side: 'bid' },
      { price: 99.80, quantity: 8, side: 'bid' },
      { price: 99.70, quantity: 12, side: 'bid' },
      { price: 99.60, quantity: 6, side: 'bid' }
    ],
    asks: [
      { price: 100.20, quantity: 3, side: 'ask' },
      { price: 100.30, quantity: 7, side: 'ask' },
      { price: 100.40, quantity: 4, side: 'ask' },
      { price: 100.50, quantity: 9, side: 'ask' }
    ]
  });
  
  // Recent trades simulation
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([
    { price: 100.15, quantity: 2.5, timestamp: '2m ago' },
    { price: 100.10, quantity: 5.0, timestamp: '8m ago' },
    { price: 100.20, quantity: 1.2, timestamp: '15m ago' },
    { price: 100.05, quantity: 3.8, timestamp: '22m ago' }
  ]);
  
  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random price movements
      const change = (Math.random() - 0.5) * 0.1;
      setOrderBook(prev => ({
        bids: prev.bids.map(bid => ({
          ...bid,
          price: Math.max(99.50, bid.price + change)
        })),
        asks: prev.asks.map(ask => ({
          ...ask,
          price: Math.min(101.00, ask.price + change)
        }))
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'AAA':
        return 'bg-success text-success-foreground';
      case 'AA+':
        return 'bg-primary text-primary-foreground';
      case 'AA':
        return 'bg-secondary text-secondary-foreground';
      case 'A+':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  const calculateTokens = (amount: number) => {
    const price = orderType === 'market' ? orderBook.asks[0]?.price || bond.tokenPrice : parseFloat(limitPrice) || bond.tokenPrice;
    return amount / price;
  };
  
  const calculateCouponIncome = (tokens: number) => {
    return tokens * (bond.couponRate / 100) * 100; // Annual coupon income
  };
  
  const calculateMaturityPayout = (tokens: number) => {
    return tokens * 100; // Face value per token
  };
  
  const marketPrice = orderBook.asks[0]?.price || bond.tokenPrice;
  const bestBid = orderBook.bids[0]?.price || bond.tokenPrice - 0.30;
  const spread = marketPrice - bestBid;
  
  const investment = parseFloat(investmentAmount) || 0;
  const tokens = calculateTokens(investment);
  const fee = investment * 0.001; // 0.1% fee
  const totalCost = investment + fee;
  const annualCoupons = calculateCouponIncome(tokens);
  const maturityPayout = calculateMaturityPayout(tokens);
  
  const canAfford = totalCost <= userBalance;
  const allRisksAcknowledged = riskAcknowledged && priceFluctuation && lossRisk;

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-8">
        {/* Header Section */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/marketplace')}
              className="p-0 h-auto font-normal"
            >
              Marketplace
            </Button>
            <span>&gt;</span>
            <span className="text-foreground">{bond.name}</span>
          </div>
          
          {/* Bond Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-foreground">{bond.name}</h1>
                <Badge className={getRatingColor(bond.rating)}>{bond.rating}</Badge>
              </div>
              <p className="text-lg text-muted-foreground">{bond.issuer}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-foreground">{formatCurrency(bond.tokenPrice)}</span>
                  <div className={`flex items-center space-x-1 ${bond.priceChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {bond.priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {bond.priceChange >= 0 ? '+' : ''}{formatCurrency(bond.priceChange)} ({bond.priceChangePercent >= 0 ? '+' : ''}{bond.priceChangePercent}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {bond.isPopular && <Badge variant="secondary">🔥 Most Traded</Badge>}
                  <Badge variant="outline">{bond.sector} Sector</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center cursor-help">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-foreground">{bond.ytm}%</div>
                    <div className="text-sm text-muted-foreground">YTM</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your total returns if held till maturity, including coupon payments</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center cursor-help">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(bond.tokenPrice)}</div>
                    <div className="text-sm text-muted-foreground">Token Price</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current market price per token. Physical bond worth ₹{bond.originalBondValue.toLocaleString()} split into {bond.totalTokens} tokens</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center cursor-help">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-foreground">{bond.availableTokens}/{bond.totalTokens}</div>
                    <div className="text-sm text-muted-foreground">Tokens Available</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>How many tokens you can buy right now from other investors</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center cursor-help">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-foreground">₹{(bond.tokenPrice * bond.totalTokens / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total value of all tokens (Token Price × {bond.totalTokens} tokens)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Price Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Token Price Chart (Last 30 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Interactive price chart would appear here</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">1D</Button>
                  <Button variant="outline" size="sm">7D</Button>
                  <Button variant="default" size="sm">30D</Button>
                  <Button variant="outline" size="sm">3M</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bond Information */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="company">Company Info</TabsTrigger>
                <TabsTrigger value="terms">Bond Terms</TabsTrigger>
                <TabsTrigger value="risks">Risk Factors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bond Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISIN:</span>
                        <span className="font-medium">INE002A08045</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue Date:</span>
                        <span className="font-medium">15 Mar 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity Date:</span>
                        <span className="font-medium">{bond.maturityDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Bond Value:</span>
                        <span className="font-medium">₹{bond.originalBondValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Issue Size:</span>
                        <span className="font-medium">₹2,500 Cr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coupon Frequency:</span>
                        <span className="font-medium">Quarterly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Coupon Date:</span>
                        <span className="font-medium">15 Dec 2024</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Token Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Tokens Issued:</span>
                        <span className="font-medium">{bond.totalTokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tokens Available:</span>
                        <span className="font-medium">{bond.availableTokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token Face Value:</span>
                        <span className="font-medium">₹{(bond.originalBondValue / bond.totalTokens).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Token Price:</span>
                        <span className="font-medium">{formatCurrency(bond.tokenPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">24h Trading Volume:</span>
                        <span className="font-medium">{bond.volume24h}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price Range Today:</span>
                        <span className="font-medium">₹99.85 - ₹100.25</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="company" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Reliance Industries Limited is India's largest private sector corporation. 
                      The company operates across energy, petrochemicals, oil & gas, telecom, and retail sectors.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Market Cap:</span>
                        <span className="ml-2 font-medium">₹17.2L Cr</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue (FY24):</span>
                        <span className="ml-2 font-medium">₹9.24L Cr</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Net Profit (FY24):</span>
                        <span className="ml-2 font-medium">₹79,334 Cr</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Business Segments:</span>
                        <span className="ml-2 font-medium">Energy, Petrochemicals, Telecom, Retail</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Credit Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit Rating:</span>
                      <span className="font-medium">AAA (CRISIL)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating Outlook:</span>
                      <span className="font-medium">Stable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Debt/Equity Ratio:</span>
                      <span className="font-medium">0.23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Coverage:</span>
                      <span className="font-medium">12.5x</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      <strong>Rating Rationale:</strong> Strong financial profile with diversified business model
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="terms" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coupon Rate:</span>
                        <span className="font-medium">{bond.couponRate}% per annum</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Frequency:</span>
                        <span className="font-medium">Quarterly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Day Count:</span>
                        <span className="font-medium">30/360</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">First Coupon:</span>
                        <span className="font-medium">15 Jun 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity Amount:</span>
                        <span className="font-medium">₹{bond.originalBondValue.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Token Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token Coupon:</span>
                        <span className="font-medium">₹{(bond.couponRate * 100 / 100).toFixed(2)} per year</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quarterly Coupon:</span>
                        <span className="font-medium">₹{(bond.couponRate * 100 / 400).toFixed(2)} per quarter</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity Payout:</span>
                        <span className="font-medium">₹100 per token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trading:</span>
                        <span className="font-medium">24/7 on BondX platform</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Settlement:</span>
                        <span className="font-medium">T+0 (instant)</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Security Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Type:</span>
                      <span className="font-medium">Unsecured with corporate guarantee</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listing:</span>
                      <span className="font-medium">BSE, NSE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custodian:</span>
                      <span className="font-medium">ICICI Securities Services</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trustee:</span>
                      <span className="font-medium">IDBI Trusteeship Services</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="risks" className="space-y-4">
                <div className="space-y-4">
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Token Price Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Token prices fluctuate based on supply and demand. Current price ₹{bond.tokenPrice.toFixed(2)} may go up or down.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Interest Rate Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        If market interest rates rise, token prices typically fall and vice versa.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Credit Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Risk that {bond.issuer} may default on payments. {bond.rating} rating indicates very low risk.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Liquidity Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        You may not find buyers when you want to sell. Our platform provides market making to reduce this risk.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Early Sale Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Selling before maturity may result in capital gains or losses depending on token price.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Trading Interface */}
          <div className="space-y-6">
            {/* Live Order Book */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <span>Live Order Book</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Book Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Qty</span>
                    <span>Bid</span>
                    <span className="text-center">|</span>
                    <span>Ask</span>
                    <span className="text-right">Qty</span>
                  </div>
                  
                  {orderBook.bids.slice(0, 4).map((bid, index) => {
                    const ask = orderBook.asks[index];
                    return (
                      <div key={index} className="grid grid-cols-5 gap-2 text-sm">
                        <span className="text-success">{bid.quantity}</span>
                        <span className="text-success">₹{bid.price.toFixed(2)}</span>
                        <span className="text-center text-muted-foreground">|</span>
                        <span className="text-destructive">₹{ask?.price.toFixed(2) || '-'}</span>
                        <span className="text-right text-destructive">{ask?.quantity || '-'}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Spread Information */}
                <div className="pt-2 border-t space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Bid:</span>
                    <span className="text-success">₹{bestBid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Ask:</span>
                    <span className="text-destructive">₹{marketPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spread:</span>
                    <span>₹{spread.toFixed(2)} ({((spread / marketPrice) * 100).toFixed(2)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Trade:</span>
                    <span>₹{bond.tokenPrice.toFixed(2)} (2m ago)</span>
                  </div>
                </div>
                
                {/* Recent Trades */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Trades</h4>
                  <div className="space-y-1">
                    {recentTrades.slice(0, 4).map((trade, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-foreground">₹{trade.price.toFixed(2)}</span>
                        <span className="text-muted-foreground">{trade.quantity} tokens</span>
                        <span className="text-muted-foreground">{trade.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Trading Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Trade</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant={tradingTab === 'buy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTradingTab('buy')}
                    className="flex-1"
                  >
                    Buy
                  </Button>
                  <Button
                    variant={tradingTab === 'sell' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTradingTab('sell')}
                    className="flex-1"
                  >
                    Sell
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tradingTab === 'buy' ? (
                  <div className="space-y-4">
                    {/* Educational Tip */}
                    <div className="bg-primary-muted/30 border border-primary-muted rounded p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Market Order:</strong> Buy instantly at current ask price (₹{marketPrice.toFixed(2)}). 
                          <strong>Limit Order:</strong> Set your max price and wait for match.
                        </p>
                      </div>
                    </div>
                    
                    {/* Order Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Order Type</label>
                      <div className="flex space-x-2">
                        <Button
                          variant={orderType === 'market' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrderType('market')}
                          className="flex-1"
                        >
                          Market Order
                        </Button>
                        <Button
                          variant={orderType === 'limit' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrderType('limit')}
                          className="flex-1"
                        >
                          Limit Order
                        </Button>
                      </div>
                      {orderType === 'market' && (
                        <p className="text-xs text-muted-foreground">Buy instantly at ₹{marketPrice.toFixed(2)}</p>
                      )}
                    </div>
                    
                    {/* Limit Price (if limit order) */}
                    {orderType === 'limit' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Price per Token</label>
                        <Input
                          type="number"
                          placeholder="₹100.00"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                        />
                      </div>
                    )}
                    
                    {/* Investment Amount */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Investment Amount (INR Tokens)</label>
                      <Input
                        type="number"
                        placeholder="₹0"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setInvestmentAmount('1000')}>₹1K</Button>
                        <Button variant="outline" size="sm" onClick={() => setInvestmentAmount('5000')}>₹5K</Button>
                        <Button variant="outline" size="sm" onClick={() => setInvestmentAmount('10000')}>₹10K</Button>
                        <Button variant="outline" size="sm" onClick={() => setInvestmentAmount('25000')}>₹25K</Button>
                      </div>
                    </div>
                    
                    {/* Calculation Display */}
                    {investment > 0 && (
                      <div className="bg-muted/30 border rounded p-3 space-y-2">
                        <h4 className="text-sm font-medium">Order Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Investment Amount:</span>
                            <span>₹{investment.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Token Price:</span>
                            <span>₹{(orderType === 'market' ? marketPrice : parseFloat(limitPrice) || marketPrice).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tokens You'll Get:</span>
                            <span className="font-medium">{tokens.toFixed(3)} tokens</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Transaction Fee:</span>
                            <span>₹{fee.toFixed(2)} (0.1%)</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total Cost:</span>
                            <span className="font-medium">₹{totalCost.toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Annual Coupons:</span>
                              <span className="text-success">₹{annualCoupons.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Maturity Payout:</span>
                              <span className="text-success">₹{maturityPayout.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Balance Check */}
                    <div className="bg-muted/30 border rounded p-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available Balance:</span>
                          <span className="font-medium">₹{userBalance.toLocaleString()} INR tokens</span>
                        </div>
                        {investment > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">After Purchase:</span>
                            <span className={`font-medium ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                              ₹{(userBalance - totalCost).toLocaleString()} INR tokens
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sell Tab Content */}
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">You currently own:</p>
                      <p className="text-2xl font-bold">{userHoldings} tokens</p>
                      <p className="text-sm text-muted-foreground">of this bond</p>
                      {userHoldings === 0 && (
                        <Button 
                          className="mt-4"
                          onClick={() => setTradingTab('buy')}
                        >
                          Buy Tokens First
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Risk Disclosure */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-warning">Important Risk Disclosure</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="risk1" 
                        checked={riskAcknowledged}
                        onCheckedChange={(checked) => setRiskAcknowledged(!!checked)}
                      />
                      <label htmlFor="risk1" className="text-xs text-muted-foreground cursor-pointer">
                        I understand that token prices can go up or down
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="risk2" 
                        checked={priceFluctuation}
                        onCheckedChange={(checked) => setPriceFluctuation(!!checked)}
                      />
                      <label htmlFor="risk2" className="text-xs text-muted-foreground cursor-pointer">
                        I acknowledge this is not a guaranteed investment
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="risk3" 
                        checked={lossRisk}
                        onCheckedChange={(checked) => setLossRisk(!!checked)}
                      />
                      <label htmlFor="risk3" className="text-xs text-muted-foreground cursor-pointer">
                        I understand I may lose money if I sell below purchase price
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  {tradingTab === 'buy' && (
                    <Button 
                      className="w-full" 
                      disabled={!allRisksAcknowledged || !canAfford || investment <= 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {!canAfford && investment > 0 ? `Add ₹${(totalCost - userBalance).toLocaleString()} More` : 'Buy Tokens'}
                    </Button>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Watchlist
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/marketplace')}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Marketplace
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BondDetails;