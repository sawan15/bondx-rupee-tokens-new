import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, TrendingDown, Heart, ShoppingCart, BarChart3, Star, Lightbulb, Award, Calendar, Target, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Bond {
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
}

const demoBoonds: Bond[] = [
  // Banking Sector
  {
    id: 'hdfc-78-26',
    name: "HDFC Bank 7.8% 2026",
    issuer: "HDFC Bank Limited", 
    rating: "AAA",
    sector: "Banking",
    ytm: 7.8,
    tokenPrice: 98.50,
    priceChange: -1.50,
    priceChangePercent: -1.5,
    totalTokens: 250,
    availableTokens: 89,
    volume24h: "₹1.8Cr",
    maturityDate: "Dec 2026",
    maturityYears: 2.1,
    couponRate: 7.8,
    tags: ["banking"],
    isPopular: false
  },
  {
    id: 'icici-82-27', 
    name: "ICICI Bank 8.2% 2027",
    issuer: "ICICI Bank Limited",
    rating: "AAA", 
    sector: "Banking",
    ytm: 8.2,
    tokenPrice: 101.20,
    priceChange: 2.20,
    priceChangePercent: 2.2,
    totalTokens: 300,
    availableTokens: 156,
    volume24h: "₹1.2Cr",
    maturityDate: "Mar 2027",
    maturityYears: 2.3,
    couponRate: 8.2,
    tags: [],
    isPopular: false
  },
  // Energy Sector  
  {
    id: 'rel-85-27',
    name: "Reliance Industries 8.5% 2027",
    issuer: "Reliance Industries Limited",
    rating: "AAA",
    sector: "Energy", 
    ytm: 8.5,
    tokenPrice: 100.15,
    priceChange: 0.15,
    priceChangePercent: 0.15,
    totalTokens: 150,
    availableTokens: 67,
    volume24h: "₹2.3Cr",
    maturityDate: "Mar 2027", 
    maturityYears: 3.2,
    couponRate: 8.5,
    tags: ["popular"],
    isPopular: true
  },
  {
    id: 'tata-power-92-28',
    name: "Tata Power 9.2% 2028", 
    issuer: "Tata Power Company Limited",
    rating: "AA+",
    sector: "Energy",
    ytm: 9.2,
    tokenPrice: 112.30,
    priceChange: 3.80,
    priceChangePercent: 3.5,
    totalTokens: 200,
    availableTokens: 178,
    volume24h: "₹95L",
    maturityDate: "Jun 2028",
    maturityYears: 4.1, 
    couponRate: 9.2,
    tags: ["new"],
    isPopular: false
  },
  // Technology
  {
    id: 'infosys-72-25',
    name: "Infosys 7.2% 2025",
    issuer: "Infosys Limited", 
    rating: "AA+",
    sector: "Technology",
    ytm: 7.2,
    tokenPrice: 99.50,
    priceChange: -0.50,
    priceChangePercent: -0.5,
    totalTokens: 100,
    availableTokens: 45,
    volume24h: "₹1.2Cr",
    maturityDate: "Sep 2025",
    maturityYears: 1.7,
    couponRate: 7.2,
    tags: [],
    isPopular: false
  },
  {
    id: 'tcs-75-26',
    name: "TCS 7.5% 2026",
    issuer: "Tata Consultancy Services",
    rating: "AAA",
    sector: "Technology", 
    ytm: 7.5,
    tokenPrice: 102.80,
    priceChange: 1.30,
    priceChangePercent: 1.3,
    totalTokens: 180,
    availableTokens: 92,
    volume24h: "₹1.0Cr",
    maturityDate: "Nov 2026",
    maturityYears: 2.9,
    couponRate: 7.5,
    tags: [],
    isPopular: false
  },
  // Infrastructure
  {
    id: 'lt-finance-88-27',
    name: "L&T Finance 8.8% 2027",
    issuer: "L&T Finance Holdings Limited",
    rating: "A+", 
    sector: "Infrastructure",
    ytm: 8.8,
    tokenPrice: 106.50,
    priceChange: 2.10,
    priceChangePercent: 2.0,
    totalTokens: 220,
    availableTokens: 134,
    volume24h: "₹62L",
    maturityDate: "Apr 2027",
    maturityYears: 3.5,
    couponRate: 8.8,
    tags: [],
    isPopular: false
  },
  {
    id: 'powergrid-79-29',
    name: "Power Grid Corp 7.9% 2029",
    issuer: "Power Grid Corporation of India",
    rating: "AAA",
    sector: "Infrastructure",
    ytm: 7.9, 
    tokenPrice: 105.20,
    priceChange: 1.70,
    priceChangePercent: 1.6,
    totalTokens: 250,
    availableTokens: 201,
    volume24h: "₹80L",
    maturityDate: "Aug 2029",
    maturityYears: 5.1,
    couponRate: 7.9,
    tags: [],
    isPopular: false
  },
  // FMCG
  {
    id: 'itc-80-29',
    name: "ITC 8.0% 2029",
    issuer: "ITC Limited",
    rating: "AA",
    sector: "FMCG",
    ytm: 8.0,
    tokenPrice: 108.00,
    priceChange: 0.80,
    priceChangePercent: 0.7,
    totalTokens: 160,
    availableTokens: 98,
    volume24h: "₹75L",
    maturityDate: "Nov 2029", 
    maturityYears: 5.2,
    couponRate: 8.0,
    tags: [],
    isPopular: false
  },
  {
    id: 'hul-71-26',
    name: "Hindustan Unilever 7.1% 2026",
    issuer: "Hindustan Unilever Limited",
    rating: "AAA",
    sector: "FMCG", 
    ytm: 7.1,
    tokenPrice: 96.80,
    priceChange: -0.70,
    priceChangePercent: -0.7,
    totalTokens: 120,
    availableTokens: 67,
    volume24h: "₹55L",
    maturityDate: "Jul 2026",
    maturityYears: 2.6,
    couponRate: 7.1,
    tags: [],
    isPopular: false
  },
  // Financial Services  
  {
    id: 'bajaj-finance-95-28',
    name: "Bajaj Finance 9.5% 2028",
    issuer: "Bajaj Finance Limited",
    rating: "AA+",
    sector: "Financial Services",
    ytm: 9.5, 
    tokenPrice: 115.60,
    priceChange: 4.20,
    priceChangePercent: 3.8,
    totalTokens: 190,
    availableTokens: 145,
    volume24h: "₹1.1Cr",
    maturityDate: "Dec 2028",
    maturityYears: 4.9,
    couponRate: 9.5,
    tags: ["popular"],
    isPopular: true
  }
];

const Marketplace = () => {
  // Mock user wallet balance
  const userBalance = 65000;

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [investmentFilter, setInvestmentFilter] = useState('all');
  const [maturityFilter, setMaturityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ytm-high');

  // Investment calculator states for each bond
  const [investmentAmounts, setInvestmentAmounts] = useState<{[key: string]: string}>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
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

  const updateInvestmentAmount = (bondId: string, amount: string) => {
    setInvestmentAmounts(prev => ({
      ...prev,
      [bondId]: amount
    }));
  };

  const calculateTokens = (bondId: string, amount: number) => {
    const bond = demoBoonds.find(b => b.id === bondId);
    if (!bond) return 0;
    return amount / bond.tokenPrice;
  };

  const calculateCoupons = (bondId: string, amount: number) => {
    const bond = demoBoonds.find(b => b.id === bondId);
    if (!bond) return 0;
    const tokens = calculateTokens(bondId, amount);
    return (tokens * bond.couponRate * 1000) / 4; // Quarterly coupons
  };

  const calculateMaturityPayout = (bondId: string, amount: number) => {
    const bond = demoBoonds.find(b => b.id === bondId);
    if (!bond) return 0;
    const tokens = calculateTokens(bondId, amount);
    return tokens * 1000; // Par value
  };

  const canAfford = (amount: number) => {
    return amount <= userBalance;
  };

  // Filter and search logic
  const filteredBonds = useMemo(() => {
    let filtered = demoBoonds.filter(bond => {
      // Search filter
      const matchesSearch = bond.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bond.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bond.sector.toLowerCase().includes(searchQuery.toLowerCase());

      // Rating filter
      const matchesRating = ratingFilter === 'all' || bond.rating === ratingFilter;

      // Sector filter
      const matchesSector = sectorFilter === 'all' || bond.sector === sectorFilter;

      // Investment amount filter
      let matchesInvestment = true;
      if (investmentFilter === '100-1k') {
        matchesInvestment = bond.tokenPrice >= 100 && bond.tokenPrice <= 1000;
      } else if (investmentFilter === '1k-10k') {
        matchesInvestment = bond.tokenPrice >= 1000 && bond.tokenPrice <= 10000;
      } else if (investmentFilter === '10k+') {
        matchesInvestment = bond.tokenPrice >= 10000;
      }

      // Maturity filter
      let matchesMaturity = true;
      if (maturityFilter === '1-3y') {
        matchesMaturity = bond.maturityYears >= 1 && bond.maturityYears <= 3;
      } else if (maturityFilter === '3-7y') {
        matchesMaturity = bond.maturityYears >= 3 && bond.maturityYears <= 7;
      } else if (maturityFilter === '7y+') {
        matchesMaturity = bond.maturityYears >= 7;
      }

      return matchesSearch && matchesRating && matchesSector && matchesInvestment && matchesMaturity;
    });

    // Sort logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ytm-high':
          return b.ytm - a.ytm;
        case 'rating':
          const ratingOrder = { 'AAA': 4, 'AA+': 3, 'AA': 2, 'A+': 1 };
          return (ratingOrder[b.rating as keyof typeof ratingOrder] || 0) - (ratingOrder[a.rating as keyof typeof ratingOrder] || 0);
        case 'volume':
          return parseFloat(b.volume24h.replace(/[₹CrL]/g, '')) - parseFloat(a.volume24h.replace(/[₹CrL]/g, ''));
        case 'newest':
          return b.isPopular ? 1 : -1; // Use popular as proxy for newest
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, ratingFilter, sectorFilter, investmentFilter, maturityFilter, sortBy]);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bond Token Marketplace</h1>
            <div className="flex items-center space-x-6 text-muted-foreground">
              <span>24 bonds available</span>
              <span>•</span>
              <span>Average 8.7% YTM</span>
              <span>•</span>
              <span>₹12L traded today</span>
            </div>
            <p className="text-lg text-primary mt-2">Own fractions of premium bonds starting from ₹100</p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available to invest</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(userBalance)} INR Tokens</p>
              </div>
              <Button className="btn-primary">
                <IndianRupee className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </div>
          </div>
        </div>

        {/* Educational Panel */}
        <div className="bg-primary-muted/30 border border-primary-muted rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Quick Bond Guide</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground flex items-center space-x-1">
                <Target className="w-4 h-4 text-primary" />
                <span>What's YTM?</span>
              </h3>
              <p className="text-sm text-muted-foreground">Your total returns if held till maturity, including coupons</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground flex items-center space-x-1">
                <Award className="w-4 h-4 text-success" />
                <span>Credit Ratings</span>
              </h3>
              <p className="text-sm text-muted-foreground">AAA = Safest (like Reliance), AA+ = Very Safe, A+ = Safe</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>How Coupons Work</span>
              </h3>
              <p className="text-sm text-muted-foreground">Quarterly interest payments directly to your wallet</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground flex items-center space-x-1">
                <BarChart3 className="w-4 h-4 text-warning" />
                <span>Token Trading</span>
              </h3>
              <p className="text-sm text-muted-foreground">Buy/sell anytime. Price varies with demand and interest rates</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by company name, sector, or rating..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-4">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="AAA">AAA</SelectItem>
                <SelectItem value="AA+">AA+</SelectItem>
                <SelectItem value="AA">AA</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="FMCG">FMCG</SelectItem>
                <SelectItem value="Financial Services">Financial Services</SelectItem>
              </SelectContent>
            </Select>

            <Select value={investmentFilter} onValueChange={setInvestmentFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Investment Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="100-1k">₹100 - ₹1K</SelectItem>
                <SelectItem value="1k-10k">₹1K - ₹10K</SelectItem>
                <SelectItem value="10k+">₹10K+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={maturityFilter} onValueChange={setMaturityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Tenures" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenures</SelectItem>
                <SelectItem value="1-3y">1-3 years</SelectItem>
                <SelectItem value="3-7y">3-7 years</SelectItem>
                <SelectItem value="7y+">7+ years</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex space-x-1">
                <Button 
                  variant={sortBy === 'ytm-high' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('ytm-high')}
                >
                  Highest YTM
                </Button>
                <Button 
                  variant={sortBy === 'rating' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('rating')}
                >
                  Best Rating
                </Button>
                <Button 
                  variant={sortBy === 'volume' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('volume')}
                >
                  Most Traded
                </Button>
                <Button 
                  variant={sortBy === 'newest' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('newest')}
                >
                  Newest
                </Button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredBonds.length} bonds matching your criteria
          </p>
        </div>

        {/* Bond Token Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBonds.map((bond) => {
            const investmentAmount = parseFloat(investmentAmounts[bond.id] || '0');
            const tokensCalculated = calculateTokens(bond.id, investmentAmount);
            const couponIncome = calculateCoupons(bond.id, investmentAmount);
            const maturityPayout = calculateMaturityPayout(bond.id, investmentAmount);
            const maxAffordableTokens = Math.floor(userBalance / bond.tokenPrice);

            return (
              <Card key={bond.id} className="hover:shadow-medium transition-all duration-200 overflow-hidden">
                <CardHeader className="pb-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {bond.tags.includes('popular') && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {bond.tags.includes('new') && (
                        <Badge variant="outline" className="text-xs">New</Badge>
                      )}
                      <Badge className={`text-xs ${getRatingColor(bond.rating)}`}>
                        {bond.rating}
                      </Badge>
                    </div>
                    <Heart className="w-5 h-5 text-muted-foreground hover:text-danger cursor-pointer transition-colors" />
                  </div>

                  <div>
                    <CardTitle className="text-lg leading-tight">{bond.name}</CardTitle>
                    <CardDescription className="text-sm">{bond.issuer}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-background-secondary rounded-lg">
                    <div className="text-center">
                      <Tooltip>
                        <TooltipTrigger>
                          <p className="text-xs text-muted-foreground">YTM</p>
                          <p className="text-lg font-bold text-success">{bond.ytm}%</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Yield to Maturity - Your total returns if held till maturity</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Token Price</p>
                      <p className="text-lg font-bold">{formatCurrency(bond.tokenPrice)}</p>
                      <p className={`text-xs ${bond.priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                        {bond.priceChange >= 0 ? '+' : ''}{formatCurrency(bond.priceChange)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-lg font-bold">{bond.availableTokens}/{bond.totalTokens}</p>
                    </div>
                  </div>

                  {/* Investment Calculator */}
                  <div className="space-y-3 p-3 bg-primary-muted/20 rounded-lg">
                    <h4 className="font-medium text-foreground">Investment Calculator</h4>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Your Investment:</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0"
                          value={investmentAmounts[bond.id] || ''}
                          onChange={(e) => updateInvestmentAmount(bond.id, e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      
                      {/* Quick Amount Buttons */}
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateInvestmentAmount(bond.id, '1000')}
                        >
                          ₹1K
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateInvestmentAmount(bond.id, '5000')}
                        >
                          ₹5K
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateInvestmentAmount(bond.id, '10000')}
                        >
                          ₹10K
                        </Button>
                      </div>
                    </div>

                    {/* Calculations */}
                    {investmentAmount > 0 && (
                      <div className="space-y-1 text-sm">
                        <p className="text-foreground">
                          You'll get: <span className="font-semibold">{tokensCalculated.toFixed(2)} tokens</span>
                        </p>
                        <p className="text-muted-foreground">
                          Quarterly coupons: {formatCurrency(couponIncome)}
                        </p>
                        <p className="text-muted-foreground">
                          At maturity: {formatCurrency(maturityPayout)}
                        </p>
                      </div>
                    )}

                    {/* Balance Check */}
                    <p className="text-xs text-muted-foreground">
                      You can afford {maxAffordableTokens} tokens (max {formatCurrency(maxAffordableTokens * bond.tokenPrice)})
                    </p>
                  </div>

                  {/* Live Market Data */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>24h Vol: {bond.volume24h}</span>
                    <div className="flex items-center space-x-1">
                      <span className={bond.priceChangePercent >= 0 ? 'text-success' : 'text-danger'}>
                        {bond.priceChangePercent >= 0 ? '+' : ''}{bond.priceChangePercent}%
                      </span>
                      {bond.priceChangePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-success" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-danger" />
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1"
                      disabled={!canAfford(investmentAmount) || investmentAmount <= 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {!canAfford(investmentAmount) && investmentAmount > 0 
                        ? `Add ${formatCurrency(investmentAmount - userBalance)} More`
                        : 'Buy Now'
                      }
                    </Button>
                    <Button variant="outline" size="default" asChild>
                      <Link to={`/bond-details/${bond.id}`}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredBonds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No bonds found matching your criteria</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Marketplace;