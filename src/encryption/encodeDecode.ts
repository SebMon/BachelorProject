import { Buffer } from 'buffer';

export function textToBytes(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

export function bytesToText(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length / 2; i++) {
    bytes.set([parseInt(hex.substring(2 * i, 2 * i + 2), 16)], i);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  const hexStrings: string[] = [];
  bytes.forEach((byte) => {
    hexStrings.push(byte.toString(16).padStart(2, '0'));
  });
  return hexStrings.join('');
}

export function base64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytesToHex(bytes), 'hex').toString('base64');
}
