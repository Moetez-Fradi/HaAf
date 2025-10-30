import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENC_KEY = process.env.GRAPH_ENCRYPTION_KEY || '';
if (!ENC_KEY.length) throw new Error('GRAPH_ENCRYPTION_KEY missing in .env');

const IV_LENGTH = 12;

export function encryptJson(data: any): string {
  const json = JSON.stringify(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENC_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptJson(base64Data: string): any {
  const raw = Buffer.from(base64Data, 'base64');
  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = raw.subarray(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENC_KEY), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}
