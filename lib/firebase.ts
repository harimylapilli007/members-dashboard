import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi_ggLb420-8dO6oltPv8u681sOCvZzpo",
  authDomain: "ridhira-group.firebaseapp.com",
  projectId: "ridhira-group",
  storageBucket: "ridhira-group.firebasestorage.app",
  messagingSenderId: "329699939116",
  appId: "1:329699939116:web:10e15f73ee2dd999325289",
  measurementId: "G-HXWN8N1M64"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 