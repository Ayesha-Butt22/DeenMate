// components/IbadahTracker.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { storeIbadahStats } from "../utils/storeStats";
import { auth } from "../firebase/config";

const IbadahTracker = () => {
  const [prayer, setPrayer] = useState("");
  const [dhikr, setDhikr] = useState("");
  const [quranMinutes, setQuranMinutes] = useState("");

  const handleSubmit = () => {
    const userId = auth.currentUser.uid;
    storeIbadahStats(userId, parseInt(prayer), parseInt(dhikr), parseInt(quranMinutes));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Ibadah Tracker</Text>

      <TextInput
        style={styles.input}
        placeholder="Number of Prayers"
        keyboardType="numeric"
        value={prayer}
        onChangeText={setPrayer}
      />
      <TextInput
        style={styles.input}
        placeholder="Dhikr Count"
        keyboardType="numeric"
        value={dhikr}
        onChangeText={setDhikr}
      />
      <TextInput
        style={styles.input}
        placeholder="Quran Reading (in minutes)"
        keyboardType="numeric"
        value={quranMinutes}
        onChangeText={setQuranMinutes}
      />

      <Button title="Save Ibadah Stats" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
});

export default IbadahTracker;
