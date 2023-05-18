import Dexie from 'dexie';
import type { RSAPrivateKey, RSAPublicKey } from '../../encryption/RSA/keys';
import { isStoredAESKey, isStoredRSAPrivateKey, isStoredRSAPublicKey } from './types';
import type { StoredAESKey, StoredKey, StoredRSAPrivateKey, StoredRSAPublicKey } from './types';

class StoredKeysDatabase extends Dexie {
  aesKeys!: Dexie.Table<StoredAESKey, number>;
  rsaPublicKeys!: Dexie.Table<StoredRSAPublicKey, number>;
  rsaPrivateKeys!: Dexie.Table<StoredRSAPrivateKey, number>;

  constructor() {
    super('KeyDatabase');

    this.version(1).stores({
      aesKeys: '++id, name, aesKey',
      rsaPublicKeys: '++id, name, n, e',
      rsaPrivateKeys: '++id, name, n, d, e, p, q, dp, dq, qi'
    });
  }
}

export class StoredKeys {
  private readonly db: StoredKeysDatabase;

  constructor() {
    this.db = new StoredKeysDatabase();
  }

  async getAll(): Promise<StoredKey[]> {
    const emptyArr: StoredKey[] = [];
    const keys = emptyArr.concat(
      await this.db.aesKeys.toArray(),
      await this.db.rsaPublicKeys.toArray(),
      await this.db.rsaPrivateKeys.toArray()
    );
    keys.sort((a, b) => a.name.localeCompare(b.name));
    return keys;
  }

  async store(key: StoredKey): Promise<void> {
    if (isStoredAESKey(key)) {
      await this.db.aesKeys.put(key);
      return;
    }
    if (isStoredRSAPublicKey(key)) {
      await this.db.rsaPublicKeys.put(key);
      return;
    }
    if (isStoredRSAPrivateKey(key)) {
      await this.db.rsaPrivateKeys.put(key);
      return;
    }
    throw Error('The key was not of a type that could be stored in the database');
  }

  async remove(key: StoredKey): Promise<void> {
    if (!('id' in key && typeof key.id === 'number')) {
      throw Error("Can't remove a key without an id");
    }
    if (isStoredAESKey(key)) {
      await this.db.aesKeys.delete(key.id);
      return;
    }
    if (isStoredRSAPublicKey(key)) {
      await this.db.rsaPublicKeys.delete(key.id);
      return;
    }
    if (isStoredRSAPrivateKey(key)) {
      await this.db.rsaPrivateKeys.delete(key.id);
      return;
    }
    throw Error('The key was not of a type that could be in the database');
  }
}
