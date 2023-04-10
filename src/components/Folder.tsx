import React, { useEffect, useState } from 'react';
import File from './File';

interface FolderProps {
  handle: FileSystemDirectoryHandle;
}

export default function Folder(props: FolderProps): JSX.Element {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>();
  const [subFolders, setSubfolders] = useState<FileSystemDirectoryHandle[]>();
  const [files, setFiles] = useState<FileSystemFileHandle[]>();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDirectoryHandle(props.handle);
    const newSubFolders: FileSystemDirectoryHandle[] = [];
    const newFiles: FileSystemFileHandle[] = [];

    const fetchData = async (): Promise<void> => {
      if (directoryHandle === undefined) return;
      for await (const [_name, value] of directoryHandle.entries()) {
        if (value.kind === 'directory') {
          newSubFolders.push(value);
        } else if (value.kind === 'file') {
          newFiles.push(value);
        }
      }
      setSubfolders(newSubFolders);
      setFiles(newFiles);
    };

    fetchData().catch(console.error);
  }, [directoryHandle]);

  return (
    <div>
      <p>{directoryHandle?.name}</p>
      <button
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        Expand
      </button>
      {expanded && (
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
      )}
    </div>
  );
}
