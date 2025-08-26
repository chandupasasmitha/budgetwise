import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    projectId: "budgetwise-41m86",
    appId: "1:373648485369:web:3f0addbc5bac8a898f2b28",
    storageBucket: "budgetwise-41m86.firebasestorage.app",
    apiKey: "AIzaSyA3iLcMZigjY_fkYiS87RwpjZS3sW2DCUE",
    authDomain: "budgetwise-41m86.firebaseapp.com",
    messagingSenderId: "373648485369"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
