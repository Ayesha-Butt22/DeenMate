import { getDatabase, ref, set, get, update } from "firebase/database";
import { getApp } from "firebase/app";

const app = getApp();
const db = getDatabase(app);

// Save prayer/zikr data
export const saveDailyLog = async (uid, date, data) => {
  await set(ref(db, `users/${uid}/logs/${date}`), data);
};

// Get daily log
export const getDailyLog = async (uid, date) => {
  const snapshot = await get(ref(db, `users/${uid}/logs/${date}`));
  return snapshot.exists() ? snapshot.val() : null;
};

// Update prayer status
export const updatePrayerStatus = async (uid, date, field, value) => {
  await update(ref(db, `users/${uid}/logs/${date}`), {
    [field]: value,
  });
};
