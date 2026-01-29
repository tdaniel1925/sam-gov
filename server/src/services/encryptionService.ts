// =============================================================================
// API KEY ENCRYPTION SERVICE
// Securely encrypts and decrypts API keys for database storage
// =============================================================================

import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Get encryption key from environment variable
 * In production, this should be stored securely (e.g., AWS Secrets Manager)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Derive a 32-byte key from the environment variable
  return crypto.scryptSync(key, 'salt', KEY_LENGTH);
}

/**
 * Encrypt an API key for secure storage
 * @param plaintext - The API key to encrypt
 * @returns Encrypted string in format: salt:iv:tag:encrypted
 */
export function encryptApiKey(plaintext: string): string {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from master key + salt
    const key = crypto.scryptSync(getEncryptionKey(), salt, KEY_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the plaintext
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Combine all parts: salt + iv + tag + encrypted
    const combined = Buffer.concat([salt, iv, tag, encrypted]);

    // Return as base64 string
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt an encrypted API key
 * @param encrypted - The encrypted string from database
 * @returns Decrypted API key
 */
export function decryptApiKey(encrypted: string): string {
  try {
    // Convert from base64
    const combined = Buffer.from(encrypted, 'base64');

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const ciphertext = combined.subarray(ENCRYPTED_POSITION);

    // Derive key from master key + salt
    const key = crypto.scryptSync(getEncryptionKey(), salt, KEY_LENGTH);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Mask an API key for display purposes
 * Shows first 4 and last 4 characters, masks the rest
 * @param apiKey - The API key to mask
 * @returns Masked string like "sk-1234...7890"
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) {
    return '****';
  }

  const start = apiKey.substring(0, 7);
  const end = apiKey.substring(apiKey.length - 4);
  return `${start}...${end}`;
}

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @param provider - The provider (sam_gov or openai)
 * @returns True if format is valid
 */
export function validateApiKeyFormat(apiKey: string, provider: 'sam_gov' | 'openai'): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  if (provider === 'openai') {
    // OpenAI keys start with sk- and are usually 51 characters
    return apiKey.startsWith('sk-') && apiKey.length >= 40;
  }

  if (provider === 'sam_gov') {
    // SAM.gov API keys are typically alphanumeric
    // Format varies, so we just check for reasonable length and characters
    return /^[A-Za-z0-9_-]{20,}$/.test(apiKey);
  }

  return false;
}
