import { useState, useEffect } from "react"
import api from "../services/api"

const DebugEndpoints = () => {
  const [results, setResults] = useState({})

  const checkEndpoint = async (name, url) => {
    try {
      const response = await api.get(url)
      setResults(prev => ({ ...prev, [name]: { success: true, data: response.data } }))
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { success: false, error: error.response?.status, message: error.message } }))
    }
  }

  useEffect(() => {
    checkEndpoint('Users List', '/users/')
    checkEndpoint('Current User', '/users/me/')
    checkEndpoint('User Detail (id=1)', '/users/1/')
  }, [])

  return (
    <div className="container-custom py-12">
      <h1 className="text-2xl font-bold mb-4">API Endpoint Debug</h1>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  )
}

export default DebugEndpoints
