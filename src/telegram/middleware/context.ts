import { Context } from 'telegraf';
import { AsyncLocalStorage } from 'async_hooks';

// User context interface
export interface UserContext {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  chatId?: number;
  messageId?: number;
  timestamp: number;
}

// Create async local storage for context
const contextStorage = new AsyncLocalStorage<UserContext>();

export class ContextMiddleware {
  /**
   * Middleware to set up user context
   */
  middleware() {
    return async (ctx: Context, next: () => Promise<void>) => {
      const telegramId = ctx.from?.id?.toString();
      
      if (!telegramId) {
        return next();
      }

      // Create user context
      const userContext: UserContext = {
        telegramId,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
        chatId: ctx.chat?.id,
        messageId: ctx.message?.message_id,
        timestamp: Date.now(),
      };

      // Run the rest of the middleware chain with context
      await contextStorage.run(userContext, next);
    };
  }

  /**
   * Get current user context
   */
  static getCurrentContext(): UserContext | undefined {
    return contextStorage.getStore();
  }

  /**
   * Get current user's Telegram ID
   */
  static getCurrentTelegramId(): string | undefined {
    return contextStorage.getStore()?.telegramId;
  }

  /**
   * Get current user's chat ID
   */
  static getCurrentChatId(): number | undefined {
    return contextStorage.getStore()?.chatId;
  }

  /**
   * Check if we're in a request context
   */
  static hasContext(): boolean {
    return contextStorage.getStore() !== undefined;
  }
}

// Export convenience functions
export const getCurrentContext = ContextMiddleware.getCurrentContext;
export const getCurrentTelegramId = ContextMiddleware.getCurrentTelegramId;
export const getCurrentChatId = ContextMiddleware.getCurrentChatId;
export const hasContext = ContextMiddleware.hasContext; 