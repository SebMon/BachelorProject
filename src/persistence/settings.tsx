import Dexie from 'dexie';

const ENCRYPTION_ENGINE = 'encryptionEngine';
const NOTIFICATION_LEVEL = 'notificationLevel';

interface SettingTableEntry {
  key: string;
  value: string;
}

export enum EncryptionEngine {
  wasm = 'wasm',
  js = 'js'
}

export enum NotificationLevel {
  never = 'never',
  onlyWhenOutOfFocus = 'outOfFocus',
  always = 'always'
}

export class Settings extends Dexie {
  settings!: Dexie.Table<SettingTableEntry, string>;

  constructor() {
    super('SettingsDatabase');

    this.version(1).stores({
      settings: 'key'
    });
  }

  async getEncryptionEngine(): Promise<EncryptionEngine> {
    const object = await this.settings.get(ENCRYPTION_ENGINE);

    if (object === undefined || !(object.value in EncryptionEngine)) {
      await this.settings.put({ key: ENCRYPTION_ENGINE, value: EncryptionEngine.wasm });
      return EncryptionEngine.wasm;
    }

    return object.value as EncryptionEngine;
  }

  async setEncryptionEngine(value: EncryptionEngine): Promise<void> {
    await this.settings.put({ key: ENCRYPTION_ENGINE, value });
  }

  async getNotificationLevel(): Promise<NotificationLevel> {
    const object = await this.settings.get(NOTIFICATION_LEVEL);

    if (object === undefined || !(object.value in NotificationLevel)) {
      await this.settings.put({ key: NOTIFICATION_LEVEL, value: NotificationLevel.always });
      return NotificationLevel.always;
    }

    return object.value as NotificationLevel;
  }

  async setNotificationLevel(value: NotificationLevel): Promise<void> {
    await this.settings.put({ key: NOTIFICATION_LEVEL, value });
  }
}
