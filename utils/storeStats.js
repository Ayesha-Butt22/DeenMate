// utils/storeStats.js
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/config";

// Function to store both daily & weekly ibadah stats
export const storeIbadahStats = async (userId, prayer, dhikr, quranMinutes) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const userRef = doc(db, "users", userId);

    // Update daily
    await setDoc(userRef, {
      ibadahStats: {
        daily: {
          date: today,
          prayer,
          dhikr,
          quranMinutes,
        }
      }
    }, { merge: true });

    // Add to weekly log
    await updateDoc(userRef, {
      "ibadahStats.weekly": arrayUnion({
        date: today,
        prayer,
        dhikr,
        quranMinutes
      }),
      // Rewards can be updated too
      "rewards.points": 120,
      "rewards.badges": arrayUnion("Quran Beginner", "Dhikr Consistent")
    });

    console.log("✅ Ibadah stats and rewards saved!");
  } catch (error) {
    console.error("❌ Error saving stats: ", error);
  }
};
