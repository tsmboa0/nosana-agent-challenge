import { Context } from 'telegraf';
import { mastraService } from '../../services/mastra.service';

export async function handleNaturalMessage(ctx: Context): Promise<void> {
  try {
    const message = ctx.text;
    if (!message) return;

    // TODO: Implement AI agent integration
    console.log(message);
    await ctx.sendChatAction('typing');
    // This will route messages to the agent for processing
    const agent_response = await mastraService.callTraderAgent(message);

    await ctx.reply(agent_response, { parse_mode: 'Markdown' });
  } catch (error) {
    await ctx.reply('❌ Sorry, I encountered an error. Please try again.');
  }
}
