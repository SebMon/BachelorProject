import React, { useState } from 'react';
import Folder from './Folder';
import File from './File';

export default function FileExplorer(): JSX.Element {
  const [mainDirectoryHandle, setMainDirectoryHandle] = useState<FileSystemDirectoryHandle>();
  const [subFolders, setSubfolders] = useState<FileSystemDirectoryHandle[]>();
  const [files, setFiles] = useState<FileSystemFileHandle[]>();

  const selectFolder = (): void => {
    const newSubFolders: FileSystemDirectoryHandle[] = [];
    const newFiles: FileSystemFileHandle[] = [];
    window
      .showDirectoryPicker()
      .then(async (result) => {
        setMainDirectoryHandle(result);
        for await (const [_name, value] of result.entries()) {
          if (value.kind === 'directory') {
            newSubFolders.push(value);
          } else if (value.kind === 'file') {
            newFiles.push(value);
          }
        }
        setSubfolders(newSubFolders);
        setFiles(newFiles);
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
      <ul className="list-group">
        {subFolders?.map((directoryHandle) => (
          <li className="list-group-item" key={directoryHandle.name}>
            <Folder handle={directoryHandle}></Folder>
          </li>
        ))}
        {files?.map((fileHandle) => (
          <li className="list-group-item" key={fileHandle.name}>
            <File handle={fileHandle}></File>
          </li>
        ))}
      </ul>
    </div>
  );
}
