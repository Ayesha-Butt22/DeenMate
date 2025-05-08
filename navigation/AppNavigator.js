import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import * as Notifications from "expo-notifications";
import { logIbadahAutomatically } from "../utils/ibadahLogger"; // ✅ Import added

// Screens
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AuthChoiceScreen from "../screens/AuthChoiceScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import BottomTabs from "./BottomTabs";

import PrayerTimesScreen from "../screens/PrayerTimesScreen";
import QiblaARCompassScreen from "../screens/QiblaARCompassScreen";
import TasbeehCounterScreen from "../screens/TasbeehCounterScreen";
import ZakatCalculatorScreen from "../screens/ZakatCalculatorScreen";
import IslamicCalendarScreen from "../screens/IslamicCalendarScreen";
import QadhaTrackerScreen from "../screens/QadhaTrackerScreen";
import RewardsProgressScreen from "../screens/RewardsProgressScreen";
import HabitTrackerScreen from "../screens/HabitTrackerScreen";
import GamifiedLearningScreen from '../screens/GamifiedLearningScreen';
import IbadahAnalyticsScreen from "../screens/IbadahAnalyticsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    Notifications.requestPermissionsAsync();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // ✅ Log Ibadah once user is authenticated
      if (currentUser) {
        logIbadahAutomatically();
      }
    });

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(splashTimer);
    };
  }, []);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={BottomTabs} />
            <Stack.Screen name="Prayer" component={PrayerTimesScreen} />
            <Stack.Screen name="Qibla" component={QiblaARCompassScreen} />
            <Stack.Screen name="Tasbeeh" component={TasbeehCounterScreen} />
            <Stack.Screen name="Zakat" component={ZakatCalculatorScreen} />
            <Stack.Screen name="Calendar" component={IslamicCalendarScreen} />
            <Stack.Screen name="Qadha" component={QadhaTrackerScreen} />
            <Stack.Screen name="Rewards" component={RewardsProgressScreen} />
            <Stack.Screen name="Habits" component={HabitTrackerScreen} />
            <Stack.Screen name="GamifiedLearning" component={GamifiedLearningScreen} />
            <Stack.Screen name="Analytics" component={IbadahAnalyticsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthChoiceScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
