import { Context } from 'telegraf';

type NextFunction = () => Promise<void>;

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message: string; // Message to send when rate limited
}

// Rate limit store
interface RateLimitStore {
  [telegramId: string]: {
    count: number;
    resetTime: number;
  };
}

// Global context for storing user information
export interface GlobalContext {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isRateLimited: boolean;
}

// Global context store
const globalContexts = new Map<string, GlobalContext>();

// Rate limit store
const rateLimitStore: RateLimitStore = {};

// Default rate limit configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  message: '⚠️ Rate limit exceeded. Please wait a moment before sending another message.',
};

export class RateLimitMiddleware {
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Middleware function for rate limiting
   */
  middleware() {
    return async (ctx: Context, next: NextFunction) => {
      const telegramId = ctx.from?.id?.toString();
      
      if (!telegramId) {
        return next();
      }

      // Extract user information
      const userInfo: GlobalContext = {
        telegramId,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
        isRateLimited: false,
      };

      // Store in global context
      globalContexts.set(telegramId, userInfo);

      // Check rate limit
      const isRateLimited = this.checkRateLimit(telegramId);
      
      if (isRateLimited) {
        userInfo.isRateLimited = true;
        globalContexts.set(telegramId, userInfo);
        
        await ctx.reply(this.config.message);
        return;
      }

      // Increment request count
      this.incrementRequestCount(telegramId);

      // Continue to next middleware/handler
      await next();
    };
  }

  /**
   * Check if user is rate limited
   */
  private checkRateLimit(telegramId: string): boolean {
    const now = Date.now();
    const userLimit = rateLimitStore[telegramId];

    if (!userLimit) {
      return false;
    }

    // Reset if window has passed
    if (now > userLimit.resetTime) {
      delete rateLimitStore[telegramId];
      return false;
    }

    // Check if limit exceeded
    return userLimit.count >= this.config.maxRequests;
  }

  /**
   * Increment request count for user
   */
  private incrementRequestCount(telegramId: string): void {
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    if (!rateLimitStore[telegramId]) {
      rateLimitStore[telegramId] = {
        count: 1,
        resetTime,
      };
    } else {
      rateLimitStore[telegramId].count++;
    }
  }

  /**
   * Get rate limit info for a user
   */
  getRateLimitInfo(telegramId: string): {
    count: number;
    maxRequests: number;
    resetTime: number;
    remaining: number;
  } | null {
    const userLimit = rateLimitStore[telegramId];
    if (!userLimit) {
      return {
        count: 0,
        maxRequests: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        remaining: this.config.maxRequests,
      };
    }

    return {
      count: userLimit.count,
      maxRequests: this.config.maxRequests,
      resetTime: userLimit.resetTime,
      remaining: Math.max(0, this.config.maxRequests - userLimit.count),
    };
  }

  /**
   * Reset rate limit for a user
   */
  resetRateLimit(telegramId: string): void {
    delete rateLimitStore[telegramId];
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clearAllRateLimits(): void {
    Object.keys(rateLimitStore).forEach(key => {
      delete rateLimitStore[key];
    });
  }
}

// Global context utilities
export class GlobalContextManager {
  /**
   * Get global context for a user
   */
  static getContext(telegramId: string): GlobalContext | undefined {
    return globalContexts.get(telegramId);
  }

  /**
   * Set global context for a user
   */
  static setContext(telegramId: string, context: Partial<GlobalContext>): void {
    const existing = globalContexts.get(telegramId) || {
      telegramId,
      isRateLimited: false,
    };
    
    globalContexts.set(telegramId, { ...existing, ...context });
  }

  /**
   * Get current user's Telegram ID from global context
   */
  static getCurrentTelegramId(): string | null {
    // This would need to be called from within a request context
    // For now, we'll return null and suggest using getContext with explicit telegramId
    return null;
  }

  /**
   * Check if user is rate limited
   */
  static isRateLimited(telegramId: string): boolean {
    const context = globalContexts.get(telegramId);
    return context?.isRateLimited || false;
  }

  /**
   * Clear context for a user
   */
  static clearContext(telegramId: string): void {
    globalContexts.delete(telegramId);
  }

  /**
   * Clear all contexts (useful for testing)
   */
  static clearAllContexts(): void {
    globalContexts.clear();
  }

  /**
   * Get all active contexts (useful for debugging)
   */
  static getAllContexts(): Map<string, GlobalContext> {
    return new Map(globalContexts);
  }
}

// Export default rate limit middleware instance
export const rateLimitMiddleware = new RateLimitMiddleware();

// Export convenience functions
export const getGlobalContext = GlobalContextManager.getContext;
export const setGlobalContext = GlobalContextManager.setContext;
export const isRateLimited = GlobalContextManager.isRateLimited; 