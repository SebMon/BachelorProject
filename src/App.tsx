import React, { useMemo, useState } from 'react';
import './App.css';
import init, { fib } from 'src-wasm';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import FileExplorer from './components/FileExplorer';
import FileMenu from './components/FileMenu';
import { selectedFileContext } from './context/SelectedFileContext';
import type { SelectedFileContext } from './context/SelectedFileContext';
import EncryptDialog, { EncryptionDialogVariant } from './components/EncryptDialog';
import type { EncryptionType } from './types/Encryption';
import { decryptFile, encryptFile } from './encryption/EncryptionHandler';

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

  const encryptSelected = (): void => {
    setEncryptionDialogVariant('encrypt');
    setShowEncryptionDialog(true);
  };

  const decryptSelected = (): void => {
    setEncryptionDialogVariant('decrypt');
    setShowEncryptionDialog(true);
  };

  const encryptionTriggered = (type: EncryptionType, key: string): void => {
    if (selectedFile === undefined || selectedFilesParentFolder === undefined) throw Error();
    if (encryptionDialogVariant === 'encrypt') {
      encryptFile(selectedFile, selectedFilesParentFolder, type, key)
        .then(() => {
          invalidateFileSystem();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('Encryption Failed!');
        });
    } else {
      decryptFile(selectedFile, selectedFilesParentFolder, type, key)
        .then(() => {
          invalidateFileSystem();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('Decryption Failed!');
        });
    }
  };

  return (
    <selectedFileContext.Provider value={selectedFileContextValue}>
      <div className="App row">
        <div className="col-8 h-100 p-5">
          <FileExplorer />
        </div>
        <div className="col-4 p-5">
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
        onEncrypt={encryptionTriggered}
      />
    </selectedFileContext.Provider>
  );
}

export default App;
