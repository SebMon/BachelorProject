import React, { useContext, useEffect, useRef, useState } from 'react';
import Folder from './Folder';
import { selectedFileContext } from '../context/SelectedFileContext';

let didInit = false;

export default function FileExplorer(): JSX.Element {
  const [mainDirectoryHandle, setMainDirectoryHandle] = useState<FileSystemDirectoryHandle>();
  const { fileSystemInvalidated, setFileSystemInvalidated } = useContext(selectedFileContext);

  const invalidateFileSystem = (): void => {
    setFileSystemInvalidated(fileSystemInvalidated + 1);
  };

  const selectFolder = (): void => {
    window
      .showDirectoryPicker()
      .then((result) => {
        setMainDirectoryHandle(result);
      })
      .catch(console.error);
  };

  const buttonRowRef = useRef<HTMLDivElement>(null);

  // This useState and useEffect is just a small but ugly wait to get react to recalculate the filesystemheight after having rendered
  const [windowSize, setScreenSize] = useState(0);
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      setScreenSize(windowSize - 1);
    }
  }, []);

  window.addEventListener('resize', () => {
    setScreenSize(window.innerWidth);
  });

  const calculateFileSystemHeight = (): string => {
    if (buttonRowRef === null) {
      return '0';
    }

    const buttonRowHeight = buttonRowRef.current?.offsetHeight;

    if (buttonRowHeight === undefined) {
      return '0';
    }

    return `calc(100% - ${buttonRowHeight}px - 3em)`;
  };

  const fileSystemHeight = calculateFileSystemHeight();

  return (
    <div className="container h-100">
      <div
        className="container mb-2 ps-0 align-self-start d-flex justify-content-start flex-row flex-wrap"
        ref={buttonRowRef}
      >
        <button
          className="btn btn-light mt-2 me-2"
          onClick={() => {
            selectFolder();
          }}
        >
          Select Folder
        </button>
        <button
          className="btn btn-light mt-2 me-2"
          onClick={() => {
            setMainDirectoryHandle(undefined);
          }}
        >
          Close Folder
        </button>
        <button className="btn btn-light mt-2 me-2" onClick={invalidateFileSystem}>
          <div className="d-flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
            </svg>
          </div>
        </button>
      </div>
      <div className="container pt-3 bg-light rounded overflow-auto" style={{ height: fileSystemHeight }}>
        {mainDirectoryHandle !== undefined ? <Folder handle={mainDirectoryHandle}></Folder> : null}
      </div>
    </div>
  );
}
