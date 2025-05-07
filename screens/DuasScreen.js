import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import colors from "../constants/colors";

export default function DuasScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.loadingText}>Loading Duas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.contentText}>All Duas will be listed here...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: colors.sectionBg,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});
