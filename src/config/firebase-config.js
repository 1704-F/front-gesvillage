// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "@firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNx_OO2w3Z9V5pdQWqXhoFLuvR5H7VtTs",
  authDomain: "gesvillage-bbbed.firebaseapp.com",
  projectId: "gesvillage-bbbed",
  storageBucket: "gesvillage-bbbed.firebasestorage.app",
  messagingSenderId: "142891582469",
  appId: "1:142891582469:web:7bbb43fff522d1509c886c",
  measurementId: "G-37XS5BQ19S"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export default firebaseConfig;