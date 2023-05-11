import React, { useContext } from 'react';
import { selectedFileContext } from '../context/SelectedFileContext';

interface FileMenuProps {
  onEncryptionRequested: () => void;
  onDecryptionRequested: () => void;
}

export default function FileMenu(props: FileMenuProps): JSX.Element {
  const { selectedFile, selectedFilesParentFolder, fileSystemInvalidated, setFileSystemInvalidated } =
    useContext(selectedFileContext);
  const invalidateFileSystem = (): void => {
    setFileSystemInvalidated(fileSystemInvalidated + 1);
  };

  const onDeletePressed = async (): Promise<void> => {
    if (selectedFile === undefined) {
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedFile.name}`)) {
      await selectedFilesParentFolder?.removeEntry(selectedFile.name);
      invalidateFileSystem();
    }
  };

  return (
    <div className="h-100">
      <div className="form-row row align-items-center mt-2">
        <div className="col-10">
          <input type="text" className="form-control mx-1" value={selectedFile?.name ?? 'Select a file...'} disabled />
        </div>
        <div
          data-testid="delete-button"
          className="col-2 btn d-flex"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={onDeletePressed}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFFFFF" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
          </svg>
        </div>
      </div>
      <div className="d-flex justify-content-between flex-row flex-wrap mt-3">
        <button
          className="btn btn-light mt-2 mx-1 px-5"
          onClick={props.onEncryptionRequested}
          disabled={selectedFile === undefined}
        >
          Encrypt
        </button>
        <button
          className="btn btn-light mt-2 mx-1 px-5"
          onClick={props.onDecryptionRequested}
          disabled={selectedFile === undefined}
        >
          Decrypt
        </button>
      </div>
    </div>
  );
}
