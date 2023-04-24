import React, { useContext, useState } from 'react';
import Folder from './Folder';
import { selectedFileContext } from '../context/SelectedFileContext';

export default function FileExplorer(): JSX.Element {
  const [mainDirectoryHandle, setMainDirectoryHandle] = useState<FileSystemDirectoryHandle>();
  const { fileSystemInvalidated, setFileSystemInvalidated } = useContext(selectedFileContext);

  const invalidateFileSystem = (): void => {
    setFileSystemInvalidated(fileSystemInvalidated + 1);
  };

  const selectFolder = (): void => {
    window
      .showDirectoryPicker()
      .then((result) => {
        setMainDirectoryHandle(result);
      })
      .catch(console.error);
  };

  return (
    <div className="container h-75">
      <div className="row me-3 mb-2">
        <button
          className="col-3 btn btn-light me-2"
          onClick={() => {
            selectFolder();
          }}
        >
          Select Folder
        </button>
        <button
          className="col-3 btn btn-light me-2"
          onClick={() => {
            setMainDirectoryHandle(undefined);
          }}
        >
          Close Folder
        </button>
        <button className="col-1 btn btn-light" onClick={invalidateFileSystem}>
          <i className={'col-1 bi bi-arrow-clockwise'} />
        </button>
      </div>
      <div className="container row pt-3 bg-light rounded h-100 overflow-auto">
        {mainDirectoryHandle !== undefined ? <Folder handle={mainDirectoryHandle}></Folder> : null}
      </div>
    </div>
  );
}
