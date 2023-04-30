import type { RSAKey } from '../RSA/keys';

export interface AESRequest {
  bytes: Uint8Array;
  AESKey: Uint8Array;
}

export interface RSARequest {
  bytes: Uint8Array;
  rsakey: RSAKey;
}
