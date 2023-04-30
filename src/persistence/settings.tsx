import Dexie from 'dexie';

const ENCRYPTION_ENGINE = 'encryptionEngine';

export enum EncryptionEngine {
  wasm = 'wasm',
  js = 'js'
}

interface Setting {
  key: string;
  value: string;
}

export class Settings extends Dexie {
  settings!: Dexie.Table<Setting, string>;

  constructor() {
    super('SettingsDatabase');

    this.version(1).stores({
      settings: 'key'
    });
  }

  async getEncryptionEngine(): Promise<EncryptionEngine> {
    const object = await this.settings.get(ENCRYPTION_ENGINE);

    if (object === undefined) {
      await this.settings.add({ key: ENCRYPTION_ENGINE, value: EncryptionEngine.wasm });
      return EncryptionEngine.wasm;
    }

    const value = object.value;

    if (!(value === EncryptionEngine.js || value === EncryptionEngine.wasm)) {
      await this.settings.put({ key: ENCRYPTION_ENGINE, value: EncryptionEngine.wasm });
      return EncryptionEngine.wasm;
    }

    return value;
  }

  async setEncryptionEngine(value: EncryptionEngine): Promise<void> {
    await this.settings.put({ key: ENCRYPTION_ENGINE, value });
  }
}
