//screens/SplashScreen.js
import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.text}>DeenMate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  logo: { width: 150, height: 150 },
  text: { fontSize: 24, fontWeight: "bold", color: "#198754", marginTop: 20 },
});
