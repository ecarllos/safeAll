import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface EncryptedResult {
  encryptedData: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class CryptoService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LEN = 32; // 256 bits
  private readonly ITERATIONS = 100000;
  private readonly DIGEST = 'sha256';

  /**
   * Generates a random salt for password key derivation.
   */
  generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Hashes a master password for authentication verification (using bcrypt).
   */
  async hashMasterPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifies a master password against its bcrypt hash.
   */
  async verifyMasterPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Derives a 256-bit encryption key from the Master Password and salt using PBKDF2.
   */
  deriveKey(masterPassword: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(
      masterPassword,
      salt,
      this.ITERATIONS,
      this.KEY_LEN,
      this.DIGEST,
    );
  }

  /**
   * Encrypts plaintext using AES-256-GCM authenticated encryption.
   */
  encrypt(plaintext: string, masterPassword: string, salt: string): EncryptedResult {
    const key = this.deriveKey(masterPassword, salt);
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  /**
   * Decrypts AES-256-GCM encrypted data. Throws if authTag fails (tampered or wrong key).
   */
  decrypt(
    encryptedData: string,
    ivHex: string,
    authTagHex: string,
    masterPassword: string,
    salt: string,
  ): string {
    try {
      const key = this.deriveKey(masterPassword, salt);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);

      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new BadRequestException('Falha na descriptografia: Senha mestra incorreta ou dados corrompidos.');
    }
  }
}
