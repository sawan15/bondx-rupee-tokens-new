import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, AlertCircle, TrendingUp, TrendingDown, BarChart3, Calendar, IndianRupee, Users, Shield, Info, CheckCircle, XCircle, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { ApiService, BondDetailsResponse, WalletResponse, OrderRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const BondDetails = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // State
  const [bondDetails, setBondDetails] = useState<BondDetailsResponse | null>(null);
  const [walletData, setWalletData] = useState<WalletResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Trading state
  const [activeTab, setActiveTab] = useState('overview');
  const [tradingTab, setTradingTab] = useState<'buy' | 'sell'>('buy');
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [numTokens, setNumTokens] = useState(0);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  
  // Risk acknowledgment
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [priceFluctuation, setPriceFluctuation] = useState(false);
  const [lossRisk, setLossRisk] = useState(false);

  // Fetch bond details
  const fetchBondDetails = async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching bond details for symbol:', symbol);
      const response = await ApiService.getBondDetails(symbol);
      
      if (response.status === 'success') {
        setBondDetails(response);
      } else {
        throw new Error('Failed to fetch bond details');
      }
    } catch (error: any) {
      console.error('Bond details fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wallet data
  const fetchWalletData = async () => {
    if (!user?.id) return;
    
    setIsLoadingWallet(true);
    
    try {
      const response = await ApiService.getUserWallet(user.id);
      if (response.status === 'success') {
        setWalletData(response.data);
      }
    } catch (error: any) {
      console.error('Wallet fetch error:', error);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  useEffect(() => {
    fetchBondDetails();
    fetchWalletData();
  }, [symbol, user?.id]);

  // Calculations
  const userBalance = useMemo(() => {
    return walletData?.available ? parseFloat(walletData.available) : 0;
  }, [walletData]);

  const tokenPrice = useMemo(() => {
    return bondDetails ? parseFloat(bondDetails.data.current_price) : 0;
  }, [bondDetails]);

  const totalCost = useMemo(() => {
    return numTokens * tokenPrice;
  }, [numTokens, tokenPrice]);

  const canAfford = useMemo(() => {
    return totalCost <= userBalance;
  }, [totalCost, userBalance]);

  const allRisksAcknowledged = useMemo(() => {
    return riskAcknowledged && priceFluctuation && lossRisk;
  }, [riskAcknowledged, priceFluctuation, lossRisk]);

  // Handle investment amount change
  const handleInvestmentChange = (value: number) => {
    setInvestmentAmount(value);
    if (tokenPrice > 0) {
      setNumTokens(Math.floor(value / tokenPrice));
    }
  };

  // Handle token quantity change
  const handleTokensChange = (value: number) => {
    setNumTokens(value);
    setInvestmentAmount(value * tokenPrice);
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!user?.id || !symbol || !bondDetails) {
      toast({
        title: "Error",
        description: "Missing required data for order placement",
        variant: "destructive"
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "Insufficient Funds",
        description: `You need ₹${(totalCost - userBalance).toLocaleString()} more to place this order`,
        variant: "destructive"
      });
      return;
    }

    if (!allRisksAcknowledged) {
      toast({
        title: "Risk Acknowledgment Required",
        description: "Please acknowledge all risk factors before placing the order",
        variant: "destructive"
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData: OrderRequest = {
        user_id: user.id,
        bond_symbol: symbol,
        order_type: 'buy',
        amount: investmentAmount.toString(),
        order_mode: orderType,
        ...(orderType === 'limit' && limitPrice && { price: limitPrice })
      };

      const response = await ApiService.placeOrder(orderData);

      if (response.status === 'success') {
        toast({
          title: "Order Placed Successfully",
          description: `${orderType.toUpperCase()} order for ₹${investmentAmount} (${numTokens} tokens) has been placed.`,
        });

        // Reset form
        setInvestmentAmount(0);
        setNumTokens(0);
        setRiskAcknowledged(false);
        setPriceFluctuation(false);
        setLossRisk(false);

        // Refresh wallet data
        await fetchWalletData();
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive"
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Loading Bond Details...</h1>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">Fetching bond information...</p>
            <p className="text-sm text-muted-foreground">
              Loading data from {symbol || 'bond API'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !bondDetails) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Bond Details</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Bond Details</h3>
            <p className="text-muted-foreground mb-4">
              {error || `Bond ${symbol} not found`}
            </p>
            <div className="space-x-2">
              <Button onClick={fetchBondDetails}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate('/marketplace')}>
                Back to Marketplace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bond = bondDetails.data;
  
  // Enhanced bond data with fallbacks
  const bondInfo = {
    ...bond,
    issuer: 'Corporate Issuer', // Fallback
    sector: 'Corporate', // Fallback
    rating: 'A+', // Fallback
    tags: ['corporate'], // Fallback
    total_tokens: '1000', // Fallback
    available_tokens: '500', // Fallback
    volume_24h: '₹2.3Cr', // Fallback
    coupon_rate: bond.yield_rate, // Using yield_rate as coupon_rate
    minimum_investment: '1000' // Fallback
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
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
                <Badge className={getRatingColor(bondInfo.rating)}>{bondInfo.rating}</Badge>
              </div>
              <p className="text-lg text-muted-foreground">{bondInfo.issuer}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-foreground">{formatCurrency(bond.current_price)}</span>
                  <div className={`flex items-center space-x-1 ${parseFloat(bond.change) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {parseFloat(bond.change) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {parseFloat(bond.change) >= 0 ? '+' : ''}{formatCurrency(bond.change)} ({parseFloat(bond.change_percent) >= 0 ? '+' : ''}{bond.change_percent}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {bondInfo.tags.includes('popular') && <Badge variant="secondary">🔥 Most Traded</Badge>}
                  <Badge variant="outline">{bondInfo.sector} Sector</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center cursor-help">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-foreground">{bond.yield_rate}%</div>
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
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(bond.current_price)}</div>
                    <div className="text-sm text-muted-foreground">Token Price</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current market price per token. Face value ₹{parseFloat(bond.face_value).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="text-center cursor-help">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-foreground">{bondInfo.available_tokens}/{bondInfo.total_tokens}</div>
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
                    <div className="text-2xl font-bold text-foreground">₹{((parseFloat(bond.current_price) * parseFloat(bondInfo.total_tokens)) / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total value of all tokens (Token Price × {bondInfo.total_tokens} tokens)</p>
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
                        <span className="text-muted-foreground">Symbol:</span>
                        <span className="font-medium">{bond.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Price:</span>
                        <span className="font-medium">{formatCurrency(bond.current_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Face Value:</span>
                        <span className="font-medium">{formatCurrency(bond.face_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity Date:</span>
                        <span className="font-medium">{formatDate(bond.maturity_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yield Rate:</span>
                        <span className="font-medium">{bond.yield_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-medium ${bond.is_active ? 'text-success' : 'text-destructive'}`}>
                          {bond.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Token Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Tokens:</span>
                        <span className="font-medium">{bondInfo.total_tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available Tokens:</span>
                        <span className="font-medium">{bondInfo.available_tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">24h Volume:</span>
                        <span className="font-medium">{bondInfo.volume_24h}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Investment:</span>
                        <span className="font-medium">₹{bondInfo.minimum_investment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change (24h):</span>
                        <span className={`font-medium ${parseFloat(bond.change) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {parseFloat(bond.change) >= 0 ? '+' : ''}{bond.change_percent}%
                        </span>
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
                      This bond is issued by a corporate entity with strong financial fundamentals. 
                      The issuer has a solid track record of meeting its debt obligations.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Sector:</span>
                        <span className="ml-2 font-medium">{bondInfo.sector}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <span className="ml-2 font-medium">{bondInfo.rating}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="ml-2 font-medium">Financial Services</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Listing:</span>
                        <span className="ml-2 font-medium">BSE, NSE</span>
                      </div>
                    </div>
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
                        <span className="font-medium">{bondInfo.coupon_rate}% per annum</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Frequency:</span>
                        <span className="font-medium">Quarterly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity Amount:</span>
                        <span className="font-medium">{formatCurrency(bond.face_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Settlement:</span>
                        <span className="font-medium">T+0 (instant)</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Security Type:</span>
                        <span className="font-medium">Unsecured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trading:</span>
                        <span className="font-medium">24/7 on BondX platform</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Custodian:</span>
                        <span className="font-medium">Digital Custody</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="risks" className="space-y-4">
                <div className="space-y-4">
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertCircle className="w-5 h-5" />
                        <span>Token Price Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Token prices fluctuate based on supply and demand. Current price ₹{parseFloat(bond.current_price).toFixed(2)} may go up or down.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertCircle className="w-5 h-5" />
                        <span>Credit Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Risk that the issuer may default on payments. {bondInfo.rating} rating indicates low risk.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-warning">
                        <AlertCircle className="w-5 h-5" />
                        <span>Liquidity Risk</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        You may not find buyers when you want to sell. Our platform provides market making to reduce this risk.
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
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span>Live Order Book</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Current Price: <span className="font-medium text-foreground">{formatCurrency(bond.current_price)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Face Value: {formatCurrency(bond.face_value)}
                  </div>
                </div>
                
                {bond.order_book?.bids || bond.order_book?.asks ? (
                  <div className="text-center text-sm text-success">
                    Live order book data available
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    No active orders currently
                  </div>
                )}
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
                    </div>
                    
                    {/* Limit Price (if limit order) */}
                    {orderType === 'limit' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Price per Token</label>
                        <Input
                          type="number"
                          placeholder="₹1000.00"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                        />
                      </div>
                    )}
                    
                    {/* Investment Amount */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Investment Amount (INR)</label>
                      <Input
                        type="number"
                        placeholder="₹0"
                        value={investmentAmount || ''}
                        onChange={(e) => handleInvestmentChange(parseFloat(e.target.value) || 0)}
                      />
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleInvestmentChange(1000)}>₹1K</Button>
                        <Button variant="outline" size="sm" onClick={() => handleInvestmentChange(5000)}>₹5K</Button>
                        <Button variant="outline" size="sm" onClick={() => handleInvestmentChange(10000)}>₹10K</Button>
                        <Button variant="outline" size="sm" onClick={() => handleInvestmentChange(25000)}>₹25K</Button>
                      </div>
                    </div>
                    
                    {/* Number of Tokens */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Tokens</label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTokensChange(Math.max(0, numTokens - 1))}
                          disabled={numTokens <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={numTokens || ''}
                          onChange={(e) => handleTokensChange(parseFloat(e.target.value) || 0)}
                          className="text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTokensChange(numTokens + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Order Summary */}
                    {investmentAmount > 0 && (
                      <div className="bg-muted/30 border rounded p-3 space-y-2">
                        <h4 className="text-sm font-medium">Order Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Investment Amount:</span>
                            <span>₹{investmentAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Token Price:</span>
                            <span>₹{tokenPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tokens You'll Get:</span>
                            <span className="font-medium">{numTokens} tokens</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total Cost:</span>
                            <span className="font-medium">₹{totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Balance Check */}
                    <div className="bg-muted/30 border rounded p-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available Balance:</span>
                          <span className="font-medium">₹{userBalance.toLocaleString()}</span>
                        </div>
                        {investmentAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">After Purchase:</span>
                            <span className={`font-medium ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                              ₹{(userBalance - totalCost).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">You currently own:</p>
                      <p className="text-2xl font-bold">0 tokens</p>
                      <p className="text-sm text-muted-foreground">of this bond</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setTradingTab('buy')}
                      >
                        Buy Tokens First
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Risk Disclosure */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
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
                      disabled={!allRisksAcknowledged || !canAfford || investmentAmount <= 0 || isPlacingOrder}
                      onClick={handlePlaceOrder}
                    >
                      {isPlacingOrder ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : !canAfford && investmentAmount > 0 ? (
                        `Add ₹${(totalCost - userBalance).toLocaleString()} More`
                      ) : (
                        'Buy Tokens'
                      )}
                    </Button>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      Add to Watchlist
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/marketplace')}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Debug Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span>Bond Details API</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isLoadingWallet ? 'bg-warning animate-pulse' : walletData ? 'bg-success' : 'bg-destructive'}`}></div>
                    <span>Wallet API</span>
                  </div>
                  
                  <div className="bg-muted p-3 rounded text-xs">
                    <p className="font-medium mb-1">Endpoint:</p>
                    <p className="break-all">
                      https://ff616ef0fdef.ngrok-free.app/api/bonds/{symbol}
                    </p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Balance: ₹{userBalance.toLocaleString()}</p>
                    <p>Trading: {bond.is_active ? 'Available' : 'Not Available'}</p>
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