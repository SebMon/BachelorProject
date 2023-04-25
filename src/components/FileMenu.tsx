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
      <div className="d-flex justify-content-around flex-row flex-wrap">
        <button
          className="btn btn-light mt-2 mx-1 px-5"
          onClick={props.onEncryptionRequested}
          disabled={props.fileName === undefined}
        >
          Encrypt
        </button>
        <button
          className="btn btn-light mt-2 mx-1 px-5"
          onClick={props.onDecryptionRequested}
          disabled={props.fileName === undefined}
        >
          Decrypt
        </button>
      </div>
    </div>
  );
}
