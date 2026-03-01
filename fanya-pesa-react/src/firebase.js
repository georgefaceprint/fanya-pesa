import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCmoiuwbDodIELIj-TptuEYlIJbVSAKkuQ",
    authDomain: "fanya-pesa.firebaseapp.com",
    projectId: "fanya-pesa",
    storageBucket: "fanya-pesa.firebasestorage.app",
    messagingSenderId: "719005341578",
    appId: "1:719005341578:web:da45b21b454c52a7671a73",
    measurementId: "G-KXN6S8DXB9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
