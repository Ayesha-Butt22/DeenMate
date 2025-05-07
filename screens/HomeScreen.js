// screens/HomeScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

const darkGreen = "#1B5E20";
const mediumGreen = "#2E7D32";
const lightGreen = "#4CAF50";

const features = [
  { name: "Prayer Times", icon: "time", screen: "Prayer" },
  { name: "Qibla Finder", icon: "compass", screen: "Qibla" },
  { name: "Dua & Azkar", icon: "heart", screen: "Duas" },
  { name: "Quran", icon: "book", screen: "Quran" },
  { name: "Tasbeeh Counter", icon: "ellipse", screen: "Tasbeeh" },
  { name: "Zakat Calculator", icon: "calculator", screen: "Zakat" },
  { name: "Qadha", icon: "refresh-circle", screen: "Qadha" },
  { name: "Islamic Calendar", icon: "calendar", screen: "Calendar" },

  // 🔽 New features added here
  { name: "Rewards & Progress", icon: "star", screen: "Rewards" },
  { name: "Habit Builder", icon: "construct", screen: "Habits" },
  { name: "Gamified Learning", icon: "game-controller", screen: "GamifiedLearning" },
  { name: "Ibadah Analytics", icon: "bar-chart", screen: "Analytics" },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={[darkGreen, mediumGreen, lightGreen]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="bounceIn" duration={1500} style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.headerTextContainer}>
          <Text style={styles.heading}>
            Welcome to <Text style={styles.brand}>DeenMate</Text>
          </Text>
          <Text style={styles.subHeading}>Your Daily Islamic Companion</Text>
        </Animatable.View>

        <View style={styles.grid}>
          {features.map((feature, index) => (
            <Animatable.View key={index} animation="fadeInUp" delay={300 + index * 100}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate(feature.screen)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                  style={styles.cardGradient}
                >
                  <LinearGradient colors={[mediumGreen, lightGreen]} style={styles.iconContainer}>
                    <Ionicons name={feature.icon} size={width * 0.1} color="white" />
                  </LinearGradient>
                  <Text style={styles.cardText}>{feature.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTextContainer: { alignItems: "center", marginBottom: height * 0.04 },
  heading: {
    fontSize: width * 0.08,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 5,
  },
  brand: { color: "white", fontWeight: "700" },
  subHeading: {
    fontSize: width * 0.045,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: width * 0.43,
    height: width * 0.43,
    marginBottom: width * 0.04,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  iconContainer: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width * 0.09,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardText: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: darkGreen,
    textAlign: "center",
    marginTop: 5,
  },
});
