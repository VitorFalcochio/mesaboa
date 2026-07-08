import { initializeApp, getApps } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
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
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => !item.status || item.status === 'published');
}

export async function fetchOwnerRestaurantsFromDb(ownerId) {
  if (!db || !ownerId) return null;
  const snapshot = await getDocs(query(collection(db, 'restaurants'), where('ownerId', '==', String(ownerId))));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function fetchPendingRestaurantsFromDb() {
  if (!db) return null;
  const snapshot = await getDocs(query(collection(db, 'restaurants'), where('status', '==', 'pending')));
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
      status: item.status || 'published',
      ownerId: item.ownerId || 'seed',
      metrics: item.metrics || { views: 0, mapsClicks: 0, whatsappClicks: 0, reservationClicks: 0 },
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

export async function createRestaurantInDb(item) {
  if (!db) return;
  await setDoc(doc(db, 'restaurants', String(item.id)), {
    ...cleanData(item),
    status: item.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp()
  }, { merge: true });
}

export async function updateRestaurantInDb(id, updates) {
  if (!db || !id) return;
  await setDoc(doc(db, 'restaurants', String(id)), {
    ...cleanData(updates),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function updateRestaurantStatusInDb(id, status, reviewerId) {
  if (!db || !id) return;
  await setDoc(doc(db, 'restaurants', String(id)), {
    status,
    reviewedBy: reviewerId || null,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function claimRestaurantInDb(id, user) {
  if (!db || !id || !user?.id) return;
  await setDoc(doc(db, 'restaurants', String(id)), {
    claim: {
      status: 'pending',
      userId: user.id,
      name: user.name,
      email: user.email,
      requestedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function recordRestaurantMetricInDb(id, metric) {
  if (!db || !id || !metric) return;
  await updateDoc(doc(db, 'restaurants', String(id)), {
    [`metrics.${metric}`]: increment(1),
    updatedAt: serverTimestamp()
  });
}

export async function fetchReviewsFromDb(restaurantId) {
  if (!db || !restaurantId) return null;
  const snapshot = await getDocs(query(collection(db, 'restaurantReviews'), where('restaurantId', '==', String(restaurantId))));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => Number(b.pinned || false) - Number(a.pinned || false) || Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
}

export async function saveReviewToDb(review) {
  if (!db || !review?.id) return;
  await setDoc(doc(db, 'restaurantReviews', String(review.id)), {
    ...cleanData(review),
    updatedAt: serverTimestamp(),
    createdAt: review.createdAt || serverTimestamp()
  }, { merge: true });
}

export async function updateReviewInDb(id, updates) {
  if (!db || !id) return;
  await setDoc(doc(db, 'restaurantReviews', String(id)), {
    ...cleanData(updates),
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
    gamification: user.gamification || null,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
