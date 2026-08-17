import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvDfe9-T5z4pgpbeAbAbQNxffQFhL9Eow",
  authDomain: "suara-hati-d9e20.firebaseapp.com",
  projectId: "suara-hati-d9e20",
  storageBucket: "suara-hati-d9e20.firebasestorage.app",
  messagingSenderId: "305545415245",
  appId: "1:305545415245:web:cd49740e62f0012687aa04"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);