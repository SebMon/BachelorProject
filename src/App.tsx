import React, { useMemo, useState } from 'react';
import './App.css';
import init, { fib } from 'src-wasm';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileExplorer from './components/FileExplorer/FileExplorer';
import FileMenu from './components/FileMenu';
import { selectedFileContext } from './context/SelectedFileContext';
import type { SelectedFileContext } from './context/SelectedFileContext';
import EncryptDialog from './components/EncryptDialog';
import type { EncryptionDialogVariant } from './components/EncryptDialog';
import { EncryptionType, KeyType } from './encryption/Types';
import type { EncryptionKey } from './encryption/Types';
import { decryptFile, encryptFile } from './encryption/EncryptionHandler';
import ProcessIndicator from './components/ProcessIndicator';
import { settingsContext } from './context/settingsContext';
import { NotificationLevel, Settings } from './persistence/settings';
import { SettingsButton } from './components/SettingsButton';
import SettingsDialog from './components/SettingsDialog';
import KeyMenu from './components/KeyMenu';
import GenerateKeyDialog from './components/GenerateKeyDialog';
import ImportKeyDialog from './components/ImportKeyDialog';
import { StoredKeys } from './persistence/StoredKeys/StoredKeys';
import type { StoredAESKey, StoredRSAPrivateKey, StoredRSAPublicKey } from './persistence/StoredKeys/types';
import { StoredKeysContext } from './context/StoredKeysContext';
import { hexToBytes } from './encryption/encodeDecode';
import { PrivateKeyFromPem, PublicKeyFromPem, base64ToUInt8Array } from './encryption/RSA/keys';

// Example for demonstrating using wasm
init()
  .then(() => {
    console.log(fib(20));
  })
  .catch((e) => {
    console.error(e);
  });

const settings = new Settings();
const storedKeys = new StoredKeys();

export interface Process {
  UUID: string;
  name: string;
}

let windowHasFocus = true;

window.addEventListener('focus', () => {
  windowHasFocus = true;
});

window.addEventListener('blur', () => {
  windowHasFocus = false;
});

function App(): JSX.Element {
  // State and management of filesystem and selected files
  const [selectedFile, setSelectedFile] = useState<FileSystemFileHandle | undefined>(undefined);
  const [selectedFilesParentFolder, setSelectedFilesParentFolder] = useState<FileSystemDirectoryHandle | undefined>(
    undefined
  );
  const [fileSystemInvalidated, setFileSystemInvalidated] = useState<number>(0);
  const invalidateFileSystem = (): void => {
    setFileSystemInvalidated(fileSystemInvalidated + 1);
  };
  const selectedFileContextValue = useMemo<SelectedFileContext>(() => {
    return {
      selectedFile,
      setSelectedFile,
      selectedFilesParentFolder,
      setSelectedFilesParentFolder,
      fileSystemInvalidated,
      setFileSystemInvalidated
    };
  }, [selectedFile, selectedFilesParentFolder, fileSystemInvalidated]);

  // Manage dialogs
  const [showEncryptionDialog, setShowEncryptionDialog] = useState(false);
  const [showGenerateKeyDialog, setShowGenerateKeyDialog] = useState(false);
  const [showImportKeyDialog, setShowImportKeyDialog] = useState(false);
  const [encryptionDialogVariant, setEncryptionDialogVariant] = useState<EncryptionDialogVariant>('encrypt');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Manage running processes
  const [currentProcesses, setCurrentProcesses] = useState<Process[]>([]);

  const createProcess = (name: string): string => {
    const UUID = self.crypto.randomUUID();
    const newValue = currentProcesses;
    currentProcesses.push({ UUID, name });
    setCurrentProcesses(newValue);
    return UUID;
  };

  const removeProcess = (UUID: string): void => {
    const newValue = currentProcesses;
    newValue.splice(
      newValue.findIndex((p) => p.UUID === UUID),
      1
    );
    setCurrentProcesses(newValue);
  };

  const requestNotificationPermission = async (): Promise<void> => {
    await Notification.requestPermission();
  };

  const notifyUser = (text: string): void => {
    const run = async (): Promise<void> => {
      const permission = await Notification.requestPermission();

      const notificationLevel = await settings.getNotificationLevel();

      if (permission !== 'granted') {
        return;
      }

      const notificationsAlwaysEnabled = notificationLevel === NotificationLevel.always;

      const notificationsEnabledWhenWindowIsOutOfFocus = notificationLevel === NotificationLevel.onlyWhenOutOfFocus;

      if (notificationsAlwaysEnabled || (notificationsEnabledWhenWindowIsOutOfFocus && !windowHasFocus)) {
        // eslint-disable-next-line no-new
        new Notification(text);
      }
    };

    run().catch(() => {
      console.error('failed to show notification');
    });
  };

  // Event handlers
  const encryptSelected = (): void => {
    setEncryptionDialogVariant('encrypt');
    setShowEncryptionDialog(true);
  };

  const decryptSelected = (): void => {
    setEncryptionDialogVariant('decrypt');
    setShowEncryptionDialog(true);
  };

  const generateKeySelected = (): void => {
    setShowGenerateKeyDialog(true);
  };

  const importKeySelected = (): void => {
    setShowImportKeyDialog(true);
  };

  const encryptionTriggered = async (type: EncryptionType, key: EncryptionKey): Promise<void> => {
    if (selectedFile === undefined || selectedFilesParentFolder === undefined) throw Error();

    await requestNotificationPermission();

    if (encryptionDialogVariant === 'encrypt') {
      const UUID = createProcess(`Encrypting ${selectedFile.name}`);
      await encryptFile(
        selectedFile,
        selectedFilesParentFolder,
        type,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        key,
        await settings.getEncryptionEngine(),
        (e) => {
          removeProcess(UUID);
          if (e === null) {
            invalidateFileSystem();
            notifyUser(`Successfully encrypted ${selectedFile.name}`);
          } else {
            console.error(e);
          }
        }
      );
    } else {
      const UUID = createProcess(`Decrypting ${selectedFile.name}`);
      await decryptFile(
        selectedFile,
        selectedFilesParentFolder,
        type,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        key,
        await settings.getEncryptionEngine(),
        (e) => {
          removeProcess(UUID);
          if (e === null) {
            invalidateFileSystem();
            notifyUser(`Successfully decrypted ${selectedFile.name}`);
          } else {
            console.error(e);
          }
        }
      );
    }
  };

  const generateKeyTriggered = async (type: EncryptionType, name: string): Promise<void> => {
    if (type === EncryptionType.Symmetric) {
      const key: CryptoKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
      const keyRaw: ArrayBuffer = await window.crypto.subtle.exportKey('raw', key);
      const keyToStore: StoredAESKey = {
        name,
        aesKey: new Uint8Array(keyRaw)
      };
      await storedKeys.store(keyToStore);
    } else {
      const keyPair: CryptoKeyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );
      const publicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const publicKeyToStore: StoredRSAPublicKey = {
        name: name + ' - public',
        n: base64ToUInt8Array(publicKey.n!),
        e: base64ToUInt8Array(publicKey.e!)
      };
      const privateKey = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
      const privateKeyToStore: StoredRSAPrivateKey = {
        name: name + ' - private',
        n: base64ToUInt8Array(privateKey.n!),
        e: base64ToUInt8Array(privateKey.e!),
        d: base64ToUInt8Array(privateKey.d!),
        p: base64ToUInt8Array(privateKey.p!),
        q: base64ToUInt8Array(privateKey.q!),
        dp: base64ToUInt8Array(privateKey.dp!),
        dq: base64ToUInt8Array(privateKey.dq!),
        qi: base64ToUInt8Array(privateKey.qi!)
      };
      /* eslint-emable @typescript-eslint/no-non-null-assertion */
      await storedKeys.store(publicKeyToStore);
      await storedKeys.store(privateKeyToStore);
    }
  };

  const importKeyTriggered = async (type: KeyType, name: string, keyText: string): Promise<void> => {
    if (type === KeyType.Symmetric) {
      const key: StoredAESKey = {
        name,
        aesKey: hexToBytes(keyText)
      };

      await storedKeys.store(key);
      return;
    }

    if (type === KeyType.AsymmetricPublic) {
      const parsedPem = await PublicKeyFromPem(keyText);
      const key: StoredRSAPublicKey = {
        name,
        ...parsedPem
      };

      await storedKeys.store(key);
      return;
    }

    if (type === KeyType.AsymmetricPrivate) {
      const parsedPem = await PrivateKeyFromPem(keyText);
      const key: StoredRSAPrivateKey = {
        name,
        ...parsedPem
      };

      await storedKeys.store(key);
      return;
    }

    throw Error('None of the accepted key types were selected');
  };

  const getTabTitle = (): string => {
    if (currentProcesses.length === 0) {
      return 'Encryption';
    }

    if (currentProcesses.length === 1) {
      return currentProcesses[0].name;
    }

    return `Encrypting ${currentProcesses.length} files`;
  };

  document.title = getTabTitle();

  return (
    <StoredKeysContext.Provider value={storedKeys}>
      <settingsContext.Provider value={settings}>
        <selectedFileContext.Provider value={selectedFileContextValue}>
          <SettingsButton
            onClick={() => {
              setShowSettingsDialog(true);
            }}
          />

          <div className="App row">
            <div className="col-12 col-md-8 h-100 pt-5 px-5">
              <FileExplorer />
            </div>
            <div className="col-12 col-md-4 mt-4 mt-md-0 pt-md-5 px-5 h-100 d-flex flex-column justify-content-between">
              <div className="row">
                <FileMenu onEncryptionRequested={encryptSelected} onDecryptionRequested={decryptSelected} />
              </div>
              <div className="row h-75">
                <KeyMenu onGenerateRequested={generateKeySelected} onImportRequested={importKeySelected}></KeyMenu>
              </div>
            </div>
          </div>

          <EncryptDialog
            show={showEncryptionDialog}
            variant={encryptionDialogVariant}
            onClose={() => {
              setShowEncryptionDialog(false);
            }}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onEncrypt={encryptionTriggered}
          />

          <SettingsDialog
            show={showSettingsDialog}
            onClose={() => {
              setShowSettingsDialog(false);
            }}
          />

          <GenerateKeyDialog
            show={showGenerateKeyDialog}
            onClose={() => {
              setShowGenerateKeyDialog(false);
            }}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onGenerate={generateKeyTriggered}
          ></GenerateKeyDialog>

          <ImportKeyDialog
            show={showImportKeyDialog}
            onClose={() => {
              setShowImportKeyDialog(false);
            }}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onImport={importKeyTriggered}
          ></ImportKeyDialog>

          {currentProcesses.length > 0 ? <ProcessIndicator items={currentProcesses} /> : null}
        </selectedFileContext.Provider>
      </settingsContext.Provider>
    </StoredKeysContext.Provider>
  );
}

export default App;
