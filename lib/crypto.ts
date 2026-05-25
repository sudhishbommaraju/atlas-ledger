import crypto from 'crypto';

// AES-256-CBC. Key must be exactly 32 bytes; pad/truncate if env var is shorter/longer.
function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY ?? 'default-dev-key-change-in-prod!!';
  return Buffer.from(raw.padEnd(32, '0').slice(0, 32), 'utf-8');
}

/**
 * Encrypt a plaintext API key.
 * Returns  "<iv-hex>:<ciphertext-hex>"  — safe to store in the DB.
 */
export function encryptKey(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt a value produced by encryptKey().
 * Returns the original plaintext string.
 */
export function decryptKey(encrypted: string): string {
  const [ivHex, ctHex] = encrypted.split(':');
  if (!ivHex || !ctHex) throw new Error('Invalid encrypted key format');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(ctHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf-8');
}
