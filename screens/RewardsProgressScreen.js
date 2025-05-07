import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import colors from "../constants/colors";

const { width } = Dimensions.get("window");

export default function RewardsProgressScreen() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(null);
  const userId = "user1"; // Replace with auth.uid if using authentication

  const fetchProgress = async () => {
    const ref = doc(db, "progress", userId);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      setProgress(docSnap.data());
    } else {
      const initialData = {
        prayersCompleted: 0,
        zikrCompleted: 0,
        streak: 0,
        lastUpdate: Timestamp.now(),
      };
      await setDoc(ref, initialData);
      setProgress(initialData);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const logPrayer = async () => {
    const ref = doc(db, "progress", userId);
    await updateDoc(ref, {
      prayersCompleted: increment(1),
    });
    fetchProgress();
  };

  const logZikr = async () => {
    const ref = doc(db, "progress", userId);
    await updateDoc(ref, {
      zikrCompleted: increment(1),
    });
    fetchProgress();
  };

  const generateCertificate = () => {
    Alert.alert(
      "🎉 Achievement Unlocked!",
      "You've completed a full week of prayers!",
      [
        {
          text: "Download",
          onPress: () => Alert.alert("📄 Certificate", "Certificate downloaded!"),
        },
      ]
    );
  };

  if (!progress) return null;

  const certificateMessage =
    progress.streak >= 7
      ? "Congratulations! You've completed a full week of prayers."
      : null;

  return (
    <LinearGradient
      colors={[colors.primaryGreen, "#1B5E20", colors.primaryGreen]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInDown" duration={800}>
          <View style={styles.header}>
            <Text style={styles.heading}>Daily Prayer & Zikr Tracking</Text>
            <Text style={styles.subtext}>
              Log your daily prayers and Zikr to stay on track.
            </Text>

            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Prayers:</Text>
                <Text style={styles.statusValue}>
                  {progress.prayersCompleted}/5
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Zikr:</Text>
                <Text style={styles.statusValue}>
                  {progress.zikrCompleted}/50
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Streak:</Text>
                <Text style={styles.statusValue}>{progress.streak} Days</Text>
              </View>
            </View>

            {certificateMessage && (
              <View style={styles.certificateCard}>
                <Ionicons
                  name="trophy-outline"
                  size={36}
                  color={colors.secondaryGold}
                />
                <Text style={styles.certificateText}>{certificateMessage}</Text>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={generateCertificate}
                >
                  <Text style={styles.downloadText}>Download Certificate</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500}>
          <View style={styles.motivationSection}>
            <Text style={styles.heading}>Motivational Rewards</Text>
            <View style={styles.badgeContainer}>
              {progress.streak >= 5 && (
                <View style={styles.badge}>
                  <Ionicons name="star-outline" size={24} color="#FFD700" />
                  <Text style={styles.badgeText}>5-Day Streak Badge</Text>
                </View>
              )}
              {progress.zikrCompleted >= 50 && (
                <View style={styles.badge}>
                  <Ionicons
                    name="sparkles-outline"
                    size={24}
                    color="#A7FFEB"
                  />
                  <Text style={styles.badgeText}>Zikr Master</Text>
                </View>
              )}
            </View>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={800}>
          <View style={styles.communitySection}>
            <Text style={styles.heading}>Leaderboard (Coming Soon)</Text>
            <Text style={styles.subtext}>
              Compete with friends & family to stay motivated together.
            </Text>
          </View>
        </Animatable.View>

        <TouchableOpacity onPress={logPrayer} style={styles.downloadBtn}>
          <Text style={styles.downloadText}>Log Prayer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logZikr} style={styles.downloadBtn}>
          <Text style={styles.downloadText}>Log Zikr</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 30 },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtext: { color: "rgba(255,255,255,0.8)", marginBottom: 16 },
  statusCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusLabel: { color: "#fff", fontSize: 16 },
  statusValue: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  certificateCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  certificateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
  downloadText: { color: "#fff", fontWeight: "600" },
  motivationSection: { marginBottom: 30 },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    width: "48%",
    alignItems: "center",
  },
  badgeText: { color: "#fff", marginTop: 8 },
  communitySection: { marginBottom: 30 },
});
