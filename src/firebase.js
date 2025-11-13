import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYWRik370v1NnA7wqZpQ6Vh6EdHzuuBwA",
  authDomain: "milbridge-app.firebaseapp.com",
  projectId: "milbridge-app",
  storageBucket: "milbridge-app.firebasestorage.app",
  messagingSenderId: "514807246942",
  appId: "1:514807246942:web:e6c3a2d40e5a8508dac4cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
