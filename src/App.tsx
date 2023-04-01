import './App.css'
import init, { fib } from "src-wasm"
import Example from './components/Example'

// Example for demonstrating using wasm
init().then(() => {
  console.log(fib(20))
})

function App() {

  return (
    <div className="App">
      <Example></Example> 
    </div>
  )
}

export default App
