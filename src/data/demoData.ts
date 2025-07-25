import { BondToken, TradingRule, OrderBookEntry, RecentTrade } from '@/types';

export const demoBondTokens: BondToken[] = [
  {
    id: 'REL-2027',
    name: 'Reliance Industries 8.5% 2027',
    issuer: 'Reliance Industries Limited',
    sector: 'Energy',
    rating: 'AAA',
    tokenPrice: 100.15,
    previousClose: 99.95,
    priceChange24h: 0.20,
    priceChangePercent24h: 0.20,
    totalTokens: 150,
    availableTokens: 67.45,
    circulatingTokens: 82.55,
    couponRate: 8.5,
    ytm: 8.5,
    originalBondValue: 15000,
    maturityDate: new Date('2027-03-15'),
    maturityYears: 3.2,
    volume24h: 245.67,
    volume24hValue: '₹2.46L',
    high24h: 100.25,
    low24h: 99.85,
    upperCircuit: 101.95,
    lowerCircuit: 97.95,
    isUpperCircuitHit: false,
    isLowerCircuitHit: false,
    isPopular: true,
    isNew: false,
    description: 'High-grade corporate bond from India\'s largest private sector company with strong fundamentals.',
  },
  {
    id: 'HDFC-2026',
    name: 'HDFC Bank 7.8% 2026',
    issuer: 'HDFC Bank Limited',
    sector: 'Banking',
    rating: 'AAA',
    tokenPrice: 102.30,
    previousClose: 102.10,
    priceChange24h: 0.20,
    priceChangePercent24h: 0.20,
    totalTokens: 200,
    availableTokens: 89.25,
    circulatingTokens: 110.75,
    couponRate: 7.8,
    ytm: 7.6,
    originalBondValue: 20000,
    maturityDate: new Date('2026-08-22'),
    maturityYears: 2.1,
    volume24h: 189.34,
    volume24hValue: '₹1.94L',
    high24h: 102.45,
    low24h: 101.95,
    upperCircuit: 104.14,
    lowerCircuit: 100.06,
    isUpperCircuitHit: false,
    isLowerCircuitHit: false,
    isPopular: true,
    isNew: false,
    description: 'Secure banking bond from India\'s leading private bank with consistent performance.',
  },
  {
    id: 'TCS-2028',
    name: 'Tata Consultancy Services 8.2% 2028',
    issuer: 'Tata Consultancy Services Limited',
    sector: 'Technology',
    rating: 'AA+',
    tokenPrice: 98.75,
    previousClose: 98.95,
    priceChange24h: -0.20,
    priceChangePercent24h: -0.20,
    totalTokens: 120,
    availableTokens: 45.80,
    circulatingTokens: 74.20,
    couponRate: 8.2,
    ytm: 8.4,
    originalBondValue: 12000,
    maturityDate: new Date('2028-01-10'),
    maturityYears: 4.0,
    volume24h: 156.78,
    volume24hValue: '₹1.55L',
    high24h: 99.15,
    low24h: 98.65,
    upperCircuit: 100.93,
    lowerCircuit: 97.01,
    isUpperCircuitHit: false,
    isLowerCircuitHit: false,
    isPopular: false,
    isNew: true,
    description: 'Technology sector bond from India\'s largest IT services company with global presence.',
  },
  {
    id: 'ITC-2025',
    name: 'ITC Limited 7.5% 2025',
    issuer: 'ITC Limited',
    sector: 'FMCG',
    rating: 'AA',
    tokenPrice: 103.40,
    previousClose: 103.25,
    priceChange24h: 0.15,
    priceChangePercent24h: 0.15,
    totalTokens: 100,
    availableTokens: 23.60,
    circulatingTokens: 76.40,
    couponRate: 7.5,
    ytm: 7.2,
    originalBondValue: 10000,
    maturityDate: new Date('2025-11-30'),
    maturityYears: 1.3,
    volume24h: 98.45,
    volume24hValue: '₹1.02L',
    high24h: 103.55,
    low24h: 103.20,
    upperCircuit: 105.32,
    lowerCircuit: 101.18,
    isUpperCircuitHit: false,
    isLowerCircuitHit: false,
    isPopular: false,
    isNew: false,
    description: 'FMCG sector bond from diversified conglomerate with strong cigarette and hotel business.',
  },
  {
    id: 'NTPC-2029',
    name: 'NTPC Limited 8.8% 2029',
    issuer: 'NTPC Limited',
    sector: 'Infrastructure',
    rating: 'AA+',
    tokenPrice: 97.60,
    previousClose: 97.85,
    priceChange24h: -0.25,
    priceChangePercent24h: -0.26,
    totalTokens: 180,
    availableTokens: 92.15,
    circulatingTokens: 87.85,
    couponRate: 8.8,
    ytm: 9.1,
    originalBondValue: 18000,
    maturityDate: new Date('2029-06-15'),
    maturityYears: 5.0,
    volume24h: 134.67,
    volume24hValue: '₹1.31L',
    high24h: 98.10,
    low24h: 97.45,
    upperCircuit: 99.81,
    lowerCircuit: 95.89,
    isUpperCircuitHit: false,
    isLowerCircuitHit: false,
    isPopular: true,
    isNew: false,
    description: 'Infrastructure bond from India\'s largest power generation company with government backing.',
  },
  {
    id: 'BHARTI-2026',
    name: 'Bharti Airtel 8.0% 2026',
    issuer: 'Bharti Airtel Limited',
    sector: 'Technology',
    rating: 'AA',
    tokenPrice: 101.85,
    previousClose: 101.70,
    priceChange24h: 0.15,
    priceChangePercent24h: 0.15,
    totalTokens: 140,
    availableTokens: 56.30,
    circulatingTokens: 83.70,
    couponRate: 8.0,
    ytm: 7.8,
    originalBondValue: 14000,
    maturityDate: new Date('2026-12-05'),
    maturityYears: 2.4,
    volume24h: 178.92,
    volume24hValue: '₹1.82L',
    high24h: 102.05,
    low24h: 101.60,
    upperCircuit: 103.73,
    lowerCircuit: 99.67,
    isUpperCircuitHit: false,
    isLowerCircuitHit: false,
    isPopular: false,
    isNew: true,
    description: 'Telecom sector bond from leading mobile operator with strong 4G/5G infrastructure.',
  },
];

export const demoTradingRules: Record<string, TradingRule> = {
  'REL-2027': {
    tickSize: 0.05,
    minTradeValue: 100,
    maxTradeTokens: 67.45,
    transactionFeeRate: 0.01,
    circuitBreakerPercent: 0.02,
  },
  'HDFC-2026': {
    tickSize: 0.05,
    minTradeValue: 100,
    maxTradeTokens: 89.25,
    transactionFeeRate: 0.01,
    circuitBreakerPercent: 0.02,
  },
  'TCS-2028': {
    tickSize: 0.05,
    minTradeValue: 100,
    maxTradeTokens: 45.80,
    transactionFeeRate: 0.01,
    circuitBreakerPercent: 0.02,
  },
  'ITC-2025': {
    tickSize: 0.05,
    minTradeValue: 100,
    maxTradeTokens: 23.60,
    transactionFeeRate: 0.01,
    circuitBreakerPercent: 0.02,
  },
  'NTPC-2029': {
    tickSize: 0.05,
    minTradeValue: 100,
    maxTradeTokens: 92.15,
    transactionFeeRate: 0.01,
    circuitBreakerPercent: 0.02,
  },
  'BHARTI-2026': {
    tickSize: 0.05,
    minTradeValue: 100,
    maxTradeTokens: 56.30,
    transactionFeeRate: 0.01,
    circuitBreakerPercent: 0.02,
  },
};

export const generateDemoOrderBook = (bondId: string): { bids: OrderBookEntry[], asks: OrderBookEntry[] } => {
  const bond = demoBondTokens.find(b => b.id === bondId);
  if (!bond) return { bids: [], asks: [] };

  const basePrice = bond.tokenPrice;
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  // Generate 5 bid levels
  for (let i = 0; i < 5; i++) {
    bids.push({
      price: basePrice - (i + 1) * 0.05,
      quantity: Math.random() * 50 + 10,
      side: 'bid',
      timestamp: new Date(),
    });
  }

  // Generate 5 ask levels
  for (let i = 0; i < 5; i++) {
    asks.push({
      price: basePrice + (i + 1) * 0.05,
      quantity: Math.random() * 50 + 10,
      side: 'ask',
      timestamp: new Date(),
    });
  }

  return { bids, asks };
};

export const generateDemoRecentTrades = (bondId: string): RecentTrade[] => {
  const bond = demoBondTokens.find(b => b.id === bondId);
  if (!bond) return [];

  const trades: RecentTrade[] = [];
  const basePrice = bond.tokenPrice;

  for (let i = 0; i < 10; i++) {
    trades.push({
      price: basePrice + (Math.random() - 0.5) * 0.5,
      quantity: Math.random() * 20 + 1,
      timestamp: new Date(Date.now() - i * 60000), // 1 minute intervals
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      tradeId: Math.random().toString(36).substr(2, 9),
    });
  }

  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const initializeDemoData = () => {
  const store = (window as any).__APP_STORE__;
  if (!store) return;

  // Initialize bond tokens
  store.getState().updateBondTokens(demoBondTokens);

  // Initialize trading rules
  store.setState((state: any) => ({
    trading: {
      ...state.trading,
      rules: demoTradingRules,
    }
  }));

  // Initialize order books and recent trades
  demoBondTokens.forEach(bond => {
    const orderBook = generateDemoOrderBook(bond.id);
    store.getState().updateOrderBook(bond.id, orderBook.bids, orderBook.asks);
    
    const recentTrades = generateDemoRecentTrades(bond.id);
    recentTrades.forEach(trade => {
      store.getState().addRecentTrade(bond.id, {
        price: trade.price,
        quantity: trade.quantity,
        type: trade.type,
      });
    });
  });

  console.log('✅ Demo data initialized with', demoBondTokens.length, 'bond tokens');
};