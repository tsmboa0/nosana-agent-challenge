import { Context } from 'telegraf';
import { writeFileSync, unlinkSync, readFileSync, createReadStream } from 'fs';
import { mastraService } from '../../services/mastra.service';

export async function handleVoiceMessage(ctx: Context): Promise<void> {
  try {
    const voice = (ctx.message as any)?.voice;
    if (!voice) return;

    await ctx.sendChatAction('record_voice');

    // Get ogg buffer from Telegram
    const oggBuffer = await downloadVoiceFile(ctx, voice.file_id);
    // Listne to the Vn using Mastra voice
    const voice_agent = await mastraService.callVoiceAgent(oggBuffer);
    // Call the trader agent with the voice agent response
    const response = await mastraService.callTraderAgent(voice_agent);

    await ctx.reply(response, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(err);
    await ctx.reply('❌ Failed to process your voice message.');
  }
}

async function downloadVoiceFile(ctx: Context, fileId: string): Promise<Buffer> {
  const fileLink = await ctx.telegram.getFileLink(fileId);
  const response = await fetch(fileLink.href);
  if (!response.ok) throw new Error('Failed to download file');
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
