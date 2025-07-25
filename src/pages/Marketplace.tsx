import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, TrendingDown, Heart, ShoppingCart, BarChart3, Star, Lightbulb, Award, Calendar, Target, IndianRupee, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ApiService, BondApiResponse } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Bond {
  id: string;               // from API: symbol
  name: string;             // from API: name
  issuer: string;           // static fallback
  rating: string;           // static fallback  
  sector: string;           // static fallback
  ytm: number;              // from API: yield_rate
  tokenPrice: number;       // from API: current_price
  priceChange: number;      // from API: change
  priceChangePercent: number; // from API: change_percent
  totalTokens: number;      // static fallback
  availableTokens: number;  // static fallback
  volume24h: string;        // static fallback
  maturityDate: string;     // from API: maturity_date
  maturityYears: number;    // calculated from maturity_date
  couponRate: number;       // use ytm as fallback
  tags: string[];           // static fallback
  isPopular: boolean;       // static fallback
  isActive: boolean;        // from API: is_active
}

// Static fallback data for fields not available in API
const staticBondData: Record<string, Partial<Bond>> = {
  'RELIANCE25': {
    issuer: 'Reliance Industries Limited',
    rating: 'AAA',
    sector: 'Energy',
    totalTokens: 150,
    availableTokens: 67,
    volume24h: '₹2.3Cr',
    tags: ['popular'],
    isPopular: true
  },
  'TATA24': {
    issuer: 'Tata Motors Limited',
    rating: 'AA+',
    sector: 'Automotive',
    totalTokens: 120,
    availableTokens: 85,
    volume24h: '₹1.5Cr',
    tags: [],
    isPopular: false
  },
  'HDFC26': {
    issuer: 'HDFC Bank Limited',
    rating: 'AAA',
    sector: 'Banking',
    totalTokens: 200,
    availableTokens: 156,
    volume24h: '₹1.8Cr',
    tags: [],
    isPopular: false
  },
  'ICICI27': {
    issuer: 'ICICI Bank Limited',
    rating: 'AAA',
    sector: 'Banking',
    totalTokens: 180,
    availableTokens: 132,
    volume24h: '₹1.2Cr',
    tags: [],
    isPopular: false
  },
  'INFOSYS28': {
    issuer: 'Infosys Limited',
    rating: 'AA+',
    sector: 'Technology',
    totalTokens: 100,
    availableTokens: 45,
    volume24h: '₹95L',
    tags: ['new'],
    isPopular: false
  }
};

// Function to calculate years to maturity from date string
const calculateMaturityYears = (maturityDate: string): number => {
  const maturity = new Date(maturityDate);
  const now = new Date();
  const diffTime = maturity.getTime() - now.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, parseFloat(diffYears.toFixed(1)));
};

// Function to transform API bond data to UI Bond interface
const transformApiBondToUIBond = (apiBond: BondApiResponse): Bond => {
  const staticData = staticBondData[apiBond.symbol] || {};
  
  return {
    id: apiBond.symbol,
    name: apiBond.name,
    issuer: staticData.issuer || 'Unknown Issuer',
    rating: staticData.rating || 'Unrated',
    sector: staticData.sector || 'Other',
    ytm: parseFloat(apiBond.yield_rate),
    tokenPrice: parseFloat(apiBond.current_price),
    priceChange: parseFloat(apiBond.change),
    priceChangePercent: parseFloat(apiBond.change_percent),
    totalTokens: staticData.totalTokens || 100,
    availableTokens: staticData.availableTokens || 50,
    volume24h: staticData.volume24h || '₹50L',
    maturityDate: apiBond.maturity_date,
    maturityYears: calculateMaturityYears(apiBond.maturity_date),
    couponRate: parseFloat(apiBond.yield_rate), // Use YTM as coupon rate fallback
    tags: staticData.tags || [],
    isPopular: staticData.isPopular || false,
    isActive: apiBond.is_active
  };
};

const Marketplace = () => {
  const { user } = useAuthStore();
  
  // API state
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [marketStats, setMarketStats] = useState({ totalBonds: 0, averageYtm: '0', volumeToday: '₹0' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [investmentFilter, setInvestmentFilter] = useState('all');
  const [maturityFilter, setMaturityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ytm-high');

  // Investment calculator states for each bond
  const [investmentAmounts, setInvestmentAmounts] = useState<{[key: string]: string}>({});

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch bonds data (always fetch, regardless of auth)
        try {
          const bondsResponse = await ApiService.getBonds();
          
          if (bondsResponse.status === 'success') {
            const transformedBonds = bondsResponse.data.map(transformApiBondToUIBond);
            setBonds(transformedBonds);
          } else {
            throw new Error('API returned error status');
          }
        } catch (apiError) {
          // Fallback to static demo data when API is not available
          const { demoBondTokens } = await import('@/data/demoData');
          // Convert BondToken to Bond format
          const fallbackBonds: Bond[] = demoBondTokens.map(token => ({
            id: token.id,
            name: token.name,
            issuer: token.issuer,
            rating: token.rating,
            sector: token.sector,
            ytm: token.ytm,
            tokenPrice: token.tokenPrice,
            priceChange: token.priceChange24h,
            priceChangePercent: token.priceChangePercent24h,
            totalTokens: token.totalTokens,
            availableTokens: token.availableTokens,
            volume24h: token.volume24hValue,
            maturityDate: token.maturityDate.toISOString().split('T')[0],
            maturityYears: token.maturityYears,
            couponRate: token.couponRate,
            tags: [],
            isPopular: token.isPopular,
            isActive: true // Assume all demo bonds are active
          }));
          setBonds(fallbackBonds);
        }

        // Fetch user dashboard if user is authenticated
        if (user?.id) {
          try {
            const dashboardResponse = await ApiService.getUserDashboard(user.id);
            
            if (dashboardResponse.status === 'success') {
              setUserBalance(parseFloat(dashboardResponse.data.user.available_to_invest));
              setMarketStats({
                totalBonds: dashboardResponse.data.marketplace_stats.total_bonds,
                averageYtm: dashboardResponse.data.marketplace_stats.average_ytm,
                volumeToday: '₹12L' // Static fallback for volume
              });
            }
          } catch (userError) {
            // Continue with default values if user data fails
            setUserBalance(0);
          }
        } else {
          // Use fallback data if user not authenticated
          setUserBalance(0);
          setMarketStats({
            totalBonds: bonds.length,
            averageYtm: '8.7',
            volumeToday: '₹12L'
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch marketplace data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]); // Re-fetch when user changes

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
    const bond = bonds.find(b => b.id === bondId);
    if (!bond) return 0;
    return amount / bond.tokenPrice;
  };

  const calculateCoupons = (bondId: string, amount: number) => {
    const bond = bonds.find(b => b.id === bondId);
    if (!bond) return 0;
    const tokens = calculateTokens(bondId, amount);
    return (tokens * bond.couponRate * 1000) / 4; // Quarterly coupons
  };

  const calculateMaturityPayout = (bondId: string, amount: number) => {
    const bond = bonds.find(b => b.id === bondId);
    if (!bond) return 0;
    const tokens = calculateTokens(bondId, amount);
    return tokens * 1000; // Par value
  };

  const canAfford = (amount: number) => {
    return amount <= userBalance;
  };

  // Filter and search logic
  const filteredBonds = useMemo(() => {
    let filtered = bonds.filter(bond => {
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
  }, [bonds, searchQuery, ratingFilter, sectorFilter, investmentFilter, maturityFilter, sortBy]);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Bond Token Marketplace</h1>
            {isLoading ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading marketplace data...</span>
              </div>
            ) : error ? (
              <div className="text-destructive">
                <span>Error loading data: {error}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-6 text-muted-foreground">
                <span>{marketStats.totalBonds} bonds available</span>
                <span>•</span>
                <span>Average {marketStats.averageYtm}% YTM</span>
                <span>•</span>
                <span>{marketStats.volumeToday} traded today</span>
              </div>
            )}
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
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg text-muted-foreground">Loading bonds...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-2">Failed to load bonds</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : (
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
        )}

        {!isLoading && !error && filteredBonds.length === 0 && (
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