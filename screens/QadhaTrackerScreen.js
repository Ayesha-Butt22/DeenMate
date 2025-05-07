import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

const prayerColors = {
  Fajr: "#3498DB",     // Blue
  Dhuhr: "#2ECC71",    // Green
  Asr: "#F39C12",      // Orange
  Maghrib: "#E74C3C",  // Red
  Isha: "#9B59B6"      // Purple
};

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const QadhaTrackerScreen = () => {
  const [missedPrayers, setMissedPrayers] = useState({});
  const [lastUpdated, setLastUpdated] = useState('');
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const loadData = async () => {
    const data = {};
    for (let prayer of prayers) {
      const count = await AsyncStorage.getItem(`missed-${prayer}`);
      data[prayer] = parseInt(count) || 0;
    }
    setMissedPrayers(data);
    const updated = await AsyncStorage.getItem('last-updated') || 'Never';
    setLastUpdated(updated);
  };

  const updateCount = async (prayer, delta) => {
    const updated = { ...missedPrayers };
    updated[prayer] = Math.max(0, updated[prayer] + delta);
    setMissedPrayers(updated);
    await AsyncStorage.setItem(`missed-${prayer}`, updated[prayer].toString());
    const now = new Date().toLocaleString();
    await AsyncStorage.setItem('last-updated', now);
    setLastUpdated(now);

    if (delta > 0) {
      Alert.alert(
        `${prayer} Added`,
        `You've added 1 missed ${prayer} prayer.`,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
    }
  };

  const resetAllCounts = async () => {
    Alert.alert(
      "Reset All",
      "Are you sure you want to reset all counts to zero?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          onPress: async () => {
            const reset = {};
            for (let prayer of prayers) {
              reset[prayer] = 0;
              await AsyncStorage.setItem(`missed-${prayer}`, '0');
            }
            setMissedPrayers(reset);
            const now = new Date().toLocaleString();
            await AsyncStorage.setItem('last-updated', now);
            setLastUpdated(now);
          }
        }
      ]
    );
  };

  const pulseInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1]
  });

  return (
    <LinearGradient
      colors={[colors.backgroundLight, '#E0F7FA']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: pulseInterpolation }] }}>
            <Icon name="mosque" size={60} color={colors.primaryGreen} />
          </Animated.View>
          <Text style={styles.heading}>Qadha Prayer Tracker</Text>
          <Text style={styles.subHeading}>Track and fulfill your missed prayers</Text>
        </View>

        <View style={styles.lastUpdatedContainer}>
          <Icon name="update" size={18} color={colors.textSecondary} />
          <Text style={styles.lastUpdated}> Last Updated: {lastUpdated}</Text>
        </View>

        {prayers.map((prayer) => (
          <View
            key={prayer}
            style={[
              styles.card,
              {
                borderLeftWidth: 6,
                borderLeftColor: prayerColors[prayer],
                backgroundColor: colors.sectionBg
              }
            ]}
          >
            <View style={styles.prayerHeader}>
              <View style={styles.prayerTitleContainer}>
                <Icon
                  name="clock-outline"
                  size={20}
                  color={prayerColors[prayer]}
                  style={styles.prayerIcon}
                />
                <Text style={[styles.name, { color: prayerColors[prayer] }]}>{prayer}</Text>
              </View>
              <View style={styles.countContainer}>
                <Text style={styles.countLabel}>Missed:</Text>
                <Text style={[styles.count, { color: colors.textPrimary }]}>{missedPrayers[prayer] || 0}</Text>
              </View>
            </View>

            <View style={styles.btns}>
              <TouchableOpacity
                style={[styles.btn, styles.decrementBtn]}
                onPress={() => updateCount(prayer, -1)}
                activeOpacity={0.7}
              >
                <Icon name="minus" size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.incrementBtn]}
                onPress={() => updateCount(prayer, 1)}
                activeOpacity={0.7}
              >
                <Icon name="plus" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetAllCounts}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.secondaryGold, '#FFA500']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="reload" size={22} color="white" />
            <Text style={styles.resetButtonText}> Reset All</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 15,
    fontFamily: 'sans-serif-medium',
    letterSpacing: 0.5,
  },
  subHeading: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'sans-serif',
    lineHeight: 22,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: 5,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  prayerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    marginRight: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'sans-serif-medium',
  },
  countContainer: {
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  count: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  incrementBtn: {
    backgroundColor: colors.primaryGreen,
  },
  decrementBtn: {
    backgroundColor: '#dc3545',
  },
  resetButton: {
    borderRadius: 12,
    marginTop: 25,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  gradientButton: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  }
});

export default QadhaTrackerScreen;
