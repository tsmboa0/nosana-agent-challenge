import { Context } from 'telegraf';

export async function handleInfoCallback(ctx: Context): Promise<void> {
  try {
    const callbackData = ctx.callbackQuery?.inline_message_id;
    if (!callbackData) return;

    const symbol = callbackData.replace('info_', '');
    
    // TODO: Implement token info logic
    // This will be connected to the BirdeyeService
    
    await ctx.answerCbQuery();
    await ctx.reply(`ℹ️ ${symbol} Information\n\nThis feature is coming soon! You'll get detailed information about ${symbol} including price, market cap, volume, and more.`);
  } catch (error) {
    await ctx.answerCbQuery('❌ Error loading token information');
  }
} 