import { Context } from 'telegraf';
import { userService } from '../../services/user.service';

export async function createWalletCommand(ctx: Context): Promise<void> {
  try {
    const res = await userService.getOrCreateUserFromTelegram(ctx);
    const publicKey = res.publicKey;
    const message = `
🔐 *Wallet Creation*

Your Solana wallet has been created successfully!

*Wallet Details:*
• Public Key: \`${publicKey}\`
• Status: ✅ Active
• Network: Solana Mainnet

*Next Steps:*
• Start by funding your wallet with some SOL or USDC
• Then ask me to provide a market analysis
• Example: "Should I buy TSLAx?"
• I can also help you execute a trade. 

*Security Reminder:*
Your private key is encrypted and stored securely. Never share your private keys with anyone!
    `;

    setTimeout(async () => {
      await ctx.reply(message, { parse_mode: 'Markdown' });
    }, 1500);
  } catch (error) {
    await ctx.reply('❌ Failed to create wallet. Please try again later.');
  }
}
