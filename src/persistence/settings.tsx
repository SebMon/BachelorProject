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

class SettingsDatabase extends Dexie {
  settings!: Dexie.Table<SettingTableEntry, string>;

  constructor() {
    super('SettingsDatabase');

    this.version(1).stores({
      settings: 'key'
    });
  }
}

export class Settings {
  private readonly db: SettingsDatabase;

  constructor() {
    this.db = new SettingsDatabase();
  }

  async getEncryptionEngine(): Promise<EncryptionEngine> {
    const object = await this.db.settings.get(ENCRYPTION_ENGINE);

    if (object === undefined || !Object.values(EncryptionEngine).includes(object.value as EncryptionEngine)) {
      await this.db.settings.put({ key: ENCRYPTION_ENGINE, value: EncryptionEngine.wasm });
      return EncryptionEngine.wasm;
    }

    return object.value as EncryptionEngine;
  }

  async setEncryptionEngine(value: EncryptionEngine): Promise<void> {
    await this.db.settings.put({ key: ENCRYPTION_ENGINE, value });
  }

  async getNotificationLevel(): Promise<NotificationLevel> {
    const object = await this.db.settings.get(NOTIFICATION_LEVEL);

    if (object === undefined || !Object.values(NotificationLevel).includes(object.value as NotificationLevel)) {
      await this.db.settings.put({ key: NOTIFICATION_LEVEL, value: NotificationLevel.always });
      return NotificationLevel.always;
    }

    return object.value as NotificationLevel;
  }

  async setNotificationLevel(value: NotificationLevel): Promise<void> {
    await this.db.settings.put({ key: NOTIFICATION_LEVEL, value });
  }
}
