// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFWjST9SUTHUdbSX-JGPNJ_NtFVfm4JeE",
  authDomain: "maharashtra-health-care.firebaseapp.com",
  databaseURL: "https://maharashtra-health-care-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "maharashtra-health-care",
  storageBucket: "maharashtra-health-care.firebasestorage.app",
  messagingSenderId: "171883927464",
  appId: "1:171883927464:web:72c4ae9337061cbf1def9d",
  measurementId: "G-BJN2BEZ5KC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export { app, analytics };
