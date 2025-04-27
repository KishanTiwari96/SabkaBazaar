import { signInWithPopup, browserLocalPersistence, setPersistence } from 'firebase/auth'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { useUser } from './UserContext'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from './Firebase'
import { useState } from 'react'
import { showNotification } from './Notification'

const SigninWithGoogle = () => {
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      console.log('Starting Google sign-in process...')
      
      // Set persistence to LOCAL for better compatibility
      await setPersistence(auth, browserLocalPersistence)
      
      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      })
      
      // Use popup for all devices (more reliable than redirect for mobile)
      const result = await signInWithPopup(auth, googleProvider)
      console.log('Google sign-in successful')
      
      // Extract user info from Google response
      const googleUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified
      }
      
      console.log('Google user data:', googleUser)
      
      try {
        const res = await axios.post(
          `${BACKEND_URL}/firebase-login`,
          { googleUser },
          { withCredentials: true }
        )

        console.log('Backend response:', res.data)
        
        // Ensure the profile picture URL is properly set in the user data
        if (res.data.user && !res.data.user.profilePicture && googleUser.photoURL) {
          res.data.user.profilePicture = googleUser.photoURL
        }
        
        // Store token in localStorage for persistence
        localStorage.setItem('authToken', res.data.token)
        
        // Store user data in context
        setUser(res.data.user)
        
        // Navigate after a short delay to ensure state updates complete
        setTimeout(() => {
          showNotification({
            message: 'Logged in with Google successfully!',
            type: 'success'
          })
          navigate('/')
        }, 500)
      } catch (backendErr) {
        console.error('Backend API error:', backendErr)
        showNotification({
          message: 'Login failed: Server error processing Google login',
          type: 'error'
        })
      }
    } catch (err) {
      console.error('Google login failed:', err)
      
      // Handle Firebase auth errors
      let errorMessage = 'Login failed. Please try again.'
      
      if (err instanceof Error) {
        // Check for specific Firebase errors
        if (err.message.includes('auth/popup-closed-by-user')) {
          errorMessage = 'Login cancelled. Please try again.'
        } else if (err.message.includes('auth/popup-blocked')) {
          errorMessage = 'Popup was blocked. Please allow popups for this site and try again.'
        } else if (err.message.includes('auth/unauthorized-domain')) {
          errorMessage = 'Authentication error: This domain is not authorized for login.'
        } else {
          errorMessage = `Login error: ${err.message}`
        }
      }
      
      showNotification({
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full mt-4 ${isLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white py-2 rounded-lg transition flex items-center justify-center gap-2`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Sign in with Google
        </>
      )}
    </button>
  )
}

export default SigninWithGoogle