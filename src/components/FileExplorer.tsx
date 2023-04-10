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
    <div className="container pt-5">
      <button
        onClick={() => {
          selectFolder();
        }}
      >
        Select Folder
      </button>
      <button>Close Folder</button>
      <h2>{mainDirectoryHandle?.name}</h2>
      {mainDirectoryHandle !== undefined && (
        <ul className="list-group">
          <li className="list-group-item" key={mainDirectoryHandle?.name}>
            <Folder handle={mainDirectoryHandle}></Folder>
          </li>
        </ul>
      )}
    </div>
  );
}
