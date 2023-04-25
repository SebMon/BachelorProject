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
          <i className={'col-1 bi bi-arrow-clockwise'} />
        </button>
      </div>
      <div className="container pt-3 bg-light rounded overflow-auto" style={{ height: fileSystemHeight }}>
        {mainDirectoryHandle !== undefined ? <Folder handle={mainDirectoryHandle}></Folder> : null}
      </div>
    </div>
  );
}
