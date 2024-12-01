// firebase.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: "AIzaSyAiSqqPFFkqLN6A-gnlTdXg_9raR8Kqo7s",
	authDomain: "serverless-439419.firebaseapp.com",
	projectId: "serverless-439419",
	storageBucket: "serverless-439419.appspot.com",
	messagingSenderId: "904524447215",
	appId: "1:904524447215:web:56b168372421a2f51b4a1a",
};

const app = initializeApp(firebaseConfig);
export { app }
// const db = getFirestore(app,"chat-data");

// export { db };
