import React from 'react';

interface FileMenuProps {
  fileName: string | undefined;
  onEncryptionRequested: () => void;
  onDecryptionRequested: () => void;
}

export default function FileMenu(props: FileMenuProps): JSX.Element {
  return (
    <div className="h-100">
      <div className="row">
        <p className="text-white text-center">{props.fileName ?? 'Select a file...'}</p>
      </div>
      <div className="row d-flex justify-content-around">
        <button
          className="col-3 btn btn-light me-2"
          onClick={props.onEncryptionRequested}
          disabled={props.fileName === undefined}
        >
          Encrypt
        </button>
        <button
          className="col-3 btn btn-light"
          onClick={props.onDecryptionRequested}
          disabled={props.fileName === undefined}
        >
          Decrypt
        </button>
      </div>
    </div>
  );
}
