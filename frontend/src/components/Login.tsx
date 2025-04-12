import { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { AppBar } from './AppBar';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/login`, { email, password });

      const { token, user } = res.data;

      if (token && user) {
        localStorage.setItem('authToken', token);
        setUser(user); // Set user in context
        alert('Login successful!');
        navigate('/');
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed');
    }
  };

  return (
    <div>
      <AppBar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Log In
          </button>
          <p className="mt-4 text-sm text-center text-gray-500">
            Don't have an account? <a href="/signup" className="text-indigo-600 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};