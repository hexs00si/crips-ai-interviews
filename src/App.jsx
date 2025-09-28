import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Crisp AI Interviews
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            count is {count}
          </button>
          <p className="mt-4 text-gray-600">
            Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.jsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
