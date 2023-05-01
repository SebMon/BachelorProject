import React, { useContext } from 'react';
import { selectedFileContext } from '../../context/SelectedFileContext';

interface FileProps {
  handle: FileSystemFileHandle;
  parent: FileSystemDirectoryHandle | undefined;
}

export default function File(props: FileProps): JSX.Element {
  const { selectedFile, setSelectedFile, setSelectedFilesParentFolder } = useContext(selectedFileContext);

  return (
    <div
      className={`row ${selectedFile === props.handle ? 'border-primary text-primary' : ''}`}
      role="button"
      onClick={() => {
        if (selectedFile !== props.handle) {
          setSelectedFile(props.handle);
          setSelectedFilesParentFolder(props.parent);
        } else {
          setSelectedFile(undefined);
          setSelectedFilesParentFolder(undefined);
        }
      }}
    >
      <div className="d-flex col-1 mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z" />
        </svg>
      </div>
      <p className="col">{props.handle.name}</p>
    </div>
  );
}
