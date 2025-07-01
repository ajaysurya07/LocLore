// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB27u3iIqMmgL_gj8VW9DP4oTxSxs9KBqs",
  authDomain: "loclore-d5479.firebaseapp.com",
  databaseURL: "https://loclore-d5479-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "loclore-d5479",
  storageBucket: "loclore-d5479.firebasestorage.app",
  messagingSenderId: "897053740657",
  appId: "1:897053740657:web:1d1d5aaf483af2eccbd5d0",
  measurementId: "G-RJDRT8HNJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getDatabase(app);