
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA3iLcMZigjY_fkYiS87RwpjZS3sW2DCUE",
    authDomain: "budgetwise-41m86.firebaseapp.com",
    projectId: "budgetwise-41m86",
    storageBucket: "budgetwise-41m86.appspot.com",
    messagingSenderId: "373648485369",
    appId: "1:373648485369:web:3f0addbc5bac8a898f2b28"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore only on the client side to avoid connectivity issues.
const db = typeof window !== 'undefined' ? getFirestore(app) : null;


export { app, auth, googleProvider, db };
