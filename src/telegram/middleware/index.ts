// Import middleware components
import { RateLimitMiddleware, rateLimitMiddleware, GlobalContextManager, getGlobalContext, setGlobalContext, isRateLimited, type GlobalContext } from './rate-limit';
import { ContextMiddleware, getCurrentContext, getCurrentTelegramId, getCurrentChatId, hasContext, type UserContext } from './context';

// Export rate limiting middleware
export {
  RateLimitMiddleware,
  rateLimitMiddleware,
  GlobalContextManager,
  getGlobalContext,
  setGlobalContext,
  isRateLimited,
  type GlobalContext,
} from './rate-limit';

// Export context middleware
export {
  ContextMiddleware,
  getCurrentContext,
  getCurrentTelegramId,
  getCurrentChatId,
  hasContext,
  type UserContext,
} from './context';

// Export combined middleware for easy setup
export const setupMiddleware = (bot: any) => {
  // Add context middleware first
  bot.use(new ContextMiddleware().middleware());
  
  // Add rate limiting middleware
  bot.use(rateLimitMiddleware.middleware());
  
  // Add logging middleware
  bot.use(async (ctx: any, next: () => Promise<void>) => {
    const start = new Date();
    const telegramId = getCurrentTelegramId();
    
    console.log(`[${start.toISOString()}] Request from ${telegramId} (${ctx.updateType})`);
    
    await next();
    
    const ms = new Date().getTime() - start.getTime();
    console.log(`[${new Date().toISOString()}] Response to ${telegramId} in ${ms}ms`);
  });
}; 