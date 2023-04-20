import React from 'react';

interface FileProps {
  handle: FileSystemFileHandle;
}

export default function Folder(props: FileProps): JSX.Element {
  return (
    <div className="row">
      <i className="col-1 bi bi-file-earmark-fill"></i>
      <p className="col">{props.handle.name}</p>
    </div>
  );
}
