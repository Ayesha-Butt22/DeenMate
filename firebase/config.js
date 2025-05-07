// firebase/config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDeo_XjqZ93ex0Vf4mEI8DhKRN43MNBy4A",
  authDomain: "deenmate-6cb98.firebaseapp.com",
  databaseURL: "https://deenmate-6cb98-default-rtdb.firebaseio.com",
  projectId: "deenmate-6cb98",
  storageBucket: "deenmate-6cb98.appspot.com",
  messagingSenderId: "839318889174",
  appId: "1:839318889174:web:381ea77a9dc87774bbdf77",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth + Firestore Initialization
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);

export { auth, db };
