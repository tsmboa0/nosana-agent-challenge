// User and Asset Types
export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  publicKey: string;
  encryptedPrivateKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'TOKEN' | 'STOCK';
  amount: number;
  value: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  amount: number;
  price: number;
  totalValue: number;
  txHash?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  userId: string;
  createdAt: Date;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  type: 'TOKEN' | 'STOCK';
}

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, any>;
}

// Jupiter API Types
export interface JupiterQuoteRequest {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    feeBps: number;
    feeAccounts: Record<string, string>;
  };
  priceImpactPct: number;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number;
  timeTaken: number;
}

// Birdeye API Types
export interface BirdeyeTokenData {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  priceChange1h: number;
  priceChange7d: number;
  priceChange30d: number;
  high24h: number;
  low24h: number;
  supply: number;
  holders: number;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
  description: string;
  tags: string[];
}

export interface BirdeyeOHLCVResponse {
  success: boolean;
  data: {
    items: Array<{
      unixTime: number;
      high: number;
      low: number;
      open: number;
      close: number;
      volume: number;
    }>;
  };
}

// Telegram Bot Types
export interface TelegramContext {
  chatId: number;
  userId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

export interface BotCommand {
  command: string;
  description: string;
  handler: (ctx: any) => Promise<void>;
}

// Agent Types
export interface AgentRequest {
  userId: string;
  message: string;
  context?: {
    currentAssets?: Asset[];
    recentTransactions?: Transaction[];
  };
}

export interface AgentResponse {
  message: string;
  chartImage?: Buffer;
  actions?: Array<{
    type: 'BUY' | 'SELL' | 'INFO';
    symbol: string;
    amount?: number;
    reason: string;
  }>;
  confidence: number; // 0-1
}

// Error Types
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  details?: any;
}

// Utility Types
export type AssetType = 'TOKEN' | 'STOCK';
export type TransactionType = 'BUY' | 'SELL';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED'; 