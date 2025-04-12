// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
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
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export default app