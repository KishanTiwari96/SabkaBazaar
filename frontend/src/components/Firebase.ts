// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArSvQ3ns4ptbZUYRvsZTfiesEzzgOwSe4",
  authDomain: "e-commerce-a53a8.firebaseapp.com",
  projectId: "e-commerce-a53a8",
  storageBucket: "e-commerce-a53a8.firebasestorage.app",
  messagingSenderId: "583234193017",
  appId: "1:583234193017:web:eac86c828cb1f7dc7376a8",
  measurementId: "G-LBC5KHB0YL"
};

// Initialize Firebase
console.log("Initializing Firebase with config:", { 
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider to request email and profile scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Configure Google provider to select account
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app