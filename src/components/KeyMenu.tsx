import React from 'react';

interface KeyMenuProps {
  onGenerateRequested: () => void;
}

export default function KeyMenu(props: KeyMenuProps): JSX.Element {
  return (
    <div className="h-100 container mb-5">
      <div className="row">
        <button className="btn btn-light mt-2 mb-2 px-5" onClick={props.onGenerateRequested}>
          Generate Key
        </button>
      </div>
      <div className="row h-100">
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
