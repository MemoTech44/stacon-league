// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEPt8LTIT3txQ1sUIDKbPx_-CNcoG0OSo",
  authDomain: "stacon-league.firebaseapp.com",
  projectId: "stacon-league",
  storageBucket: "stacon-league.firebasestorage.app",
  messagingSenderId: "908546994360",
  appId: "1:908546994360:web:17921c4ab49ba9f60ec44d",
  measurementId: "G-8F4G70C9D3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };