import { Context } from 'telegraf';
import { createWalletCommand } from '../commands/create-wallet';

export async function handleCreateWalletCallback(ctx: Context): Promise<void> {
  try {
    console.log("Inside create wallet callback");

    await ctx.answerCbQuery();
    console.log("calling create wallet command");
    await createWalletCommand(ctx);
  } catch (error) {
    await ctx.answerCbQuery('❌ Error processing buy request');
  }
}