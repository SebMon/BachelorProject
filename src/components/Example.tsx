import React, { useState } from 'react';

export default function Example(): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <div className="container pt-5">
      <button
        onClick={() => {
          setCount((count) => count + 1);
        }}
        className="btn btn-primary"
      >
        count is {count} <i className="bi bi-emoji-sunglasses"></i>
      </button>
    </div>
  );
}
