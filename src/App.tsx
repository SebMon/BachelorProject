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
import type { EncryptionType } from './encryption/EncryptionType';
import { decryptFile, encryptFile } from './encryption/EncryptionHandler';
import ProcessIndicator from './components/ProcessIndicator';
import { settingsContext } from './context/settingsContext';
import { Settings } from './persistence/settings';
import { SettingsButton } from './components/SettingsButton';
import SettingsDialog from './components/SettingsDialog';

// Example for demonstrating using wasm
init()
  .then(() => {
    console.log(fib(20));
  })
  .catch((e) => {
    console.error(e);
  });

const settings = new Settings();

export interface Process {
  UUID: string;
  name: string;
}

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

  // Event handlers
  const encryptSelected = (): void => {
    setEncryptionDialogVariant('encrypt');
    setShowEncryptionDialog(true);
  };

  const decryptSelected = (): void => {
    setEncryptionDialogVariant('decrypt');
    setShowEncryptionDialog(true);
  };

  const encryptionTriggered = async (type: EncryptionType, key: string): Promise<void> => {
    if (selectedFile === undefined || selectedFilesParentFolder === undefined) throw Error();

    if (encryptionDialogVariant === 'encrypt') {
      const UUID = createProcess(`Encrypting ${selectedFile.name}`);
      await encryptFile(
        selectedFile,
        selectedFilesParentFolder,
        type,
        key,
        await settings.getEncryptionEngine(),
        (e) => {
          removeProcess(UUID);
          if (e === null) {
            invalidateFileSystem();
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
        key,
        await settings.getEncryptionEngine(),
        (e) => {
          removeProcess(UUID);
          if (e === null) {
            invalidateFileSystem();
          } else {
            console.error(e);
          }
        }
      );
    }
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
          <div className="col-12 col-md-4 mt-4  mt-md-0 pt-md-5 pb-5 px-5">
            <FileMenu
              fileName={selectedFile?.name}
              onEncryptionRequested={encryptSelected}
              onDecryptionRequested={decryptSelected}
            />
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

        {currentProcesses.length > 0 ? <ProcessIndicator items={currentProcesses} /> : null}
      </selectedFileContext.Provider>
    </settingsContext.Provider>
  );
}

export default App;
