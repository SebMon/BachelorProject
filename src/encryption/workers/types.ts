import type { AESKey } from '../AES';
import type { RSAKey } from '../RSA/keys';

export interface AESRequest {
  bytes: Uint8Array;
  aesKey: AESKey;
}

export interface RSARequest {
  bytes: Uint8Array;
  rsaKey: RSAKey;
}
