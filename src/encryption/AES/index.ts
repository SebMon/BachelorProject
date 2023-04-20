import { AESDecrypt } from './decrypt';
import { AESEncrypt } from './encrypt';

export function encrypt(input: Uint8Array, key: Uint8Array): Uint8Array {
  return AESEncrypt(input, key);
}

export function decrypt(input: Uint8Array, key: Uint8Array): Uint8Array {
  return AESDecrypt(input, key);
}
