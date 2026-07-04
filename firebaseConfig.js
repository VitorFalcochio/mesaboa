import { initializeApp, getApps } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

export const firebaseReady = Object.values(firebaseConfig).every(Boolean);

const app = firebaseReady ? (getApps()[0] || initializeApp(firebaseConfig)) : null;
export const db = app ? getFirestore(app) : null;

function cleanData(item) {
  return Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined));
}

export async function fetchRestaurantsFromDb() {
  if (!db) return null;
  const snapshot = await getDocs(query(collection(db, 'restaurants'), orderBy('rating', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function seedRestaurantsIfEmpty(items) {
  if (!db) return;
  const snapshot = await getDocs(collection(db, 'restaurants'));
  if (!snapshot.empty) return;

  const batch = writeBatch(db);
  items.forEach((item) => {
    batch.set(doc(db, 'restaurants', String(item.id)), {
      ...cleanData(item),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
  await batch.commit();
}

export async function saveRestaurantToDb(item) {
  if (!db) return;
  await setDoc(doc(db, 'restaurants', String(item.id)), {
    ...cleanData(item),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function fetchFavoritesFromDb(userId) {
  if (!db || !userId) return null;
  const snapshot = await getDoc(doc(db, 'userFavorites', String(userId)));
  return snapshot.exists() ? snapshot.data().items || [] : [];
}

export async function saveFavoritesToDb(userId, items) {
  if (!db || !userId) return;
  await setDoc(doc(db, 'userFavorites', String(userId)), {
    items,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveUserProfileToDb(user) {
  if (!db || !user?.id) return;
  await setDoc(doc(db, 'users', String(user.id)), {
    id: user.id,
    name: user.name,
    email: user.email,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
