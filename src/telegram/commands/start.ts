import { Context } from 'telegraf';
import { formatMessage } from '../utils/format-message';
import { getCurrentTelegramId, getCurrentContext } from '../middleware';

export async function startCommand(ctx: Context): Promise<void> {
  // Get current user's Telegram ID from global context
  const telegramId = getCurrentTelegramId();
  const userContext = getCurrentContext();
  
  console.log(`User ${telegramId} (${userContext?.username || 'unknown'}) started the bot`);

  const welcomeMessage = `
🎉 *Welcome to SolVestor!*

I'm your AI powered investment assistant for Solana. 

*I can help you:*

• 📊 Get real time stock or token market data and charts
• 🤖 Provide AI powered investment insights
• 💰 Buy and sell tokens or stocks automatically
• 📈 Track your portfolio performance

*Getting Started:*
• Click createwallet button to create your Solana wallet
• Fun your wallet with some SOL or USDC
• Chat naturally with me for market analysis using text or voice

*Example Commands:*
• Should I buy TSLAx?
• Show me a chart for BONK
• Can I buy $TRUMP token?

*Security Note:*
Your private keys are encrypted and stored securely. Never share your private keys with anyone!

Ready to start investing? Let's go! 🚀
  `;

  await ctx.reply(welcomeMessage, { 
    parse_mode: 'Markdown', 
    reply_markup: {
      inline_keyboard: [
        [{text: "💰 Create Wallet", callback_data: "create_wallet"}]
      ]
    }
  });
} 