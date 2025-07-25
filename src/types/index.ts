export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  riskProfile: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'token_purchase' | 'token_sale' | 'coupon_payment' | 'maturity_payout';
  amount: number; // INR amount (positive for credits, negative for debits)
  description: string;
  bondId?: string; // for bond token transactions
  bondName?: string; // "Reliance Industries 8.5% 2027"
  tokensTraded?: number; // number of bond tokens bought/sold
  tokenPrice?: number; // price per bond token at time of trade
  fee?: number; // transaction fee charged
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  referenceId: string;
}

export interface BondToken {
  id: string;
  name: string; // "Reliance Industries 8.5% 2027"
  issuer: string; // "Reliance Industries Limited"
  sector: 'Banking' | 'Energy' | 'Technology' | 'Infrastructure' | 'FMCG';
  rating: 'AAA' | 'AA+' | 'AA' | 'A+' | 'A';
  
  // Token Trading Data
  tokenPrice: number; // ₹100.10 (current market price per token)
  previousClose: number; // ₹99.95 (yesterday's closing price)
  priceChange24h: number; // +0.15 (absolute change)
  priceChangePercent24h: number; // +0.15% (percentage change)
  
  // Token Supply
  totalTokens: number; // 150 (total tokens issued for this bond)
  availableTokens: number; // 67.45 (fractional tokens available for purchase)
  circulatingTokens: number; // 82.55 (tokens held by investors)
  
  // Bond Fundamentals
  couponRate: number; // 8.5 (annual percentage)
  ytm: number; // 8.5 (yield to maturity)
  originalBondValue: number; // ₹15,000 (original bond face value)
  maturityDate: Date;
  maturityYears: number; // 3.2
  
  // Market Data
  volume24h: number; // 245.67 (tokens traded in 24h)
  volume24hValue: string; // "₹2.45L" (formatted volume value)
  high24h: number; // ₹100.25
  low24h: number; // ₹99.85
  
  // Circuit Breakers
  upperCircuit: number; // ₹101.95 (2% above previous close)
  lowerCircuit: number; // ₹97.95 (2% below previous close)
  isUpperCircuitHit: boolean;
  isLowerCircuitHit: boolean;
  
  // Display Flags
  isPopular: boolean;
  isNew: boolean;
  description: string;
}

export interface TokenHolding {
  bondId: string;
  bondName: string;
  tokensOwned: number; // 4.995 (fractional holding)
  avgPurchasePrice: number; // ₹99.80 (average price paid per token)
  totalInvested: number; // ₹500 (total INR spent including fees)
  currentValue: number; // 4.995 × current token price
  unrealizedPnl: number; // currentValue - totalInvested
  unrealizedPnlPercent: number; // (unrealizedPnl / totalInvested) * 100
  nextCouponDate: Date;
  nextCouponAmount: number; // Expected coupon for this holding
  purchaseDate: Date;
  lastTradeDate: Date;
}

export interface OrderBookEntry {
  price: number; // ₹100.10 (bond token price)
  quantity: number; // 75.5 (tokens, fractional allowed)
  side: 'bid' | 'ask';
  timestamp: Date;
  orderId?: string; // for user's own orders
}

export interface RecentTrade {
  price: number; // ₹100.10 (token price)
  quantity: number; // 12.5 (tokens traded)
  timestamp: Date;
  type: 'buy' | 'sell';
  tradeId: string;
}

export interface TradingRule {
  tickSize: number; // ₹0.05 (minimum price increment)
  minTradeValue: number; // ₹100 (minimum trade in INR)
  maxTradeTokens: number; // availableTokens (max tokens per trade)
  transactionFeeRate: number; // 0.01 (1% fee)
  circuitBreakerPercent: number; // 0.02 (2% daily limit)
}

export interface Order {
  id: string;
  bondId: string;
  bondName: string;
  type: 'buy' | 'sell';
  tokenQuantity: number;
  tokenPrice: number;
  totalValue: number;
  status: 'pending' | 'partial' | 'completed' | 'cancelled';
  createdAt: Date;
  executedTokens: number;
  remainingTokens: number;
}

export interface MarketSummary {
  totalValueLocked: string; // "₹2,847Cr"
  activeBonds: number; // 156
  averageYield: number; // 8.7
  activeInvestors: number; // 45,892
}

export interface PriceUpdate {
  bondId: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  timestamp: Date;
}

export interface NextCoupon {
  bondId: string;
  bondName: string;
  amount: number;
  date: Date;
}

export interface TradeValidation {
  valid: boolean;
  error?: string;
  fee: number;
  totalCost: number;
}

export interface TokenCalculation {
  tokens: number;
  fee: number;
  netAmount: number;
}