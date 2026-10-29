/**
 * End-to-End Encryption (E2EE) Service
 * Uses standard W3C Web Cryptography API (AES-GCM 256-bit + SHA-256)
 * Ensures all location history logs and mobile telemetry are encrypted
 * before transmission or cloud persistence.
 */

const KEY_STORAGE_NAME = 'navipulse_e2ee_key_v1';

export async function getOrCreateMasterKey(): Promise<{ key: CryptoKey; rawKeyHex: string }> {
  const existingRaw = localStorage.getItem(KEY_STORAGE_NAME);

  if (existingRaw) {
    try {
      const rawBytes = hexToUint8Array(existingRaw);
      const keyBuffer = rawBytes.buffer.slice(
        rawBytes.byteOffset,
        rawBytes.byteOffset + rawBytes.byteLength
      ) as ArrayBuffer;

      const importedKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return { key: importedKey, rawKeyHex: existingRaw };
    } catch (e) {
      console.warn('Failed to import existing E2EE key, generating fresh one', e);
    }
  }

  // Generate fresh 256-bit AES-GCM key
  const newKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedRaw = await window.crypto.subtle.exportKey('raw', newKey);
  const rawKeyHex = uint8ArrayToHex(new Uint8Array(exportedRaw));
  localStorage.setItem(KEY_STORAGE_NAME, rawKeyHex);

  return { key: newKey, rawKeyHex };
}

export async function encryptLocationRecord(
  payload: object,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string; hashSha256: string }> {
  const jsonStr = JSON.stringify(payload);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonStr);

  // 12-byte initialization vector for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer;

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encodedData
  );

  const ciphertextBase64 = arrayBufferToBase64(encryptedBuffer);
  const ivBase64 = arrayBufferToBase64(ivBuffer);
  const hashSha256 = await computeSha256Hex(ciphertextBase64);

  return {
    ciphertext: ciphertextBase64,
    iv: ivBase64,
    hashSha256,
  };
}

export async function decryptLocationRecord<T = any>(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<T> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
  const ivBytes = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const ivBuffer = ivBytes.buffer.slice(
    ivBytes.byteOffset,
    ivBytes.byteOffset + ivBytes.byteLength
  ) as ArrayBuffer;

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    ciphertextBuffer
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as T;
}

export async function computeSha256Hex(content: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(content);
  const dataBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  return uint8ArrayToHex(new Uint8Array(hashBuffer));
}

// Helpers
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8Array(hex: string): Uint8Array {
  const pairs = hex.match(/[\da-f]{2}/gi) || [];
  return new Uint8Array(pairs.map((h) => parseInt(h, 16)));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
