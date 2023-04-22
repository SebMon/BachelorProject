import React, { useContext } from 'react';
import { selectedFileContext } from '../context/SelectedFileContext';

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
      <i className="col-1 bi bi-file-earmark-fill"></i>
      <p className="col">{props.handle.name}</p>
    </div>
  );
}
