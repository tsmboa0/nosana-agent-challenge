import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';

// Import middleware
import { setupMiddleware, getCurrentTelegramId } from './middleware';

// Import commands
import { startCommand } from './commands/start';
import { createWalletCommand } from './commands/create-wallet';
import { myAssetsCommand } from './commands/my-assets';
import { topSharesCommand } from './commands/top-shares';

// Import callbacks
import { handleBuyCallback } from './callbacks/buy-callback';
import { handleSellCallback } from './callbacks/sell-callback';
import { handleInfoCallback } from './callbacks/info-callback';
import { handleCreateWalletCallback } from './callbacks/create-wallet';

// Import message handlers
import { handleNaturalMessage } from './commands/message';
import { handleVoiceMessage } from './commands/voice';

// Import utilities
import { formatMessage } from './utils/format-message';

dotenv.config();

export class TelegramBot {
  private bot: Telegraf<Context>;
  private token: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN!;
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }

    this.bot = new Telegraf(this.token);
    this.setupBot();
  }

  private setupBot(): void {
    // Setup middleware (context, rate limiting, logging)
    setupMiddleware(this.bot);

    // Register commands
    this.bot.command('start', startCommand);
    this.bot.command('createwallet', createWalletCommand);
    this.bot.command('myassets', myAssetsCommand);
    this.bot.command('topshares', topSharesCommand);
    this.bot.command('help', this.helpCommand.bind(this));

    // Register callbacks
    this.bot.action(/buy_(.+)/, handleBuyCallback);
    this.bot.action(/sell_(.+)/, handleSellCallback);
    this.bot.action(/info_(.+)/, handleInfoCallback);
    this.bot.action(/create_wallet/, handleCreateWalletCallback);
    // Handle text messages
    this.bot.on(message('text'), handleNaturalMessage);
    
    // Handle voice messages
    this.bot.on(message('voice'), handleVoiceMessage);

    // Error handling
    this.bot.catch((err, ctx) => {
      const telegramId = getCurrentTelegramId();
      console.error(`Error for ${telegramId} (${ctx.updateType}):`, err);
      ctx.reply('Sorry, something went wrong. Please try again later.');
    });
  }

  private async helpCommand(ctx: Context): Promise<void> {
    const helpText = formatMessage(`
🤖 *Solvestor - AI-Powered Investment Assistant*

*Available Commands:*
/start - Start the bot and get welcome message
/createwallet - Create a new Solana wallet
/myassets - View your current assets and portfolio
/topshares - View top trending tokens and stocks
/help - Show this help message

*Natural Language:*
You can also chat naturally with me! Try:
• "What's the price of SOL?"
• "Should I buy TSLAx?"
• "Show me a chart for BONK"
• "Buy 10 SOL worth of BONK"
• "Sell half of my TSLAx holdings"

*Voice Messages:*
🎤 Send voice notes for hands-free interaction!
• "What's the current market trend?"
• "Should I invest in Bitcoin?"
• "Show me my portfolio performance"

*Features:*
• 📊 Real-time market data from Birdeye
• 📈 Trading charts and analysis
• 💰 Automated trading via Jupiter
• 🔒 Secure wallet management
• 🤖 AI-powered investment advice
• 🎤 Voice message support

*Security:*
Your private keys are encrypted and stored securely. Never share your private keys with anyone!
    `);

    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    try {
      console.log('Starting Solvestor Telegram bot');
      
      // Set bot commands
      await this.bot.telegram.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'createwallet', description: 'Create a new Solana wallet' },
        { command: 'myassets', description: 'View your assets' },
        { command: 'topshares', description: 'View top tokens/stocks' },
        { command: 'help', description: 'Show help message' },
      ]);

      console.log('Bot commands set');

      // Start polling
      this.bot.launch();
      console.log('Solvestor Telegram bot is running!');

      // Enable graceful stop
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      console.error('Failed to start bot:', error);
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    await this.bot.stop();
    console.log('Solvestor Telegram bot stopped.');
  }

  /**
   * Get bot instance (for testing)
   */
  getBot(): Telegraf<Context> {
    return this.bot;
  }
}

// Export singleton instance
export const telegramBot = new TelegramBot();
