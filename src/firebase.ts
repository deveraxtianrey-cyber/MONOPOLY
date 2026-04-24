// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxEvH_r555if7lmBfI4NR0jYt3O-S6yC8",
  authDomain: "monopoly-rey.firebaseapp.com",
  projectId: "monopoly-rey",
  storageBucket: "monopoly-rey.firebasestorage.app",
  messagingSenderId: "856235654226",
  appId: "1:856235654226:web:1acec34b9cdec7e1c0338b",
  measurementId: "G-NQ2067M7H4",
  databaseURL: "https://monopoly-rey-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, analytics, auth, db };
