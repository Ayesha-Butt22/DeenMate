// screens/HabitTrackerScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";

const defaultHabits = [
  { id: "1", title: "Fasting (Mon/Thu)", key: "fasting" },
  { id: "2", title: "Tahajjud Prayer", key: "tahajjud" },
  { id: "3", title: "Islamic Book Reading", key: "reading" },
];

export default function HabitTrackerScreen() {
  const [habitData, setHabitData] = useState({});

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const stored = await AsyncStorage.getItem("habitTracker");
      if (stored) setHabitData(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to load habits:", err);
    }
  };

  const toggleHabit = async (key) => {
    const today = new Date().toDateString();
    const updated = {
      ...habitData,
      [key]: {
        ...(habitData[key] || {}),
        [today]: !(habitData[key]?.[today] || false),
      },
    };
    setHabitData(updated);
    await AsyncStorage.setItem("habitTracker", JSON.stringify(updated));
  };

  const getStreak = (habitKey) => {
    const records = habitData[habitKey] || {};
    const dates = Object.keys(records).sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    for (let date of dates) {
      if (records[date]) streak++;
      else break;
    }
    return streak;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Islamic Habit Tracker</Text>

      {defaultHabits.map((habit) => {
        const today = new Date().toDateString();
        const completed = habitData[habit.key]?.[today];
        const streak = getStreak(habit.key);

        return (
          <View key={habit.id} style={styles.habitCard}>
            <View style={styles.habitInfo}>
              <Ionicons
                name={completed ? "checkbox" : "square-outline"}
                size={24}
                color={completed ? colors.primaryGreen : "gray"}
              />
              <Text style={styles.habitText}>{habit.title}</Text>
            </View>
            <Text style={styles.streakText}>{streak} day streak</Text>
            <TouchableOpacity
              style={styles.markButton}
              onPress={() => toggleHabit(habit.key)}
            >
              <Text style={styles.buttonText}>
                {completed ? "Unmark" : "Mark as Done"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.sectionBg,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.textPrimary,
    textAlign: "center",
  },
  habitCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  habitInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  habitText: {
    fontSize: 18,
    marginLeft: 10,
    color: colors.textPrimary,
  },
  streakText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  markButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
