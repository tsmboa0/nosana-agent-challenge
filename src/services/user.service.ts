import { PrismaClient, User, Asset, Transaction, AssetType, TransactionType, TransactionStatus } from '../../generated/prisma';
import { z } from 'zod';
import { solanaService } from './solana.service';
import { encryptionService } from './encryption.service';
import { TelegramContext } from '../types';
import { Context } from 'telegraf';

// Validation schemas
const CreateUserSchema = z.object({
  telegramId: z.string(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  publicKey: z.string(),
  encryptedPrivateKey: z.string(),
});

const CreateUserWithoutWalletSchema = z.object({
  telegramId: z.string(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const UpdateUserSchema = z.object({
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  publicKey: z.string().optional(),
  encryptedPrivateKey: z.string().optional(),
});

const CreateAssetSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  type: z.nativeEnum(AssetType),
  amount: z.number().positive(),
  value: z.number().nonnegative(),
});

const CreateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  symbol: z.string(),
  amount: z.number().positive(),
  price: z.number().positive(),
  totalValue: z.number().nonnegative(),
  txHash: z.string().optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
});

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new user
   * @param userData - User data to create
   * @returns Created user
   */
  async createUser(userData: z.infer<typeof CreateUserSchema>): Promise<User> {
    try {
      const validatedData = CreateUserSchema.parse(userData);
      
      const user = await this.prisma.user.create({
        data: validatedData,
      });
      
      return user;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new user from Telegram context (without wallet)
   * @param ctx - Telegram context containing user information
   * @returns Created user
   */
  async createUserFromTelegram(ctx: Context): Promise<User> {
    try {
      // Extract user data from Telegram context
      const telegramId = ctx.from?.id?.toString();
      const username = ctx.from?.username;
      const firstName = ctx.from?.first_name;
      const lastName = ctx.from?.last_name;
      if (!telegramId) {
        throw new Error('Telegram ID not found');
      }

      // Check if user already exists
      const existingUser = await this.getUserByTelegramId(telegramId);
      if (existingUser) {
        throw new Error('User already exists with this Telegram ID');
      }

      // Create user data (without wallet)
      const userData = {
        telegramId,
        username,
        firstName,
        lastName,
      };

      // Create the user in the database using Prisma directly
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          publicKey: '', // Empty string for now
          encryptedPrivateKey: '', // Empty string for now
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to create user from Telegram context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user by Telegram ID
   * @param telegramId - Telegram user ID
   * @returns User or null if not found
   */
  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        include: {
          assets: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10, // Get last 10 transactions
          },
        },
      });

      return user!;
    } catch (error) {
      throw new Error(`Failed to get user by Telegram ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get or create user from Telegram context (without wallet)
   * @param ctx - Telegram context containing user information
   * @returns User (existing or newly created)
   */
  async getOrCreateUserFromTelegram(ctx: Context): Promise<User> {
    try {
      const telegramId = ctx.from?.id?.toString();
      if (!telegramId) {
        throw new Error('Telegram ID not found');
      }
      
      // Try to find existing user
      const existingUser = await this.getUserByTelegramId(telegramId);
      if (existingUser) {
        return existingUser;
      }

      // Create new user (without wallet)
      return await this.createUserFromTelegram(ctx);
    } catch (error) {
      throw new Error(`Failed to get or create user from Telegram context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a wallet for an existing user by Telegram ID
   * @param telegramId - Telegram user ID
   * @returns Updated user with wallet
   */
  async createWalletForUser(telegramId: string): Promise<User> {
    try {
      // Get the user
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has a wallet
      if (user.publicKey && user.encryptedPrivateKey) {
        throw new Error('User already has a wallet');
      }

      // Create new Solana wallet
      const { publicKey, privateKey } = solanaService.createWallet();

      // Encrypt the private key using the Telegram ID and a default passcode
      const encryptedPrivateKey = encryptionService.encryptPrivateKey(privateKey, user.telegramId, 'default');

      // Update user with wallet information
      const updatedUser = await this.updateUser(user.id, {
        publicKey,
        encryptedPrivateKey,
      });

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to create wallet for user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }





  /**
   * Get user by public key
   * @param publicKey - Solana public key
   * @returns User or null if not found
   */
  async getUserByPublicKey(publicKey: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { publicKey },
        include: {
          assets: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to get user by public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user
   * @param id - User ID
   * @param updateData - Data to update
   * @returns Updated user
   */
  async updateUser(id: string, updateData: z.infer<typeof UpdateUserSchema>): Promise<User> {
    try {
      const validatedData = UpdateUserSchema.parse(updateData);
      
      const user = await this.prisma.user.update({
        where: { id },
        data: validatedData,
      });
      
      return user;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete user
   * @param id - User ID
   * @returns Deleted user
   */
  async deleteUser(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or update user asset
   * @param telegramId - Telegram user ID
   * @param assetData - Asset data
   * @returns Created or updated asset
   */
  async upsertAsset(telegramId: string, assetData: z.infer<typeof CreateAssetSchema>): Promise<Asset> {
    try {
      const validatedData = CreateAssetSchema.parse(assetData);
      
      // Get user by telegram ID
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await this.prisma.asset.upsert({
        where: {
          userId_symbol: {
            userId: user.id,
            symbol: validatedData.symbol,
          },
        },
        update: {
          amount: validatedData.amount,
          value: validatedData.value,
          updatedAt: new Date(),
        },
        create: {
          ...validatedData,
          userId: user.id,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to upsert asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user assets
   * @param telegramId - Telegram user ID
   * @returns Array of user assets
   */
  async getUserAssets(telegramId: string): Promise<Asset[]> {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await this.prisma.asset.findMany({
        where: { userId: user.id },
        orderBy: { value: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to get user assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user asset by symbol
   * @param telegramId - Telegram user ID
   * @param symbol - Asset symbol
   * @returns Asset or null if not found
   */
  async getUserAsset(telegramId: string, symbol: string): Promise<Asset | null> {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await this.prisma.asset.findUnique({
        where: {
          userId_symbol: {
            userId: user.id,
            symbol,
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to get user asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete user asset
   * @param telegramId - Telegram user ID
   * @param symbol - Asset symbol
   * @returns Deleted asset
   */
  async deleteAsset(telegramId: string, symbol: string): Promise<Asset> {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await this.prisma.asset.delete({
        where: {
          userId_symbol: {
            userId: user.id,
            symbol,
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create transaction
   * @param telegramId - Telegram user ID
   * @param transactionData - Transaction data
   * @returns Created transaction
   */
  async createTransaction(telegramId: string, transactionData: z.infer<typeof CreateTransactionSchema>): Promise<Transaction> {
    try {
      const validatedData = CreateTransactionSchema.parse(transactionData);
      
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await this.prisma.transaction.create({
        data: {
          ...validatedData,
          userId: user.id,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user transactions
   * @param telegramId - Telegram user ID
   * @param limit - Number of transactions to return (default: 50)
   * @param offset - Number of transactions to skip (default: 0)
   * @returns Array of user transactions
   */
  async getUserTransactions(telegramId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await this.prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      throw new Error(`Failed to get user transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update transaction status
   * @param id - Transaction ID
   * @param status - New status
   * @param txHash - Transaction hash (optional)
   * @returns Updated transaction
   */
  async updateTransactionStatus(id: string, status: TransactionStatus, txHash?: string): Promise<Transaction> {
    try {
      return await this.prisma.transaction.update({
        where: { id },
        data: {
          status,
          ...(txHash && { txHash }),
        },
      });
    } catch (error) {
      throw new Error(`Failed to update transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction by ID
   * @param id - Transaction ID
   * @returns Transaction or null if not found
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      return await this.prisma.transaction.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user portfolio summary
   * @param telegramId - Telegram user ID
   * @returns Portfolio summary with total value and asset count
   */
  async getPortfolioSummary(telegramId: string): Promise<{
    totalValue: number;
    assetCount: number;
    transactionCount: number;
  }> {
    try {
      const user = await this.getUserByTelegramId(telegramId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const [assets, transactionCount] = await Promise.all([
        this.prisma.asset.findMany({
          where: { userId: user.id },
          select: { value: true },
        }),
        this.prisma.transaction.count({
          where: { userId: user.id },
        }),
      ]);

      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

      return {
        totalValue,
        assetCount: assets.length,
        transactionCount,
      };
    } catch (error) {
      throw new Error(`Failed to get portfolio summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user exists by Telegram ID
   * @param telegramId - Telegram user ID
   * @returns True if user exists, false otherwise
   */
  async userExists(telegramId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      throw new Error(`Failed to check if user exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all users (for admin purposes)
   * @param limit - Number of users to return (default: 100)
   * @param offset - Number of users to skip (default: 0)
   * @returns Array of users
   */
  async getAllUsers(limit: number = 100, offset: number = 0): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              assets: true,
              transactions: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to get all users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close the database connection
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export a singleton instance
export const userService = new UserService();
