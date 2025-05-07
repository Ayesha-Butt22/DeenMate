import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <Button
        title="Notification Settings"
        onPress={() => navigation.navigate("NotificationSettings")}
      />

      <View style={{ marginVertical: 10 }} />

      <Button
        title="Profile"
        onPress={() => navigation.navigate("Profile")}
        color="#198754"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
});
