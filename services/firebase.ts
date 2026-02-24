import { initializeApp } from "firebase/app";
import {
    getFirestore,
    enableIndexedDbPersistence,
    collection,
    doc,
    setDoc,
    onSnapshot,
    getDoc
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Habilitar persistencia offline para que la app siga funcionando sin cobertura
enableIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistencia Firestore: Múltiples pestañas abiertas, modo offline solo activo en una.');
        } else if (err.code == 'unimplemented') {
            console.warn('Persistencia Firestore: El navegador no soporta IndexedDB.');
        }
    });

export { db, doc, setDoc, onSnapshot, getDoc, collection };
