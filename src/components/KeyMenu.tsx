import React, { useEffect, useRef, useState } from 'react';

let didInit = false;

interface KeyMenuProps {
  onGenerateRequested: () => void;
}

export default function KeyMenu(props: KeyMenuProps): JSX.Element {
  const buttonRowRef = useRef<HTMLDivElement>(null);

  // This useState and useEffect is just a small but ugly wait to get react to recalculate the filesystemheight after having rendered
  const [windowSize, setScreenSize] = useState(0);
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      setScreenSize(windowSize - 1);
    }
  }, []);

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
      <div className="row" ref={buttonRowRef}>
        <button className="btn btn-light mt-2 mb-2 px-5" onClick={props.onGenerateRequested}>
          Generate Key
        </button>
      </div>
      <div className="row" style={{ height: keyListHeight }}>
        <div className="container pt-3 bg-light mb-5 rounded overflow-auto h-100">
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
          <div className="row">
            <p>Test</p>
          </div>
        </div>
      </div>
    </div>
  );
}
