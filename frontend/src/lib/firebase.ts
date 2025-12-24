import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDugNhiwn4GwDplSvZe5eo9Zxfexujlm-8",
  authDomain: "nomotix-mech.firebaseapp.com",
  projectId: "nomotix-mech",
  storageBucket: "nomotix-mech.firebasestorage.app",
  messagingSenderId: "743800286350",
  appId: "1:743800286350:android:0a11efbc748dda7d6f2ddf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
