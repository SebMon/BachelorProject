import './App.css'
import init, { fib } from "src-wasm"

// Example for demonstrating using wasm
init().then(() => {
  console.log(fib(20))
})

function App() {

  return (
    <div className="App">
      
    </div>
  )
}

export default App
