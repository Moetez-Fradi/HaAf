import crypto from "crypto";

export function genSymmetricKey() {
  return crypto.randomBytes(32); // AES-256
}

export function aesEncryptJSON(obj, key) {
  const iv = crypto.randomBytes(12); // 96-bit recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    ct: ct.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function aesDecryptJSON(enc, key) {
  const iv = Buffer.from(enc.iv, "base64");
  const ct = Buffer.from(enc.ct, "base64");
  const tag = Buffer.from(enc.tag, "base64");
  const dec = crypto.createDecipheriv("aes-256-gcm", key, iv);
  dec.setAuthTag(tag);
  const pt = Buffer.concat([dec.update(ct), dec.final()]);
  return JSON.parse(pt.toString("utf8"));
}

export function rsaWrapKey(symKeyBuffer, recipientPubPem) {
  // OAEP is safer than PKCS1v1.5
  return crypto.publicEncrypt(
    {
      key: recipientPubPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    symKeyBuffer
  ).toString("base64");
}

export function rsaUnwrapKey(encKeyBase64, recipientPrivatePem) {
  return crypto.privateDecrypt(
    {
      key: recipientPrivatePem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encKeyBase64, "base64")
  ); // returns Buffer (the symmetric key)
}