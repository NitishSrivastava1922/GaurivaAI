// Import the functions you need from the SDKs you need
import { initializeApp} from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-82b47.firebaseapp.com",
  projectId: "cortexai-82b47",
  storageBucket: "cortexai-82b47.firebasestorage.app",
  messagingSenderId: "461692041290",
  appId: "1:461692041290:web:f37f7ea9f0ea55ebef4eb3",
  measurementId: "G-NL9KV5VGDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();