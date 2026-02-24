import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
    try {
        const docRef = doc(db, 'falla/merello2026');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("SUCCESS: Document exists!");
            console.log("Config/Categories:", data.appConfig?.stockCategories?.length || 0);
            console.log("Stock Items:", data.stock?.length || 0);
            console.log("Members:", data.members?.length || 0);
            process.exit(0);
        } else {
            console.log("EMPTY: Document does not exist yet.");
            process.exit(1);
        }
    } catch (e) {
        console.error("ERROR:", e);
        process.exit(1);
    }
}

checkData();
