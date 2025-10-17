import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const SERVER_SECRET_KEY = Buffer.from(process.env.SERVER_SECRET_KEY, "base64");

export function decryptEnv(envCipher) {
  const raw = Buffer.from(envCipher, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", SERVER_SECRET_KEY, iv);
  decipher.setAuthTag(tag);
  const json = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  return JSON.parse(json);
}