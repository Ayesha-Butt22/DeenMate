import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../constants/colors";

export default function SurahDetailScreen({ route }) {
  const { surah } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {surah.number}. {surah.name}
      </Text>
      <Text style={styles.arabic}>[Full Surah Arabic here]</Text>
      <Text style={styles.translation}>[Translation here]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sectionBg,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.textPrimary,
  },
  arabic: {
    fontSize: 28,
    color: "#222",
    textAlign: "right",
    marginBottom: 20,
  },
  translation: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
