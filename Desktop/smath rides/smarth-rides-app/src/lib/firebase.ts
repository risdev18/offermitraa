import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { initializeFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBxzz7cNapozDrO-wlyodwD5lwi6lU9kIU",
    authDomain: "smarth-ride-c146e.firebaseapp.com",
    projectId: "smarth-ride-c146e",
    storageBucket: "smarth-ride-c146e.firebasestorage.app",
    messagingSenderId: "221137767728",
    appId: "1:221137767728:web:39a2a5c518d981a81e8cf5",
    measurementId: "G-5GCBQ8PJBY"
};

// Initialize Firebase
console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
console.log("Firestore and Storage initialized.");
