import { useState } from "react"

export default function Example() {

  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
      </button>
    </div>
  )
}