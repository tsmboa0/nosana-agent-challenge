import crypto from 'crypto';
import { z } from 'zod';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Validation schema for encryption secret
const EncryptionSecretSchema = z.string().length(32, 'Encryption secret must be exactly 32 characters');

export class EncryptionService {
  private secret: string;

  constructor() {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET environment variable is required');
    }
    
    // Validate secret length
    try {
      this.secret = EncryptionSecretSchema.parse(secret);
    } catch (error) {
      throw new Error('ENCRYPTION_SECRET must be exactly 32 characters long');
    }
  }

  /**
   * Encrypt a private key
   * @param privateKey - The private key to encrypt
   * @returns Encrypted private key as base64 string
   */
  encryptPrivateKey(privateKey: string, telegramId: string, passcode: string): string {
    try {
      // Generate a random IV
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(this.secret, 'hex'), iv);
      cipher.setAAD(Buffer.from(telegramId, 'utf8'));
      cipher.setAAD(Buffer.from(passcode, 'utf8'));
      // Encrypt the private key
      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the auth tag
      const tag = cipher.getAuthTag();
      
      // Combine IV, encrypted data, and auth tag
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex'), tag]);
      
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Failed to encrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt a private key
   * @param encryptedPrivateKey - The encrypted private key as base64 string
   * @returns Decrypted private key
   */
  decryptPrivateKey(encryptedPrivateKey: string, telegramId: string, passcode: string): string {
    try {
      // Convert from base64
      const combined = Buffer.from(encryptedPrivateKey, 'base64');
      
      // Extract IV, encrypted data, and auth tag
      const iv = combined.subarray(0, IV_LENGTH);
      const tag = combined.subarray(combined.length - TAG_LENGTH);
      const encrypted = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH - IV_LENGTH);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(this.secret, 'hex'), iv);
      decipher.setAAD(Buffer.from(telegramId, 'utf8'));
      decipher.setAAD(Buffer.from(passcode, 'utf8'));
      decipher.setAuthTag(tag);

      // Decrypt the private key
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Failed to decrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a new encryption secret (for development/testing)
   * @returns A new 32-character encryption secret
   */
  static generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate if a private key is properly formatted
   * @param privateKey - The private key to validate
   * @returns True if valid, false otherwise
   */
  static isValidPrivateKey(privateKey: string): boolean {
    // Basic validation for Solana private key (base58 encoded, 64 bytes when decoded)
    try {
      // This is a basic check - in production you might want more sophisticated validation
      return privateKey.length > 0 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(privateKey);
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
export const encryptionService = new EncryptionService();
