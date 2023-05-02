import React, { useMemo, useState } from 'react';
import './App.css';
import init, { fib } from 'src-wasm';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileExplorer from './components/FileExplorer';
import FileMenu from './components/FileMenu';
import { selectedFileContext } from './context/SelectedFileContext';
import type { SelectedFileContext } from './context/SelectedFileContext';
import EncryptDialog from './components/EncryptDialog';
import type { EncryptionDialogVariant } from './components/EncryptDialog';
import type { EncryptionType, Process } from './types/Encryption';
import { decryptFile, encryptFile } from './encryption/EncryptionHandler';
import FloatingActionButton from './components/FloatingActionButton';

// Example for demonstrating using wasm
init()
  .then(() => {
    console.log(fib(20));
  })
  .catch((e) => {
    console.error(e);
  });

function App(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<FileSystemFileHandle | undefined>(undefined);
  const [selectedFilesParentFolder, setSelectedFilesParentFolder] = useState<FileSystemDirectoryHandle | undefined>(
    undefined
  );

  const [fileSystemInvalidated, setFileSystemInvalidated] = useState<number>(0);
  const invalidateFileSystem = (): void => {
    setFileSystemInvalidated(fileSystemInvalidated + 1);
  };

  const [showEncryptionDialog, setShowEncryptionDialog] = useState(false);
  const [encryptionDialogVariant, setEncryptionDialogVariant] = useState<EncryptionDialogVariant>('encrypt');

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
      await encryptFile(selectedFile, selectedFilesParentFolder, type, key, (e) => {
        removeProcess(UUID);
        if (e === null) {
          invalidateFileSystem();
        } else {
          console.error(e);
        }
      });
    } else {
      const UUID = createProcess(`Decrypting ${selectedFile.name}`);
      await decryptFile(selectedFile, selectedFilesParentFolder, type, key, (e) => {
        removeProcess(UUID);
        if (e === null) {
          invalidateFileSystem();
        } else {
          console.error(e);
        }
      });
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
    <selectedFileContext.Provider value={selectedFileContextValue}>
      <div className="App row">
        <div className="col-12 col-md-8 h-100 pt-5 px-5">
          <FileExplorer />
        </div>
        <div className="col-12 col-md-4 mt-4  mt-md-0 pt-md-5 pb-5 px-5">
          <FileMenu onEncryptionRequested={encryptSelected} onDecryptionRequested={decryptSelected} />
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
      {currentProcesses.length > 0 ? <FloatingActionButton items={currentProcesses} /> : null}
    </selectedFileContext.Provider>
  );
}

export default App;
