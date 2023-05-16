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

export function isStoredAESKey(storedKey: StoredKey): storedKey is StoredAESKey {
  return 'aesKey' in storedKey;
}

export function isStoredRSAPublicKey(storedKey: StoredKey): storedKey is StoredRSAPublicKey {
  return 'n' in storedKey && !('d' in storedKey);
}

export function isStoredRSAPrivateKey(storedKey: StoredKey): storedKey is StoredRSAPrivateKey {
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

  async getAll(): Promise<StoredKey[]> {
    const emptyArr: StoredKey[] = [];
    const keys = emptyArr.concat(
      await this.aesKeys.toArray(),
      await this.rsaPublicKeys.toArray(),
      await this.rsaPrivateKeys.toArray()
    );
    keys.sort((a, b) => a.name.localeCompare(b.name));
    return keys;
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

  async remove(key: StoredKey): Promise<void> {
    if (!('id' in key && typeof key.id === 'number')) {
      throw Error("Can't remove a key without an id");
    }
    if (isStoredAESKey(key)) {
      await this.aesKeys.delete(key.id);
      return;
    }
    if (isStoredRSAPublicKey(key)) {
      await this.rsaPublicKeys.delete(key.id);
      return;
    }
    if (isStoredRSAPrivateKey(key)) {
      await this.rsaPrivateKeys.delete(key.id);
      return;
    }
    throw Error('The key was not of a type that could be in the database');
  }
}
