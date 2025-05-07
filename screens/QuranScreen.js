import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import colors from "../constants/colors";
import { useNavigation } from "@react-navigation/native";

export default function QuranScreen() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "surahs"));
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSurahs(fetched.sort((a, b) => a.number - b.number));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Surahs:", error);
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  const toggleBookmark = async (surah) => {
    const ref = doc(db, "surahs", surah.id);
    await updateDoc(ref, { bookmarked: !surah.bookmarked });
    setSurahs((prev) =>
      prev.map((s) =>
        s.id === surah.id ? { ...s, bookmarked: !s.bookmarked } : s
      )
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.primaryGreen}
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📖 Quran Surahs</Text>
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("SurahDetail", { surah: item })}
            onLongPress={() => toggleBookmark(item)}
          >
            <Text style={styles.surahText}>
              {item.number}. {item.name}
              {item.bookmarked ? " ⭐" : ""}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.sectionBg,
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.textPrimary,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.backgroundLight,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: colors.primaryGreen,
  },
  surahText: {
    fontSize: 18,
    color: colors.textPrimary,
  },
});
