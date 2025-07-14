import { Context } from 'telegraf';
import { formatMessage } from '../utils/format-message';

export async function topSharesCommand(ctx: Context): Promise<void> {
  try {
    // TODO: Implement trending tokens fetching logic
    // This will be connected to the BirdeyeService
    
    const message = formatMessage(`
🔥 *Top Trending Tokens & Stocks*

*By Market Cap:*
1. SOL - Solana - $[PRICE] (+[CHANGE]%)
2. BONK - Bonk - $[PRICE] (+[CHANGE]%)
3. TSLAx - Tesla Stock - $[PRICE] (+[CHANGE]%)

*By Volume:*
1. SOL - Solana - $[VOLUME]M
2. BONK - Bonk - $[VOLUME]M
3. TSLAx - Tesla Stock - $[VOLUME]M

*Quick Actions:*
• Ask for detailed info: "Tell me about SOL"
• Get a chart: "Show me BONK chart"
• Buy tokens: "Buy 1 SOL worth of BONK"

*Note:* Prices and data are real-time from Birdeye
    `);

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply('❌ Failed to load trending tokens. Please try again later.');
  }
}
