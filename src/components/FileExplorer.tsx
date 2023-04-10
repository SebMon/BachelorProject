import React, { useState } from 'react';

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
      .catch((e) => {
        console.log(e);
      });
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
      <ul>
        {subFolders?.map((directoryHandle) => (
          <li key={directoryHandle.name}>Folder {directoryHandle.name}</li>
        ))}
        {files?.map((fileHandle) => (
          <li key={fileHandle.name}>File {fileHandle.name}</li>
        ))}
      </ul>
    </div>
  );
}
