import Dexie from 'dexie';
import type { RSAPrivateKey, RSAPublicKey } from '../encryption/RSA/keys';

export interface StoredKey {
  name: string;
}

export interface StoredAESKey extends StoredKey {
  aesKey: Uint8Array;
}

export type StoredRSAPublicKey = StoredKey & RSAPublicKey;

export type StoredRSAPrivateKey = StoredKey & RSAPrivateKey;

function isStoredAESKey(storedKey: StoredKey): storedKey is StoredAESKey {
  return 'aesKey' in storedKey;
}

function isStoredRSAPublicKey(storedKey: StoredKey): storedKey is StoredRSAPublicKey {
  return 'n' in storedKey && !('d' in storedKey);
}

function isStoredRSAPrivateKey(storedKey: StoredKey): storedKey is StoredRSAPrivateKey {
  return 'n' in storedKey && 'd' in storedKey;
}

export class StoredKeys extends Dexie {
  aesKeys!: Dexie.Table<StoredAESKey, number>;
  rsaPublicKeys!: Dexie.Table<StoredRSAPublicKey, number>;
  rsaPrivateKeys!: Dexie.Table<StoredRSAPrivateKey, number>;

  constructor() {
    super('KeyDatabase');

    console.log('database init');

    this.version(1).stores({
      aesKeys: '++id, name, aesKey',
      rsaPublicKeys: '++id, name, n, e',
      rsaPrivateKeys: '++id, name, n, d, e, p, q, dp, dq, qi'
    });
  }

  async store(key: StoredKey): Promise<void> {
    if (isStoredAESKey(key)) {
      await this.aesKeys.put(key);
      return;
    }
    if (isStoredRSAPublicKey(key)) {
      await this.rsaPublicKeys.put(key);
      return;
    }
    if (isStoredRSAPrivateKey(key)) {
      await this.rsaPrivateKeys.put(key);
      return;
    }
    throw Error('The key was not of a type that could be stored in the database');
  }
}
