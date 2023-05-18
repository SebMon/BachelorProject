import type { RSAPrivateKey, RSAPublicKey } from '../../encryption/RSA/keys';

export interface StoredKey {
  name: string;
}

export interface StoredAESKey extends StoredKey {
  aesKey: Uint8Array;
}

export type StoredRSAPublicKey = StoredKey & RSAPublicKey;

export type StoredRSAPrivateKey = StoredKey & RSAPrivateKey;

export function isStoredAESKey(storedKey: StoredKey): storedKey is StoredAESKey {
  return 'aesKey' in storedKey;
}

export function isStoredRSAPublicKey(storedKey: StoredKey): storedKey is StoredRSAPublicKey {
  return 'n' in storedKey && !('d' in storedKey);
}

export function isStoredRSAPrivateKey(storedKey: StoredKey): storedKey is StoredRSAPrivateKey {
  return 'n' in storedKey && 'd' in storedKey;
}
