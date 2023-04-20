import React, { useContext } from 'react';
import { selectedFileContext } from '../context/SelectedFileContext';

interface FileProps {
  handle: FileSystemFileHandle;
}

export default function File(props: FileProps): JSX.Element {
  const { selectedFile, setSelectedFile } = useContext(selectedFileContext);

  return (
    <div
      className={`row ${selectedFile === props.handle ? 'border-primary text-primary' : ''}`}
      role="button"
      onClick={() => {
        if (selectedFile !== props.handle) {
          setSelectedFile(props.handle);
        } else {
          setSelectedFile(undefined);
        }
      }}
    >
      <i className="col-1 bi bi-file-earmark-fill"></i>
      <p className="col">{props.handle.name}</p>
    </div>
  );
}
