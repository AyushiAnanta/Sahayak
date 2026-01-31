import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
import { useEffect } from 'react'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    axios.get('')
  })

  return (
    <div>
      <h1>Ye div ke ander likha hua hai</h1>
    </div>
  )
}

export default App
