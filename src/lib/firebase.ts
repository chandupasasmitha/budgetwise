import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA3iLcMZigjY_fkYiS87RwpjZS3sW2DCUE",
    authDomain: "budgetwise-41m86.firebaseapp.com",
    projectId: "budgetwise-41m86",
    storageBucket: "budgetwise-41m86.firebasestorage.app",
    messagingSenderId: "373648485369",
    appId: "1:373648485369:web:3f0addbc5bac8a898f2b28"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
