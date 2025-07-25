import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  User, Transaction, BondToken, TokenHolding, OrderBookEntry, 
  RecentTrade, TradingRule, Order, MarketSummary, PriceUpdate, 
  NextCoupon, TradeValidation, TokenCalculation 
} from '@/types';

interface WalletState {
  inrTokenBalance: number;
  reservedBalance: number;
  availableBalance: number;
  transactionHistory: Transaction[];
  dailyDepositLimit: number;
  monthlyDepositLimit: number;
  todayDeposited: number;
  monthDeposited: number;
  lastUpdated: Date;
}

interface PortfolioState {
  holdings: TokenHolding[];
  totalInvested: number;
  currentValue: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number;
  couponsEarned: number;
  projectedAnnualIncome: number;
  diversificationScore: number;
  averageYtm: number;
  averageMaturity: number;
  totalTokensHeld: number;
  nextCoupons: NextCoupon[];
}

interface MarketplaceState {
  bondTokens: BondToken[];
  watchlist: string[];
  filters: {
    rating: string[];
    sector: string[];
    maturity: string;
    search: string;
    priceRange: [number, number];
    ytmRange: [number, number];
  };
  sortBy: 'tokenPrice' | 'ytm' | 'rating' | 'volume' | 'priceChange';
  sortOrder: 'asc' | 'desc';
  marketSummary: MarketSummary;
}

interface TradingState {
  orderBooks: Record<string, {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    spread: number;
    lastUpdated: Date;
  }>;
  recentTrades: Record<string, RecentTrade[]>;
  activeOrders: Order[];
  rules: Record<string, TradingRule>;
}

interface MarketState {
  isMarketOpen: boolean;
  lastUpdate: Date;
  priceUpdates: Record<string, PriceUpdate>;
}

interface AppState {
  // User Authentication
  user: User | null;
  isOnboarding: boolean;
  onboardingStep: number;

  // Core States
  wallet: WalletState;
  portfolio: PortfolioState;
  marketplace: MarketplaceState;
  trading: TradingState;
  market: MarketState;

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  updateOnboardingStep: (step: number) => void;
  completeOnboarding: (userData: Partial<User>) => void;

  // Wallet actions
  updateBalance: (amount: number, description: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  reserveBalance: (amount: number) => void;
  releaseReservedBalance: (amount: number) => void;
  depositFunds: (amount: number, method: string) => Promise<boolean>;

  // Portfolio actions
  addTokenHolding: (bondId: string, tokensOwned: number, purchasePrice: number) => void;
  updateTokenHolding: (bondId: string, updates: Partial<TokenHolding>) => void;
  removeTokenHolding: (bondId: string) => void;
  calculatePortfolioMetrics: () => void;
  addCouponPayment: (bondId: string, amount: number) => void;

  // Marketplace actions
  updateBondTokens: (tokens: BondToken[]) => void;
  updateTokenPrice: (bondId: string, newPrice: number, volume?: number) => void;
  addToWatchlist: (bondId: string) => void;
  removeFromWatchlist: (bondId: string) => void;
  updateFilters: (filters: Partial<MarketplaceState['filters']>) => void;
  setSortBy: (sortBy: string, order?: 'asc' | 'desc') => void;

  // Trading actions
  updateOrderBook: (bondId: string, bids: OrderBookEntry[], asks: OrderBookEntry[]) => void;
  addRecentTrade: (bondId: string, trade: Omit<RecentTrade, 'timestamp' | 'tradeId'>) => void;
  placeOrder: (bondId: string, type: 'buy' | 'sell', quantity: number, price: number) => Promise<boolean>;
  executeMarketOrder: (bondId: string, type: 'buy' | 'sell', inrAmount: number) => Promise<boolean>;
  cancelOrder: (orderId: string) => void;

  // Market simulation
  simulateMarketActivity: () => void;
  updateCircuitBreakers: (bondId: string) => void;

  // Validation helpers
  validateTradeOrder: (bondId: string, type: 'buy' | 'sell', quantity: number, price: number) => TradeValidation;
  calculateTokensForAmount: (bondId: string, inrAmount: number) => TokenCalculation;

  // Utility actions
  resetDemo: () => void;
  loadDemoData: () => void;
  exportTransactionHistory: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isOnboarding: false,
    onboardingStep: 1,

    wallet: {
      inrTokenBalance: 55000,
      reservedBalance: 0,
      availableBalance: 55000,
      transactionHistory: [],
      dailyDepositLimit: 200000,
      monthlyDepositLimit: 1000000,
      todayDeposited: 0,
      monthDeposited: 0,
      lastUpdated: new Date(),
    },

    portfolio: {
      holdings: [],
      totalInvested: 0,
      currentValue: 0,
      totalUnrealizedPnl: 0,
      totalUnrealizedPnlPercent: 0,
      couponsEarned: 0,
      projectedAnnualIncome: 0,
      diversificationScore: 0,
      averageYtm: 0,
      averageMaturity: 0,
      totalTokensHeld: 0,
      nextCoupons: [],
    },

    marketplace: {
      bondTokens: [],
      watchlist: [],
      filters: {
        rating: [],
        sector: [],
        maturity: '',
        search: '',
        priceRange: [0, 1000],
        ytmRange: [0, 20],
      },
      sortBy: 'tokenPrice',
      sortOrder: 'desc',
      marketSummary: {
        totalValueLocked: '₹2,847Cr',
        activeBonds: 156,
        averageYield: 8.7,
        activeInvestors: 45892,
      },
    },

    trading: {
      orderBooks: {},
      recentTrades: {},
      activeOrders: [],
      rules: {},
    },

    market: {
      isMarketOpen: true,
      lastUpdate: new Date(),
      priceUpdates: {},
    },

    // Actions
    setUser: (user) => set({ user }),

    logout: () => set({ 
      user: null, 
      isOnboarding: false, 
      onboardingStep: 1 
    }),

    updateOnboardingStep: (step) => set({ onboardingStep: step }),

    completeOnboarding: (userData) => {
      const newUser: User = {
        id: userData.id || generateId(),
        name: userData.name || '',
        email: userData.email || '',
        mobile: userData.mobile || '',
        isAuthenticated: true,
        isOnboarded: true,
        kycStatus: 'verified',
        riskProfile: 'beginner',
        createdAt: new Date(),
      };
      
      set({ 
        user: newUser,
        isOnboarding: false,
        onboardingStep: 1
      });
    },

    updateBalance: (amount, description) => {
      const { wallet } = get();
      const newBalance = wallet.inrTokenBalance + amount;
      const newAvailable = newBalance - wallet.reservedBalance;
      
      set(state => ({
        wallet: {
          ...state.wallet,
          inrTokenBalance: newBalance,
          availableBalance: newAvailable,
          lastUpdated: new Date(),
        }
      }));

      // Add transaction
      get().addTransaction({
        type: amount > 0 ? 'deposit' : 'withdrawal',
        amount,
        description,
        status: 'completed',
        referenceId: generateId(),
      });
    },

    addTransaction: (transaction) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: generateId(),
        timestamp: new Date(),
      };

      set(state => ({
        wallet: {
          ...state.wallet,
          transactionHistory: [newTransaction, ...state.wallet.transactionHistory].slice(0, 100),
        }
      }));
    },

    reserveBalance: (amount) => {
      set(state => ({
        wallet: {
          ...state.wallet,
          reservedBalance: state.wallet.reservedBalance + amount,
          availableBalance: state.wallet.availableBalance - amount,
        }
      }));
    },

    releaseReservedBalance: (amount) => {
      set(state => ({
        wallet: {
          ...state.wallet,
          reservedBalance: Math.max(0, state.wallet.reservedBalance - amount),
          availableBalance: state.wallet.availableBalance + amount,
        }
      }));
    },

    depositFunds: async (amount, method) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      get().updateBalance(amount, `Deposit via ${method}`);
      return true;
    },

    addTokenHolding: (bondId, tokensOwned, purchasePrice) => {
      const { marketplace } = get();
      const bond = marketplace.bondTokens.find(b => b.id === bondId);
      if (!bond) return;

      const totalInvested = tokensOwned * purchasePrice;
      const currentValue = tokensOwned * bond.tokenPrice;
      
      const holding: TokenHolding = {
        bondId,
        bondName: bond.name,
        tokensOwned,
        avgPurchasePrice: purchasePrice,
        totalInvested,
        currentValue,
        unrealizedPnl: currentValue - totalInvested,
        unrealizedPnlPercent: ((currentValue - totalInvested) / totalInvested) * 100,
        nextCouponDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        nextCouponAmount: (tokensOwned * bond.originalBondValue * bond.couponRate) / (100 * bond.totalTokens * 4),
        purchaseDate: new Date(),
        lastTradeDate: new Date(),
      };

      set(state => ({
        portfolio: {
          ...state.portfolio,
          holdings: [...state.portfolio.holdings, holding],
        }
      }));

      get().calculatePortfolioMetrics();
    },

    updateTokenHolding: (bondId, updates) => {
      set(state => ({
        portfolio: {
          ...state.portfolio,
          holdings: state.portfolio.holdings.map(h => 
            h.bondId === bondId ? { ...h, ...updates } : h
          ),
        }
      }));

      get().calculatePortfolioMetrics();
    },

    removeTokenHolding: (bondId) => {
      set(state => ({
        portfolio: {
          ...state.portfolio,
          holdings: state.portfolio.holdings.filter(h => h.bondId !== bondId),
        }
      }));

      get().calculatePortfolioMetrics();
    },

    calculatePortfolioMetrics: () => {
      const { portfolio, marketplace } = get();
      const { holdings } = portfolio;

      if (holdings.length === 0) {
        set(state => ({
          portfolio: {
            ...state.portfolio,
            totalInvested: 0,
            currentValue: 0,
            totalUnrealizedPnl: 0,
            totalUnrealizedPnlPercent: 0,
            totalTokensHeld: 0,
            averageYtm: 0,
            averageMaturity: 0,
          }
        }));
        return;
      }

      // Update current values based on latest token prices
      const updatedHoldings = holdings.map(holding => {
        const bond = marketplace.bondTokens.find(b => b.id === holding.bondId);
        if (!bond) return holding;

        const currentValue = holding.tokensOwned * bond.tokenPrice;
        return {
          ...holding,
          currentValue,
          unrealizedPnl: currentValue - holding.totalInvested,
          unrealizedPnlPercent: ((currentValue - holding.totalInvested) / holding.totalInvested) * 100,
        };
      });

      const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.totalInvested, 0);
      const currentValue = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalUnrealizedPnl = currentValue - totalInvested;
      const totalUnrealizedPnlPercent = totalInvested > 0 ? (totalUnrealizedPnl / totalInvested) * 100 : 0;
      const totalTokensHeld = updatedHoldings.reduce((sum, h) => sum + h.tokensOwned, 0);

      // Calculate weighted averages
      let weightedYtm = 0;
      let weightedMaturity = 0;
      
      updatedHoldings.forEach(holding => {
        const bond = marketplace.bondTokens.find(b => b.id === holding.bondId);
        if (bond) {
          const weight = holding.currentValue / currentValue;
          weightedYtm += bond.ytm * weight;
          weightedMaturity += bond.maturityYears * weight;
        }
      });

      set(state => ({
        portfolio: {
          ...state.portfolio,
          holdings: updatedHoldings,
          totalInvested,
          currentValue,
          totalUnrealizedPnl,
          totalUnrealizedPnlPercent,
          totalTokensHeld,
          averageYtm: weightedYtm,
          averageMaturity: weightedMaturity,
        }
      }));
    },

    addCouponPayment: (bondId, amount) => {
      const bond = get().marketplace.bondTokens.find(b => b.id === bondId);
      if (!bond) return;

      get().updateBalance(amount, `Coupon payment - ${bond.name}`);
      
      set(state => ({
        portfolio: {
          ...state.portfolio,
          couponsEarned: state.portfolio.couponsEarned + amount,
        }
      }));
    },

    updateBondTokens: (tokens) => {
      set(state => ({
        marketplace: {
          ...state.marketplace,
          bondTokens: tokens,
        }
      }));
    },

    updateTokenPrice: (bondId, newPrice, volume = 0) => {
      const { marketplace, trading } = get();
      const bond = marketplace.bondTokens.find(b => b.id === bondId);
      if (!bond) return;

      const rule = trading.rules[bondId];
      if (!rule) return;

      // Check circuit breakers
      const changePercent = ((newPrice - bond.previousClose) / bond.previousClose) * 100;
      if (Math.abs(changePercent) > rule.circuitBreakerPercent * 100) {
        return;
      }

      // Adjust to tick size
      const tickSize = rule.tickSize;
      const adjustedPrice = Math.round(newPrice / tickSize) * tickSize;

      const priceChange = adjustedPrice - bond.tokenPrice;
      const priceChangePercent = (priceChange / bond.tokenPrice) * 100;

      set(state => ({
        marketplace: {
          ...state.marketplace,
          bondTokens: state.marketplace.bondTokens.map(b => 
            b.id === bondId ? {
              ...b,
              tokenPrice: adjustedPrice,
              priceChange24h: priceChange,
              priceChangePercent24h: priceChangePercent,
              volume24h: b.volume24h + volume,
              volume24hValue: formatCurrency((b.volume24h + volume) * adjustedPrice),
              high24h: Math.max(b.high24h, adjustedPrice),
              low24h: Math.min(b.low24h, adjustedPrice),
            } : b
          ),
        },
        market: {
          ...state.market,
          lastUpdate: new Date(),
          priceUpdates: {
            ...state.market.priceUpdates,
            [bondId]: {
              bondId,
              oldPrice: bond.tokenPrice,
              newPrice: adjustedPrice,
              change: priceChange,
              timestamp: new Date(),
            }
          }
        }
      }));

      // Recalculate portfolio metrics
      get().calculatePortfolioMetrics();
    },

    addToWatchlist: (bondId) => {
      set(state => ({
        marketplace: {
          ...state.marketplace,
          watchlist: [...state.marketplace.watchlist, bondId],
        }
      }));
    },

    removeFromWatchlist: (bondId) => {
      set(state => ({
        marketplace: {
          ...state.marketplace,
          watchlist: state.marketplace.watchlist.filter(id => id !== bondId),
        }
      }));
    },

    updateFilters: (filters) => {
      set(state => ({
        marketplace: {
          ...state.marketplace,
          filters: { ...state.marketplace.filters, ...filters },
        }
      }));
    },

    setSortBy: (sortBy, order = 'desc') => {
      set(state => ({
        marketplace: {
          ...state.marketplace,
          sortBy: sortBy as any,
          sortOrder: order,
        }
      }));
    },

    updateOrderBook: (bondId, bids, asks) => {
      const spread = asks.length > 0 && bids.length > 0 ? asks[0].price - bids[0].price : 0;
      
      set(state => ({
        trading: {
          ...state.trading,
          orderBooks: {
            ...state.trading.orderBooks,
            [bondId]: {
              bids: bids.sort((a, b) => b.price - a.price),
              asks: asks.sort((a, b) => a.price - b.price),
              spread,
              lastUpdated: new Date(),
            }
          }
        }
      }));
    },

    addRecentTrade: (bondId, trade) => {
      const newTrade: RecentTrade = {
        ...trade,
        timestamp: new Date(),
        tradeId: generateId(),
      };

      set(state => ({
        trading: {
          ...state.trading,
          recentTrades: {
            ...state.trading.recentTrades,
            [bondId]: [newTrade, ...(state.trading.recentTrades[bondId] || [])].slice(0, 50),
          }
        }
      }));
    },

    placeOrder: async (bondId, type, quantity, price) => {
      const validation = get().validateTradeOrder(bondId, type, quantity, price);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Reserve balance for buy orders
      if (type === 'buy') {
        get().reserveBalance(validation.totalCost);
      }

      const order: Order = {
        id: generateId(),
        bondId,
        bondName: get().marketplace.bondTokens.find(b => b.id === bondId)?.name || '',
        type,
        tokenQuantity: quantity,
        tokenPrice: price,
        totalValue: quantity * price,
        status: 'pending',
        createdAt: new Date(),
        executedTokens: 0,
        remainingTokens: quantity,
      };

      set(state => ({
        trading: {
          ...state.trading,
          activeOrders: [...state.trading.activeOrders, order],
        }
      }));

      // Simulate order execution
      setTimeout(() => {
        get().cancelOrder(order.id);
        
        if (type === 'buy') {
          get().addTokenHolding(bondId, quantity, price);
          get().addTransaction({
            type: 'token_purchase',
            amount: -validation.totalCost,
            description: `Bought ${quantity.toFixed(3)} tokens of ${order.bondName}`,
            bondId,
            bondName: order.bondName,
            tokensTraded: quantity,
            tokenPrice: price,
            fee: validation.fee,
            status: 'completed',
            referenceId: generateId(),
          });
        }
      }, 2000);

      return true;
    },

    executeMarketOrder: async (bondId, type, inrAmount) => {
      const calculation = get().calculateTokensForAmount(bondId, inrAmount);
      const bond = get().marketplace.bondTokens.find(b => b.id === bondId);
      if (!bond) return false;

      return get().placeOrder(bondId, type, calculation.tokens, bond.tokenPrice);
    },

    cancelOrder: (orderId) => {
      const { trading } = get();
      const order = trading.activeOrders.find(o => o.id === orderId);
      
      if (order && order.type === 'buy') {
        get().releaseReservedBalance(order.totalValue);
      }

      set(state => ({
        trading: {
          ...state.trading,
          activeOrders: state.trading.activeOrders.filter(o => o.id !== orderId),
        }
      }));
    },

    simulateMarketActivity: () => {
      const { marketplace } = get();
      
      marketplace.bondTokens.forEach(bond => {
        // Random price movement within circuit breakers
        const maxChange = bond.tokenPrice * 0.01; // 1% max change per update
        const change = (Math.random() - 0.5) * 2 * maxChange;
        const newPrice = bond.tokenPrice + change;
        
        if (newPrice > 0) {
          get().updateTokenPrice(bond.id, newPrice, Math.random() * 10);
        }
      });
    },

    updateCircuitBreakers: (bondId) => {
      const bond = get().marketplace.bondTokens.find(b => b.id === bondId);
      if (!bond) return;

      const upperCircuit = bond.previousClose * 1.02;
      const lowerCircuit = bond.previousClose * 0.98;

      set(state => ({
        marketplace: {
          ...state.marketplace,
          bondTokens: state.marketplace.bondTokens.map(b => 
            b.id === bondId ? {
              ...b,
              upperCircuit,
              lowerCircuit,
              isUpperCircuitHit: b.tokenPrice >= upperCircuit,
              isLowerCircuitHit: b.tokenPrice <= lowerCircuit,
            } : b
          ),
        }
      }));
    },

    validateTradeOrder: (bondId, type, quantity, price) => {
      const { trading, wallet, marketplace } = get();
      const rule = trading.rules[bondId];
      const bond = marketplace.bondTokens.find(b => b.id === bondId);
      
      if (!rule || !bond) {
        return { valid: false, error: 'Bond not found', fee: 0, totalCost: 0 };
      }

      const totalValue = quantity * price;
      const fee = totalValue * rule.transactionFeeRate;
      const totalCost = totalValue + fee;

      // Check minimum trade value
      if (totalValue < rule.minTradeValue) {
        return { valid: false, error: `Minimum trade value: ₹${rule.minTradeValue}`, fee, totalCost };
      }

      // Check available balance for buy orders
      if (type === 'buy' && totalCost > wallet.availableBalance) {
        return { valid: false, error: `Insufficient balance. Need ₹${totalCost.toFixed(2)}`, fee, totalCost };
      }

      // Check tick size
      if (price % rule.tickSize !== 0) {
        return { valid: false, error: `Price must be in multiples of ₹${rule.tickSize}`, fee, totalCost };
      }

      // Check available tokens
      if (quantity > bond.availableTokens) {
        return { valid: false, error: `Only ${bond.availableTokens} tokens available`, fee, totalCost };
      }

      return { valid: true, fee, totalCost };
    },

    calculateTokensForAmount: (bondId, inrAmount) => {
      const { trading, marketplace } = get();
      const rule = trading.rules[bondId];
      const bond = marketplace.bondTokens.find(b => b.id === bondId);
      
      if (!rule || !bond) {
        return { tokens: 0, fee: 0, netAmount: 0 };
      }

      // Calculate tokens before fee
      const grossTokens = inrAmount / bond.tokenPrice;
      const fee = inrAmount * rule.transactionFeeRate;
      const netAmount = inrAmount - fee;
      const tokens = netAmount / bond.tokenPrice;

      return { tokens, fee, netAmount };
    },

    resetDemo: () => {
      set({
        user: null,
        isOnboarding: false,
        onboardingStep: 1,
        wallet: {
          inrTokenBalance: 55000,
          reservedBalance: 0,
          availableBalance: 55000,
          transactionHistory: [],
          dailyDepositLimit: 200000,
          monthlyDepositLimit: 1000000,
          todayDeposited: 0,
          monthDeposited: 0,
          lastUpdated: new Date(),
        },
        portfolio: {
          holdings: [],
          totalInvested: 0,
          currentValue: 0,
          totalUnrealizedPnl: 0,
          totalUnrealizedPnlPercent: 0,
          couponsEarned: 0,
          projectedAnnualIncome: 0,
          diversificationScore: 0,
          averageYtm: 0,
          averageMaturity: 0,
          totalTokensHeld: 0,
          nextCoupons: [],
        },
        trading: {
          orderBooks: {},
          recentTrades: {},
          activeOrders: [],
          rules: {},
        },
      });
    },

    loadDemoData: () => {
      import('@/data/demoData').then(({ initializeDemoData }) => {
        initializeDemoData();
      });
    },

    exportTransactionHistory: () => {
      const { wallet } = get();
      const data = JSON.stringify(wallet.transactionHistory, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transaction-history.json';
      a.click();
      URL.revokeObjectURL(url);
    },
  }))
);

// Start market simulation
let marketInterval: NodeJS.Timeout;

export const startMarketSimulation = () => {
  if (marketInterval) clearInterval(marketInterval);
  
  marketInterval = setInterval(() => {
    const store = useAppStore.getState();
    if (store.market.isMarketOpen) {
      store.simulateMarketActivity();
    }
  }, 3000); // Update every 3 seconds
};

export const stopMarketSimulation = () => {
  if (marketInterval) clearInterval(marketInterval);
};