import { AESDecrypt } from './decrypt';
import { AESEncrypt } from './encrypt';

export interface AESKey {
  aesKey: Uint8Array;
}

export function encrypt(input: Uint8Array, key: AESKey): Uint8Array {
  return AESEncrypt(input, key.aesKey);
}

export function decrypt(input: Uint8Array, key: AESKey): Uint8Array {
  return AESDecrypt(input, key.aesKey);
}
