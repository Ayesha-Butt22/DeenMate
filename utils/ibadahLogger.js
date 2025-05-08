import { collection, addDoc, Timestamp, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ✅ Convert current date to string like '2025-05-08'
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// ✅ AUTO: Create daily ibadah record if not exists
export const logIbadahAutomatically = async () => {
  const today = getTodayDate();
  const ibadahRef = doc(db, 'ibadah_logs', today);

  try {
    const existing = await getDoc(ibadahRef);
    if (!existing.exists()) {
      await setDoc(ibadahRef, {
        date: Timestamp.now(),
        prayers: 0,
        quranVerses: 0,
        dhikrCount: 0,
      });
      console.log('✅ New Ibadah record created for today');
    } else {
      console.log('ℹ️ Record already exists for today');
    }
  } catch (error) {
    console.error('❌ Error initializing today\'s ibadah record:', error);
  }
};

// ✅ MANUAL: Log/update today's ibadah values
export const updateTodayIbadah = async ({ prayers, quranVerses, dhikrCount }) => {
  const today = getTodayDate();
  const ibadahRef = doc(db, 'ibadah_logs', today);

  try {
    const snapshot = await getDoc(ibadahRef);
    if (snapshot.exists()) {
      const existing = snapshot.data();
      await updateDoc(ibadahRef, {
        prayers: existing.prayers + prayers,
        quranVerses: existing.quranVerses + quranVerses,
        dhikrCount: existing.dhikrCount + dhikrCount,
      });
      console.log('✅ Ibadah updated successfully');
    } else {
      console.warn('⚠️ Today\'s record not found, creating a new one.');
      await setDoc(ibadahRef, {
        date: Timestamp.now(),
        prayers,
        quranVerses,
        dhikrCount,
      });
    }
  } catch (e) {
    console.error('❌ Error updating ibadah:', e);
  }
};
