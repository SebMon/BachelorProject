import React, { useContext, useEffect, useState } from 'react';
import File from './File';
import { selectedFileContext } from '../context/SelectedFileContext';

interface FolderProps {
  handle: FileSystemDirectoryHandle;
}

export default function Folder(props: FolderProps): JSX.Element {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>();
  const [subFolders, setSubfolders] = useState<FileSystemDirectoryHandle[]>();
  const [files, setFiles] = useState<FileSystemFileHandle[]>();
  const [expanded, setExpanded] = useState(false);
  const { fileSystemInvalidated } = useContext(selectedFileContext);

  useEffect(() => {
    setDirectoryHandle(props.handle);
    const newSubFolders: FileSystemDirectoryHandle[] = [];
    const newFiles: FileSystemFileHandle[] = [];

    const fetchData = async (): Promise<void> => {
      if (directoryHandle === undefined) return;
      for await (const value of directoryHandle.values()) {
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
  }, [directoryHandle, fileSystemInvalidated]);

  return (
    <div className="container">
      <div className="row">
        <i
          role="button"
          className={`col-1 bi bi-chevron-${expanded ? 'down' : 'right'}`}
          onClick={() => {
            setExpanded(!expanded);
          }}
        ></i>
        <p className="col">{directoryHandle?.name}</p>
      </div>

      {expanded && (
        <div>
          {subFolders
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((directoryHandle) => (
              <div className="row ms-2" key={directoryHandle.name}>
                <Folder handle={directoryHandle}></Folder>
              </div>
            ))}
          {files
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map((fileHandle) => (
              <div className="row ms-2" key={fileHandle.name}>
                <File handle={fileHandle} parent={directoryHandle}></File>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
