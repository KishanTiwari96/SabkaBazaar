import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import { BACKEND_URL } from '../config'
import { useUser } from './UserContext'
import { useNavigate } from 'react-router-dom'
import { auth } from './Firebase'

const SigninWithGoogle = () => {
  const { setUser } = useUser()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const res = await axios.post(
        `${BACKEND_URL}/firebase-login`,
        { firebaseToken: idToken },
        { withCredentials: true }
      )

      setUser(res.data.user)
      alert('Logged in with Google successfully!')
      navigate('/')
    } catch (err) {
      console.error('Google login failed:', err)
      alert('Login failed')
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
    >
      Sign in with Google
    </button>
  )
}

export default SigninWithGoogle
