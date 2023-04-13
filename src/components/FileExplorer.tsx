import React, { useState } from 'react';
import Folder from './Folder';

export default function FileExplorer(): JSX.Element {
  const [mainDirectoryHandle, setMainDirectoryHandle] = useState<FileSystemDirectoryHandle>();

  const selectFolder = (): void => {
    window
      .showDirectoryPicker()
      .then((result) => {
        setMainDirectoryHandle(result);
      })
      .catch(console.error);
  };

  return (
    <div className="container mt-3 pt-2 h-75">
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
          className="col-3 btn btn-light"
          onClick={() => {
            setMainDirectoryHandle(undefined);
          }}
        >
          Close Folder
        </button>
      </div>
      <div className="container row pt-3 bg-light rounded h-100 overflow-auto">
        {mainDirectoryHandle !== undefined ? <Folder handle={mainDirectoryHandle}></Folder> : null}
      </div>
    </div>
  );
}
