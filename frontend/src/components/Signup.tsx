import { useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { AppBar } from './AppBar'
import { useUser } from './UserContext'
import { useNavigate } from 'react-router-dom'

export const Signup = () => {
  const { setUser } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSignup = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/signup`,
        {name, email, password },
        { withCredentials: true }
      )
      alert('Signup successful!')
      navigate('/')
      setUser(res.data.user);
    } catch (err) {
      console.error('Signup failed:', err)
      alert('Signup failed')
    }
  }

  return (<div>
    <AppBar></AppBar>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-500 to-indigo-500">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
        <input
          type="name"
          placeholder="Full Name"
          className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSignup}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300"
        >
          Sign Up
        </button>
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account? <a href="/login" className="text-purple-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  </div>
    
  )
}
