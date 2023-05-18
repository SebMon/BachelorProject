import React, { useContext, useEffect, useRef, useState } from 'react';
import { StoredKeysContext } from '../context/StoredKeysContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { StoredKey } from '../persistence/StoredKeys/types';

let didInit = false;

interface KeyMenuProps {
  onImportRequested: () => void;
  onGenerateRequested: () => void;
}

export default function KeyMenu(props: KeyMenuProps): JSX.Element {
  const buttonRowRef = useRef<HTMLDivElement>(null);

  const storedKeys = useContext(StoredKeysContext);

  const keys = useLiveQuery(async () => await storedKeys.getAll());

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

  const calculateKeyListHeight = (): string => {
    if (buttonRowRef === null) {
      return '0';
    }

    const buttonRowHeight = buttonRowRef.current?.offsetHeight;

    if (buttonRowHeight === undefined) {
      return '0';
    }

    return `calc(100% - ${buttonRowHeight}px - 3em)`;
  };

  const keyListHeight = calculateKeyListHeight();

  const onDeletePressed = (key: StoredKey): void => {
    if (confirm(`Are you sure your want to delete "${key.name}"`)) {
      storedKeys.remove(key).catch((e) => {
        console.error('failed to remove the key');
        console.error(e);
      });
    }
  };

  return (
    <div className="h-100 container mb-5">
      <div className="d-flex justify-content-between flex-row flex-wrap mb-3" ref={buttonRowRef}>
        <button className="btn btn-light mt-2 mx-1 px-5" onClick={props.onImportRequested}>
          Import Key
        </button>
        <button className="btn btn-light mt-2 mx-1 px-5" onClick={props.onGenerateRequested}>
          Generate Key
        </button>
      </div>

      <div className="row" style={{ height: keyListHeight }}>
        <div className="container pt-3 bg-light mb-5 rounded overflow-auto h-100">
          {keys?.map((key, index) => {
            return (
              <div key={index} className="row d-flex flex-row">
                <div
                  data-testid="delete-button"
                  className="col-2 btn d-flex"
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={() => {
                    onDeletePressed(key);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                  </svg>
                </div>

                <div className="col-10 pt-1">
                  <p>{key.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
