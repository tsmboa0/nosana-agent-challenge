import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { encryptionService } from './encryption.service';
import { jupiterService } from './api.services/jupiter.service';
import { User, Asset, Transaction as AppTransaction } from '../types';
import { userService } from './user.service';
import { getCurrentTelegramId, getCurrentContext } from '../telegram/middleware';

export class SolanaService {
  private connection: Connection;
  private rpcUrl: string;

  constructor() {
    this.rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }

  /**
   * Get current user context safely
   */
  private getCurrentUserContext() {
    const telegramId = getCurrentTelegramId();
    const userContext = getCurrentContext();
    
    return {
      telegramId,
      userContext,
      hasContext: !!telegramId,
    };
  }

  /**
   * Create a new Solana wallet
   */
  createWallet(): { publicKey: string; privateKey: string } {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toString();
    const privateKey = Buffer.from(keypair.secretKey).toString('base64');
    
    return { publicKey, privateKey };
  }

  /**
   * Get wallet from encrypted private key
   */
  getWalletFromEncryptedKey(encryptedPrivateKey: string, telegramId: string, passcode: string): Keypair {
    try {
      const decryptedPrivateKey = encryptionService.decryptPrivateKey(encryptedPrivateKey, telegramId, passcode);
      const privateKeyBytes = Buffer.from(decryptedPrivateKey, 'base64');
      return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      throw new Error(`Failed to decrypt wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get SOL balance
   */
  async getSolBalance(publicKey: string): Promise<number> {
    try {
      const { telegramId, userContext } = this.getCurrentUserContext();
      
      if (telegramId) {
        console.log(`Getting SOL balance for user ${telegramId} (${userContext?.username}): ${publicKey}`);
      }
      
      const pubKey = new PublicKey(publicKey);
      const balance = await this.connection.getBalance(pubKey);
      
      if (telegramId) {
        console.log(`SOL balance for user ${telegramId}: ${balance / LAMPORTS_PER_SOL} SOL`);
      }
      
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      const { telegramId } = this.getCurrentUserContext();
      console.error(`Failed to get SOL balance for user ${telegramId}:`, error);
      throw new Error(`Failed to get SOL balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(publicKey: string, tokenMint: string): Promise<number> {
    try {
      const walletPubKey = new PublicKey(publicKey);
      const mintPubKey = new PublicKey(tokenMint);
      
      const tokenAccount = await getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        true,
        walletPubKey,
        mintPubKey
      );

      const balance = await this.connection.getTokenAccountBalance(tokenAccount);
      return Number(balance.value.amount) / Math.pow(10, balance.value.decimals);
    } catch (error) {
      // Token account might not exist, return 0
      return 0;
    }
  }

  /**
   * Get all token balances for a wallet
   */
  async getAllTokenBalances(publicKey: string): Promise<Array<{ mint: string; balance: number; decimals: number }>> {
    try {
      const walletPubKey = new PublicKey(publicKey);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(walletPubKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        balance: Number(account.account.data.parsed.info.tokenAmount.amount) / 
                Math.pow(10, account.account.data.parsed.info.tokenAmount.decimals),
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }));
    } catch (error) {
      throw new Error(`Failed to get token balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Buy tokens using Jupiter
   */
  async buyTokens(
    user: User,
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 100,
    passcode: string,
  ): Promise<{ txHash: string }> {
    try {
      // Get current user context from global context
      const telegramId = getCurrentTelegramId();
      const userContext = getCurrentContext();
      
      console.log(`Buying tokens for user ${telegramId} (${userContext?.username})`);
      console.log(`Transaction: ${inputMint} -> ${outputMint}, Amount: ${amount}`);
      
      const wallet = this.getWalletFromEncryptedKey(user.encryptedPrivateKey, user.telegramId, passcode);
      
      // Get quote from Jupiter
      const quote = await jupiterService.getQuote({
        inputMint,
        outputMint,
        amount: Math.floor(amount * Math.pow(10, 9)).toString(), // Convert to lamports
        slippageBps,
      });

      // Get swap transaction
      const swapTransaction = await jupiterService.getSwapTransaction(quote);
      
      // Deserialize and sign transaction
      const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'));
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      
      // Sign and send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet]
      );

      console.log(`Transaction successful for user ${telegramId}: ${signature}`);

      return {
        txHash: signature,
      };
    } catch (error) {
      const telegramId = getCurrentTelegramId();
      console.error(`Transaction failed for user ${telegramId}:`, error);
      throw new Error(`Failed to buy tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sell tokens using Jupiter
   */
  async signAndSendJupiterTransaction(
    transaction_: string,
    passcode: string
  ): Promise<{ success: boolean, txHash: string }> {
    try {
      // Get current user context for logging
      const { telegramId: currentTelegramId, userContext } = this.getCurrentUserContext();
      if (!currentTelegramId) {
        throw new Error('User not found');
      }
      
      console.log(`Processing Jupiter transaction for user ${currentTelegramId} (${userContext?.username})`);
      
      const user = await userService.getUserByTelegramId(currentTelegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const wallet = this.getWalletFromEncryptedKey(user.encryptedPrivateKey, currentTelegramId, passcode);
      
      // Deserialize and sign transaction
      const transaction = Transaction.from(Buffer.from(transaction_, 'base64'));
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      
      // Sign and send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [wallet]
      );

      console.log(`Jupiter transaction successful for user ${currentTelegramId}: ${signature}`);

      return {
        success: true,
        txHash: signature,
      };

    } catch (error) {
      const { telegramId: currentTelegramId } = this.getCurrentUserContext();
      console.error(`Jupiter transaction failed for user ${currentTelegramId}:`, error);
      throw new Error(`Failed to sell tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(txHash: string): Promise<'confirmed' | 'failed' | 'pending'> {
    try {
      const status = await this.connection.getSignatureStatus(txHash);
      if (!status.value) return 'pending';
      
      if (status.value.err) return 'failed';
      if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
        return 'confirmed';
      }
      
      return 'pending';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getTransactionHistory(publicKey: string, limit: number = 20): Promise<any[]> {
    try {
      const pubKey = new PublicKey(publicKey);
      const signatures = await this.connection.getSignaturesForAddress(pubKey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await this.connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });
            return {
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              transaction: tx,
            };
          } catch {
            return null;
          }
        })
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate Solana address
   */
  static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<boolean> {
    try {
      await this.connection.getLatestBlockhash();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const solanaService = new SolanaService(); 