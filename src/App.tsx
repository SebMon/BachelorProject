import React from 'react';
import './App.css';
import init, { fib } from 'src-wasm';
import Example from './components/Example';

// Example for demonstrating using wasm
init()
  .then(() => {
    console.log(fib(20));
  })
  .catch((e) => {
    console.error(e);
  });

function App(): JSX.Element {
  return (
    <div className="App">
      <Example></Example>
    </div>
  );
}

export default App;
