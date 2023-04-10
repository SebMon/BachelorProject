import React from 'react';

interface FileProps {
  handle: FileSystemFileHandle;
}

export default function Folder(props: FileProps): JSX.Element {
  return <p>{props.handle.name}</p>;
}
