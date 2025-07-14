# Telegram Bot Middleware

This directory contains middleware for the Telegram bot that provides rate limiting and global context management.

## Features

### 1. Rate Limiting
- **Per-user rate limiting** based on Telegram ID
- **Configurable limits**: Default is 30 requests per minute
- **Automatic reset**: Rate limits reset after the time window
- **Customizable messages**: Configurable rate limit messages

### 2. Global Context
- **Async context storage**: User information available throughout request lifecycle
- **Telegram ID access**: Easy access to current user's Telegram ID
- **User information**: Username, first name, last name, chat ID, etc.
- **Request tracking**: Timestamp and message ID tracking

## Usage

### Basic Setup

The middleware is automatically set up in the main bot file:

```typescript
// In src/telegram/index.ts
import { setupMiddleware } from './middleware';

private setupBot(): void {
  // Setup middleware (context, rate limiting, logging)
  setupMiddleware(this.bot);
  
  // ... rest of bot setup
}
```

### Using Global Context in Commands

```typescript
import { getCurrentTelegramId, getCurrentContext } from '../middleware';

export async function myCommand(ctx: Context): Promise<void> {
  // Get current user's Telegram ID
  const telegramId = getCurrentTelegramId();
  
  // Get full user context
  const userContext = getCurrentContext();
  
  console.log(`User ${telegramId} (${userContext?.username}) executed command`);
  
  // Use telegramId with your services
  const user = await userService.getUserByTelegramId(telegramId);
  
  await ctx.reply('Command executed!');
}
```

### Rate Limiting Configuration

```typescript
import { RateLimitMiddleware } from '../middleware';

// Custom rate limit configuration
const customRateLimit = new RateLimitMiddleware({
  windowMs: 30000, // 30 seconds
  maxRequests: 10, // 10 requests per 30 seconds
  message: '🚫 Too many requests! Please wait 30 seconds.',
});

// Use in bot setup
bot.use(customRateLimit.middleware());
```

### Rate Limit Management

```typescript
import { rateLimitMiddleware } from '../middleware';

// Get rate limit info for a user
const info = rateLimitMiddleware.getRateLimitInfo('123456789');
console.log(`User has ${info?.remaining} requests remaining`);

// Reset rate limit for a user
rateLimitMiddleware.resetRateLimit('123456789');

// Clear all rate limits (useful for testing)
rateLimitMiddleware.clearAllRateLimits();
```

### Global Context Management

```typescript
import { GlobalContextManager } from '../middleware';

// Get context for a specific user
const context = GlobalContextManager.getContext('123456789');

// Set additional context data
GlobalContextManager.setContext('123456789', {
  lastCommand: 'buy',
  preferences: { theme: 'dark' }
});

// Check if user is rate limited
const isLimited = GlobalContextManager.isRateLimited('123456789');
```

## API Reference

### RateLimitMiddleware

#### Constructor
```typescript
new RateLimitMiddleware(config?: Partial<RateLimitConfig>)
```

#### Configuration
```typescript
interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  message: string;       // Rate limit message
}
```

#### Methods
- `middleware()` - Returns middleware function
- `getRateLimitInfo(telegramId)` - Get rate limit info for user
- `resetRateLimit(telegramId)` - Reset rate limit for user
- `clearAllRateLimits()` - Clear all rate limits

### ContextMiddleware

#### Methods
- `middleware()` - Returns middleware function
- `getCurrentContext()` - Get current user context
- `getCurrentTelegramId()` - Get current user's Telegram ID
- `getCurrentChatId()` - Get current chat ID
- `hasContext()` - Check if in request context

### GlobalContextManager

#### Methods
- `getContext(telegramId)` - Get context for user
- `setContext(telegramId, context)` - Set context for user
- `isRateLimited(telegramId)` - Check if user is rate limited
- `clearContext(telegramId)` - Clear context for user
- `clearAllContexts()` - Clear all contexts

## Examples

### Using with User Service

```typescript
import { getCurrentTelegramId } from '../middleware';
import { userService } from '../../services/user.service';

export async function createWalletCommand(ctx: Context): Promise<void> {
  const telegramId = getCurrentTelegramId();
  
  if (!telegramId) {
    await ctx.reply('❌ Unable to identify user');
    return;
  }
  
  try {
    const user = await userService.getOrCreateUserFromTelegram({
      userId: parseInt(telegramId),
      username: ctx.from?.username,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
    });
    
    const userWithWallet = await userService.createWalletForUser(telegramId);
    
    await ctx.reply(`✅ Wallet created! Public key: ${userWithWallet.publicKey}`);
  } catch (error) {
    await ctx.reply('❌ Failed to create wallet');
  }
}
```

### Rate Limit Monitoring

```typescript
import { rateLimitMiddleware } from '../middleware';

export async function statusCommand(ctx: Context): Promise<void> {
  const telegramId = getCurrentTelegramId();
  const rateLimitInfo = rateLimitMiddleware.getRateLimitInfo(telegramId);
  
  const statusMessage = `
📊 *Rate Limit Status*

Requests used: ${rateLimitInfo?.count || 0}/${rateLimitInfo?.maxRequests || 30}
Remaining: ${rateLimitInfo?.remaining || 30}
Reset time: ${new Date(rateLimitInfo?.resetTime || 0).toLocaleTimeString()}
  `;
  
  await ctx.reply(statusMessage, { parse_mode: 'Markdown' });
}
```

## Best Practices

1. **Always check for telegramId**: Use `getCurrentTelegramId()` before accessing user data
2. **Handle rate limits gracefully**: Provide clear messages when users are rate limited
3. **Use context for logging**: Include user information in logs for better debugging
4. **Reset rate limits carefully**: Only reset rate limits for legitimate reasons
5. **Monitor rate limit usage**: Track rate limit patterns to optimize limits

## Configuration

Default rate limit settings:
- **Window**: 1 minute (60,000ms)
- **Max requests**: 30 per minute
- **Message**: "⚠️ Rate limit exceeded. Please wait a moment before sending another message."

You can customize these in your bot setup or create multiple rate limit instances for different endpoints. 