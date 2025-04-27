import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { useUser } from './UserContext'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from './Firebase'
import { useEffect } from 'react'

const SigninWithGoogle = () => {
  const { setUser } = useUser()
  const navigate = useNavigate()

  // Handle redirect result when returning from Google authentication
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google redirect sign-in successful');
          
          // Extract user info from Google response
          const googleUser = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || '',
            photoURL: result.user.photoURL,
            emailVerified: result.user.emailVerified
          }
          
          console.log('Google user data:', googleUser)
          
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
          
          // Store token in localStorage
          localStorage.setItem('authToken', res.data.token)
          
          // Store user data in context with complete profile picture URL
          setUser(res.data.user)
          
          alert('Logged in with Google successfully!')
          navigate('/')
        }
      } catch (err) {
        console.error('Google redirect sign-in failed:', err)
      }
    };

    handleRedirectResult();
  }, [navigate, setUser]);

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google sign-in process...')
      
      // Detect if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Use redirect for mobile devices
        await signInWithRedirect(auth, googleProvider);
        // The rest will be handled in the useEffect when redirect completes
      } else {
        // Use popup for desktop
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
        
        // Store token in localStorage
        localStorage.setItem('authToken', res.data.token)
        
        // Store user data in context with complete profile picture URL
        setUser(res.data.user)
        
        alert('Logged in with Google successfully!')
        navigate('/')
      }
    } catch (err) {
      console.error('Google login failed:', err)
      if (axios.isAxiosError(err)) {
        console.error('API error details:', err.response?.data)
      }
      alert('Login failed: ' + (axios.isAxiosError(err) ? err.response?.data?.error || err.message : String(err)))
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
      </svg>
      Sign in with Google
    </button>
  )
}

export default SigninWithGoogle
