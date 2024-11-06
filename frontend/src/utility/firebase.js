// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAiSqqPFFkqLN6A-gnlTdXg_9raR8Kqo7s",
  authDomain: "serverless-439419.firebaseapp.com",
  projectId: "serverless-439419",
  storageBucket: "serverless-439419.appspot.com",
  messagingSenderId: "904524447215",
  appId: "1:904524447215:web:56b168372421a2f51b4a1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app,"chat-data");

export { db };
