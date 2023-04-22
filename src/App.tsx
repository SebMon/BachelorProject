import React, { useMemo, useState } from 'react';
import './App.css';
import init, { fib } from 'src-wasm';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import FileExplorer from './components/FileExplorer';
import FileMenu from './components/FileMenu';
import { selectedFileContext } from './context/SelectedFileContext';
import type { SelectedFileContext } from './context/SelectedFileContext';
import EncryptDialog from './components/EncryptDialog';
import type { EncryptionType } from './types/Encryption';

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
  const [showEncryptionDialog, setShowEncryptionDialog] = useState(false);

  const selectedFileContextValue = useMemo<SelectedFileContext>(() => {
    return { selectedFile, setSelectedFile };
  }, [selectedFile]);

  const encryptSelected = (): void => {
    setShowEncryptionDialog(true);
  };

  const encryptionTriggered = (type: EncryptionType, key: string): void => {
    console.log(type);
    console.log(key);
  };

  const decryptSelected = (): void => {
    console.log('decrypt pressed');
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
        onClose={() => {
          setShowEncryptionDialog(false);
        }}
        onEncrypt={encryptionTriggered}
      />
    </selectedFileContext.Provider>
  );
}

export default App;
