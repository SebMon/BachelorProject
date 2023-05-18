import React, { useContext, useEffect, useRef, useState } from 'react';
import { StoredKeysContext } from '../../context/StoredKeysContext';
import { useLiveQuery } from 'dexie-react-hooks';
import KeyMenuItem from './KeyMenuItem';

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
            return <KeyMenuItem key={index} keyObject={key} />;
          })}
        </div>
      </div>
    </div>
  );
}
