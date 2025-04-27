import { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { BACKEND_URL } from '../config';
import { AppBar } from './AppBar';
import { useUser } from './UserContext';
import { useNavigate, Link } from 'react-router-dom';
import SigninWithGoogle from './SigninWithGoogle';
import { showNotification } from './Notification';

export const Login = () => {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${BACKEND_URL}/login`, { email, password });
      const { token, user } = res.data;

      if (token && user) {
        localStorage.setItem('authToken', token);
        setUser(user);
        showNotification({
          message: 'Login successful! Welcome back.',
          type: 'success'
        });
        navigate('/');
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
      const axiosError = err as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Invalid email or password';
      setError(errorMessage);
      showNotification({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700">
      <AppBar />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full overflow-hidden rounded-3xl shadow-2xl bg-white">

          {/* Left side - Form */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back</h2>
                <p className="text-gray-600">Please sign in to your account</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <SigninWithGoogle />
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Right side - Image and info */}
          <div className="hidden md:block relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571178588476-7605bae33240?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80')] opacity-20 bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 to-purple-900/70"></div>
            <div className="relative h-full flex flex-col justify-center p-12">
              <div className="text-white">
                <h3 className="text-4xl font-bold mb-6">Shop with Sabka Bazaar</h3>
                <p className="text-indigo-200 mb-8 text-lg">Experience the best online grocery shopping platform with our wide range of products and convenient delivery options.</p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-indigo-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-indigo-100">Fast delivery to your doorstep</p>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-indigo-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-indigo-100">Wide range of high-quality products</p>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-indigo-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-indigo-100">Exclusive deals for registered users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};