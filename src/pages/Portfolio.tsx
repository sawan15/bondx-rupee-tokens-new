import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Calendar, IndianRupee, Eye, Download, Plus, ArrowUpDown, Filter, TrendingDown, BarChart3, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { ApiService, PortfolioHolding } from '@/lib/api';

// Get API base URL for debugging
const API_BASE_URL = 'https://818b612f3950.ngrok-free.app/api'; // Reference: http://localhost:8080/api
import { formatCurrency } from '@/lib/utils';

// Demo portfolio performance data (last 6 months)
const performanceData = [
  { month: 'Aug', value: 47250, returns: 2.8 },
  { month: 'Sep', value: 48100, returns: 4.1 },
  { month: 'Oct', value: 49750, returns: 5.9 },
  { month: 'Nov', value: 51200, returns: 7.2 },
  { month: 'Dec', value: 52850, returns: 8.6 },
  { month: 'Jan', value: 55237, returns: 9.8 }
];

// Demo coupon projections (next 12 months)
const couponProjections = [
  { month: 'Feb', amount: 1250, bonds: 3 },
  { month: 'Mar', amount: 1820, bonds: 4 },
  { month: 'Apr', amount: 925, bonds: 2 },
  { month: 'May', amount: 1640, bonds: 3 },
  { month: 'Jun', amount: 2180, bonds: 5 },
  { month: 'Jul', amount: 1350, bonds: 3 },
  { month: 'Aug', amount: 1750, bonds: 4 },
  { month: 'Sep', amount: 2050, bonds: 4 },
  { month: 'Oct', amount: 1480, bonds: 3 },
  { month: 'Nov', amount: 1920, bonds: 4 },
  { month: 'Dec', amount: 2280, bonds: 5 },
  { month: 'Jan', amount: 1680, bonds: 3 }
];

// Demo holdings data for Priya (experienced user)
const priyaHoldings = [
  {
    id: 'rel-85-27',
    bondName: 'Reliance Industries 8.5% 2027',
    bondId: 'rel-power-27',
    issuer: 'Reliance Industries',
    sector: 'Energy',
    rating: 'AAA',
    tokensOwned: 15.25,
    avgPurchasePrice: 99.80,
    currentTokenPrice: 100.15,
    totalInvested: 15500,
    currentValue: 15273,
    unrealizedPnl: -227,
    unrealizedPnlPercent: -1.46,
    couponRate: 8.5,
    nextCouponDate: '2025-03-15',
    nextCouponAmount: 323.75,
    maturityDate: '2027-08-15',
    ytm: 8.72
  },
  {
    id: 'hdfc-78-26',
    bondName: 'HDFC Bank 7.8% 2026',
    bondId: 'hdfc-bank-26',
    issuer: 'HDFC Bank',
    sector: 'Banking',
    rating: 'AAA',
    tokensOwned: 18.75,
    avgPurchasePrice: 101.20,
    currentTokenPrice: 102.45,
    totalInvested: 19000,
    currentValue: 19209,
    unrealizedPnl: 209,
    unrealizedPnlPercent: 1.10,
    couponRate: 7.8,
    nextCouponDate: '2025-02-28',
    nextCouponAmount: 365.25,
    maturityDate: '2026-11-30',
    ytm: 7.45
  },
  {
    id: 'tcs-74-28',
    bondName: 'TCS Limited 7.4% 2028',
    bondId: 'tcs-tech-28',
    issuer: 'TCS Limited',
    sector: 'Technology',
    rating: 'AA+',
    tokensOwned: 12.50,
    avgPurchasePrice: 98.50,
    currentTokenPrice: 99.85,
    totalInvested: 12500,
    currentValue: 12481,
    unrealizedPnl: -19,
    unrealizedPnlPercent: -0.15,
    couponRate: 7.4,
    nextCouponDate: '2025-04-10',
    nextCouponAmount: 231.25,
    maturityDate: '2028-04-10',
    ytm: 7.58
  },
  {
    id: 'icici-72-25',
    bondName: 'ICICI Bank 7.2% 2025',
    bondId: 'icici-bank-25',
    issuer: 'ICICI Bank',
    sector: 'Banking',
    rating: 'AA+',
    tokensOwned: 8.25,
    avgPurchasePrice: 102.80,
    currentTokenPrice: 103.20,
    totalInvested: 8500,
    currentValue: 8514,
    unrealizedPnl: 14,
    unrealizedPnlPercent: 0.16,
    couponRate: 7.2,
    nextCouponDate: '2025-06-15',
    nextCouponAmount: 148.50,
    maturityDate: '2025-12-15',
    ytm: 6.95
  }
];

const Portfolio = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { resetDemo } = useAppStore();
  
  // API state
  const [portfolioData, setPortfolioData] = useState<{
    holdings: PortfolioHolding[];
    summary: {
      total_invested: string;
      total_market_value: string;
      total_pnl: string;
      total_pnl_percent: string;
    };
  } | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [bondsData, setBondsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState('currentValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeFilter, setTimeFilter] = useState('6M');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch portfolio data and related APIs
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch portfolio, dashboard, and bonds data in parallel
        const [portfolioResponse, dashboardResponse, bondsResponse] = await Promise.allSettled([
          ApiService.getUserPortfolio(user.id),
          ApiService.getUserDashboard(user.id),
          ApiService.getBonds()
        ]);

        // Handle portfolio response
        if (portfolioResponse.status === 'fulfilled' && portfolioResponse.value.status === 'success') {
          setPortfolioData(portfolioResponse.value.data);
        } else {
          // Use fallback empty portfolio as mentioned in API docs
          setPortfolioData({
            holdings: [],
            summary: {
              total_invested: "0",
              total_market_value: "0",
              total_pnl: "0",
              total_pnl_percent: "0"
            }
          });
        }

        // Handle dashboard response
        if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value.status === 'success') {
          setDashboardData(dashboardResponse.value.data);
        }

        // Handle bonds response
        if (bondsResponse.status === 'fulfilled' && bondsResponse.value.status === 'success') {
          setBondsData(bondsResponse.value.data);
        }

      } catch (err: any) {
        setError(err.message);
        console.error('Portfolio API Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]);

  // Function to fetch detailed bond information on demand
  const fetchBondDetails = async (symbol: string) => {
    try {
      const response = await ApiService.getBondDetails(symbol);
      if (response.status === 'success') {
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to fetch details for bond ${symbol}:`, error);
    }
    return null;
  };

  // Refresh all portfolio data
  const refreshPortfolioData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [portfolioResponse, dashboardResponse, bondsResponse] = await Promise.allSettled([
        ApiService.getUserPortfolio(user.id),
        ApiService.getUserDashboard(user.id),
        ApiService.getBonds()
      ]);

      if (portfolioResponse.status === 'fulfilled' && portfolioResponse.value.status === 'success') {
        setPortfolioData(portfolioResponse.value.data);
      }

      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value.status === 'success') {
        setDashboardData(dashboardResponse.value.data);
      }

      if (bondsResponse.status === 'fulfilled' && bondsResponse.value.status === 'success') {
        setBondsData(bondsResponse.value.data);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
    // Transform API holdings to display format with enhanced bond data
  const holdings = useMemo(() => {
    if (!portfolioData?.holdings || portfolioData.holdings.length === 0) {
      // Return empty array if no holdings (as per API docs: "holdings": null)
      return [];
    }

    return portfolioData.holdings.map((holding: PortfolioHolding) => {
      // Find corresponding bond data for enhanced information
      const bondInfo = bondsData.find(bond => bond.symbol === holding.symbol);
      
      return {
        id: holding.symbol,
        bondName: holding.name,
        bondId: holding.symbol,
        issuer: holding.name.split(' ')[0], // Extract issuer from bond name
        sector: bondInfo?.sector || 'Corporate', // Enhanced with bond data
        rating: 'AAA', // Static fallback - could be enhanced with bond rating API
        tokensOwned: parseFloat(holding.quantity),
        avgPurchasePrice: parseFloat(holding.average_buy_price),
        currentTokenPrice: parseFloat(holding.current_price),
        totalInvested: parseFloat(holding.total_cost),
        currentValue: parseFloat(holding.market_value),
        unrealizedPnl: parseFloat(holding.pnl),
        unrealizedPnlPercent: parseFloat(holding.pnl_percent),
        couponRate: bondInfo ? parseFloat(bondInfo.yield_rate) : 7.5, // Use real yield rate
        nextCouponDate: new Date(new Date().getFullYear(), new Date().getMonth() + 3, 15), // Quarterly
        nextCouponAmount: parseFloat(holding.market_value) * (bondInfo ? parseFloat(bondInfo.yield_rate) : 7.5) / 100 / 4, // Real coupon calculation
        maturityDate: bondInfo ? new Date(bondInfo.maturity_date) : new Date(new Date().getFullYear() + 2, 6, 25),
        ytm: bondInfo ? parseFloat(bondInfo.yield_rate) : 7.5, // Real YTM from bond data
        purchaseHistory: [{
          date: new Date().toISOString(),
          tokens: parseFloat(holding.quantity),
          price: parseFloat(holding.average_buy_price)
        }],
        // Additional bond information
        change: bondInfo ? parseFloat(bondInfo.change) : 0,
        changePercent: bondInfo ? parseFloat(bondInfo.change_percent) : 0,
        isActive: bondInfo ? bondInfo.is_active : true
      };
    });
   }, [portfolioData?.holdings, bondsData]);

  // Portfolio calculations using API data with fallbacks
  const portfolioMetrics = useMemo(() => {
    // Use API summary data if available, otherwise use fallback defaults
    const summary = portfolioData?.summary;
    const dashboard = dashboardData;
    
    if (!summary && holdings.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        totalCouponsEarned: 0,
        nextCouponAmount: 0,
        nextCouponDate: null as string | null,
        avgYtm: dashboard?.marketplace_stats?.average_ytm ? parseFloat(dashboard.marketplace_stats.average_ytm) : 0,
        walletBalance: dashboard?.user?.wallet_balance ? parseFloat(dashboard.user.wallet_balance) : 0,
        availableToInvest: dashboard?.user?.available_to_invest ? parseFloat(dashboard.user.available_to_invest) : 0
      };
    }

    // Use API data if available, fallback to calculated values or defaults
    const totalInvested = summary ? parseFloat(summary.total_invested) : holdings.reduce((sum, h) => sum + h.totalInvested, 0);
    const currentValue = summary ? parseFloat(summary.total_market_value) : holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const unrealizedPnl = summary ? parseFloat(summary.total_pnl) : currentValue - totalInvested;
    const unrealizedPnlPercent = summary ? parseFloat(summary.total_pnl_percent) : (totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0);
    
    // Find next coupon
    const upcomingCoupons = holdings
      .filter(h => h.nextCouponDate)
      .sort((a, b) => new Date(a.nextCouponDate).getTime() - new Date(b.nextCouponDate).getTime());
    
    const nextCoupon = upcomingCoupons[0];
    const avgYtm = holdings.reduce((sum, h) => sum + (h.ytm || 0), 0) / holdings.length;

    return {
      totalInvested,
      currentValue,
      unrealizedPnl,
      unrealizedPnlPercent,
      totalCouponsEarned: 2850, // Demo value - could be calculated from holdings
      nextCouponAmount: nextCoupon?.nextCouponAmount || 0,
      nextCouponDate: nextCoupon?.nextCouponDate || null,
      avgYtm: avgYtm || (dashboard?.marketplace_stats?.average_ytm ? parseFloat(dashboard.marketplace_stats.average_ytm) : 0),
      walletBalance: dashboard?.user?.wallet_balance ? parseFloat(dashboard.user.wallet_balance) : 0,
      availableToInvest: dashboard?.user?.available_to_invest ? parseFloat(dashboard.user.available_to_invest) : 0
    };
  }, [portfolioData?.summary, holdings, dashboardData]);

  // Allocation calculations
  const allocationData = useMemo(() => {
    if (holdings.length === 0) return { sector: [], rating: [], maturity: [] };

    const sectorMap = new Map();
    const ratingMap = new Map();
    const maturityMap = new Map();

    holdings.forEach(holding => {
      // Sector allocation
      const sectorValue = sectorMap.get(holding.sector) || 0;
      sectorMap.set(holding.sector, sectorValue + holding.currentValue);

      // Rating allocation  
      const ratingValue = ratingMap.get(holding.rating) || 0;
      ratingMap.set(holding.rating, ratingValue + holding.currentValue);

      // Maturity buckets
      const maturityDate = new Date(holding.maturityDate);
      const yearsToMaturity = (maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365);
      let bucket = '5yr+';
      if (yearsToMaturity <= 1) bucket = '0-1yr';
      else if (yearsToMaturity <= 3) bucket = '1-3yr';
      else if (yearsToMaturity <= 5) bucket = '3-5yr';

      const maturityValue = maturityMap.get(bucket) || 0;
      maturityMap.set(bucket, maturityValue + holding.currentValue);
    });

    const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--danger))'];
    
    const createAllocationArray = (map: Map<string, number>) => 
      Array.from(map.entries()).map(([name, value], index) => ({
        name,
        value: Math.round((value / portfolioMetrics.currentValue) * 100),
        amount: value,
        color: colors[index % colors.length]
      }));

    return {
      sector: createAllocationArray(sectorMap),
      rating: createAllocationArray(ratingMap),
      maturity: createAllocationArray(maturityMap)
    };
  }, [holdings, portfolioMetrics.currentValue]);

  // Sorted holdings
  const sortedHoldings = useMemo(() => {
    if (holdings.length === 0) return [];
    
    return [...holdings].sort((a, b) => {
      let valueA = a[sortBy as keyof typeof a];
      let valueB = b[sortBy as keyof typeof b];
      
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();
      
      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }, [holdings, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Bond Name', 'Tokens Owned', 'Invested Amount', 'Current Value', 'Unrealized P&L', 'Coupon Rate', 'YTM', 'Next Coupon Date'].join(','),
      ...sortedHoldings.map(h => [
        `"${h.bondName}"`,
        h.tokensOwned.toFixed(3),
        h.totalInvested.toFixed(2),
        h.currentValue.toFixed(2),
        `${h.unrealizedPnl >= 0 ? '+' : ''}${h.unrealizedPnl.toFixed(2)}`,
        `${h.couponRate}%`,
        `${h.ytm || 0}%`,
        typeof h.nextCouponDate === 'string' ? h.nextCouponDate : h.nextCouponDate?.toISOString() || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-holdings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
            <p className="text-muted-foreground">Loading portfolio data from APIs...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Fetching portfolio, dashboard, and bond data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state with refresh functionality
  if (error && !portfolioData && !dashboardData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
            <p className="text-muted-foreground text-red-600">Error loading portfolio: {error}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Failed to load portfolio data. Please check if your backend API is running at localhost:8080
            </p>
            <div className="space-x-2">
              <Button onClick={refreshPortfolioData}>Retry</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Reload Page</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state for new users
  if (holdings.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
            <p className="text-muted-foreground">
              Start building your bond investment portfolio
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/marketplace')}
            className="btn-primary mt-4 lg:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Investing
          </Button>
        </div>

        {/* Empty State */}
        <div className="card-financial text-center py-16">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Holdings Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start your investment journey by exploring our bond marketplace. 
            Build a diversified portfolio with fractional bond investments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/marketplace')}
              className="btn-primary"
            >
              Explore Bonds
            </Button>
            <Button 
              onClick={() => navigate('/learn')}
              variant="outline"
            >
              Learn About Bonds
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {/* API Status Indicator */}
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${portfolioData ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-muted-foreground">
              {portfolioData ? 'API Connected' : 'API Disconnected'}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={refreshPortfolioData}
            size="sm"
            disabled={isLoading}
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={() => navigate('/marketplace')}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invest More
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(portfolioMetrics.totalInvested)}
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(portfolioMetrics.currentValue)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-success" />
          </div>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unrealized P&L</p>
              <p className={`text-2xl font-bold ${portfolioMetrics.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                {portfolioMetrics.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(portfolioMetrics.unrealizedPnl)}
              </p>
            </div>
            <div className={`text-right ${portfolioMetrics.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
              <p className="text-sm">
                {portfolioMetrics.unrealizedPnl >= 0 ? '+' : ''}{portfolioMetrics.unrealizedPnlPercent.toFixed(2)}%
              </p>
              {portfolioMetrics.unrealizedPnl >= 0 ? 
                <TrendingUp className="w-6 h-6" /> : 
                <TrendingDown className="w-6 h-6" />
              }
            </div>
          </div>
        </div>

        <div className="card-financial">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. YTM</p>
              <p className="text-2xl font-bold text-foreground">
                {portfolioMetrics.avgYtm.toFixed(2)}%
              </p>
            </div>
            <Calendar className="w-8 h-8 text-warning" />
          </div>
        </div>
      </div>

      {/* Next Coupon */}
      {portfolioMetrics.nextCouponDate && (
        <div className="card-financial bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success font-medium">Next Coupon Payment</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(portfolioMetrics.nextCouponAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                Expected on {formatDate(portfolioMetrics.nextCouponDate as string)}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-success" />
          </div>
        </div>
      )}

      {/* API Integration Status */}
      {(error || process.env.NODE_ENV === 'development') && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              API Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border">
                <span>Portfolio API</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${portfolioData ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={portfolioData ? 'text-green-600' : 'text-red-600'}>
                    {portfolioData ? 'Connected' : 'Failed'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border">
                <span>Dashboard API</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dashboardData ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={dashboardData ? 'text-green-600' : 'text-red-600'}>
                    {dashboardData ? 'Connected' : 'Failed'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border">
                <span>Bonds API</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${bondsData.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={bondsData.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {bondsData.length > 0 ? `${bondsData.length} bonds` : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-gray-50 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">
                <strong>API Endpoint:</strong> {API_BASE_URL}
              </p>
              {dashboardData && (
                <p className="text-sm text-gray-600 mt-1">
                  <strong>User:</strong> {dashboardData.user?.name} | 
                  <strong> Wallet:</strong> ₹{parseFloat(dashboardData.user?.wallet_balance || '0').toLocaleString()} | 
                  <strong> Available:</strong> ₹{parseFloat(dashboardData.user?.available_to_invest || '0').toLocaleString()}
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 mt-1">
                  <strong>Last Error:</strong> {error}
                </p>
              )}
              
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshPortfolioData}
                  disabled={isLoading}
                >
                  Test All APIs
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (user?.id) {
                      console.log('🔍 API Test Results:');
                      console.log('Portfolio:', portfolioData);
                      console.log('Dashboard:', dashboardData);
                      console.log('Bonds:', bondsData);
                      console.log('User ID:', user.id);
                    }
                  }}
                >
                  Log Debug Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="coupons">Coupon Income</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Value Chart */}
            <Card className="card-financial">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Portfolio Value Trend</CardTitle>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1M">1M</SelectItem>
                    <SelectItem value="3M">3M</SelectItem>
                    <SelectItem value="6M">6M</SelectItem>
                    <SelectItem value="1Y">1Y</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Portfolio Value']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Returns Chart */}
            <Card className="card-financial">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Returns']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar 
                        dataKey="returns" 
                        fill="hsl(var(--success))" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sector Allocation */}
            <Card className="card-financial">
              <CardHeader>
                <CardTitle className="text-lg">By Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData.sector}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.sector.map((entry, index) => (
                          <Cell key={`sector-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}% (${formatCurrency(props.payload.amount)})`, 
                          'Allocation'
                        ]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {allocationData.sector.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Allocation */}
            <Card className="card-financial">
              <CardHeader>
                <CardTitle className="text-lg">By Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData.rating}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.rating.map((entry, index) => (
                          <Cell key={`rating-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}% (${formatCurrency(props.payload.amount)})`, 
                          'Allocation'
                        ]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {allocationData.rating.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maturity Allocation */}
            <Card className="card-financial">
              <CardHeader>
                <CardTitle className="text-lg">By Maturity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData.maturity}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.maturity.map((entry, index) => (
                          <Cell key={`maturity-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}% (${formatCurrency(props.payload.amount)})`, 
                          'Allocation'
                        ]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {allocationData.maturity.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <Card className="card-financial">
            <CardHeader>
              <CardTitle className="text-lg">Projected Coupon Income (Next 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={couponProjections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'amount' ? formatCurrency(Number(value)) : value,
                        name === 'amount' ? 'Coupon Amount' : 'Contributing Bonds'
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--success))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(portfolioMetrics.totalCouponsEarned)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Next 12 Months</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(couponProjections.reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Annual Yield</p>
                  <p className="text-xl font-bold text-warning">
                    {((couponProjections.reduce((sum, p) => sum + p.amount, 0) / portfolioMetrics.currentValue) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Holdings Table */}
      <Card className="card-financial">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">My Holdings</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('currentValue')}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort by Value
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('bondName')}
                  >
                    Bond Name {sortBy === 'bondName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('tokensOwned')}
                  >
                    Tokens {sortBy === 'tokensOwned' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('currentValue')}
                  >
                    Current Value {sortBy === 'currentValue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('unrealizedPnl')}
                  >
                    P&L {sortBy === 'unrealizedPnl' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right">Coupon Rate</TableHead>
                  <TableHead className="text-right">Next Coupon</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHoldings.map((holding) => (
                  <TableRow key={holding.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p 
                          className="font-medium text-foreground cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/bond/${holding.bondId}`)}
                        >
                          {holding.bondName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {holding.rating}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {holding.sector}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">{holding.tokensOwned.toFixed(3)}</p>
                      <p className="text-xs text-muted-foreground">
                        @ {formatCurrency(holding.currentTokenPrice)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">{formatCurrency(holding.currentValue)}</p>
                      <p className="text-xs text-muted-foreground">
                        Invested: {formatCurrency(holding.totalInvested)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className={`font-medium ${
                        holding.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {holding.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(holding.unrealizedPnl)}
                      </p>
                      <p className={`text-xs ${
                        holding.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {holding.unrealizedPnl >= 0 ? '+' : ''}{holding.unrealizedPnlPercent.toFixed(2)}%
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium text-success">{holding.couponRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        YTM: {holding.ytm || 0}%
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">{formatCurrency(holding.nextCouponAmount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(typeof holding.nextCouponDate === 'string' ? holding.nextCouponDate : holding.nextCouponDate?.toISOString() || '')}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center space-x-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/bond/${holding.bondId}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/bond/${holding.bondId}?action=buy`)}
                        >
                          Buy More
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;