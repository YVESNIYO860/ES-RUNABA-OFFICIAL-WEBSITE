import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, query, getDocs, setDoc, doc, serverTimestamp, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if the config is valid
let app;
let auth;
let db;
let googleProvider;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

const saveFirestoreDocument = async (collectionName, data, docIdOverride) => {
  if (!db) return null;

  const id = docIdOverride || data?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    ...data,
    id,
    createdAt: data?.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, collectionName, id), payload);
  return payload;
};

const loadFirestoreCollection = async (collectionName, filters = []) => {
  if (!db) return [];

  const baseQuery = collection(db, collectionName);
  const resolvedQuery = filters.length ? query(baseQuery, ...filters) : baseQuery;
  const snapshot = await getDocs(resolvedQuery);

  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

const whereEqual = (field, value) => where(field, "==", value);

export { auth, db, googleProvider, signInWithPopup, saveFirestoreDocument, loadFirestoreCollection, whereEqual };
