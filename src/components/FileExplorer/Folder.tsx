import React, { useContext, useEffect, useState } from 'react';
import File from './File';
import { selectedFileContext } from '../../context/SelectedFileContext';

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
        <div
          role="button"
          className="d-flex col-1 mt-1 px-0"
          aria-label="expand-button"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {
            // eslint-disable-next-line multiline-ternary
            expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </svg>
            )
          }
        </div>
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
