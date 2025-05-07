import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const colors = {
  primaryGreen: '#4CAF50',
  sectionBg: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
};

const azanFiles = {
  Fajr: require('../assets/Fajr.mp3'),
  Dhuhr: require('../assets/Adhan.mp3'),
  Asr: require('../assets/Adhan.mp3'),
  Maghrib: require('../assets/Adhan.mp3'),
  Isha: require('../assets/Adhan.mp3'),
};

const PrayerTimesScreen = () => {
  const [location, setLocation] = useState(null);
  const [sound, setSound] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);
  const [prayerTimesData, setPrayerTimesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await requestLocation();
    };
    initialize();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      checkPrayerTime();
    }, 60000);

    return () => {
      clearInterval(interval);
      if (sound) sound.unloadAsync();
    };
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for accurate prayer times.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchPrayerTimes(loc.coords.latitude, loc.coords.longitude);
    } catch (err) {
      Alert.alert('Error', 'Failed to get location');
      setLoading(false);
    }
  };

  const fetchPrayerTimes = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `http://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
      );
      const data = await response.json();
      if (data.code === 200) {
        setPrayerTimesData(data.data.timings);
      } else {
        Alert.alert('Error', 'Failed to fetch prayer times');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  };

  const playAzan = async (prayerName) => {
    try {
      if (sound) await sound.unloadAsync();
      const azanFile = azanFiles[prayerName] || azanFiles['Dhuhr'];
      const { sound: newSound } = await Audio.Sound.createAsync(azanFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.error('Azan play error:', err);
      Alert.alert('Error', 'Could not play Azan');
    }
  };

  const checkPrayerTime = async () => {
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    let nextPrayerFound = null;

    if (prayerTimesData && typeof prayerTimesData === 'object') {
      for (let prayer in prayerTimesData) {
        const prayerTime = prayerTimesData[prayer];
        if (prayerTime === currentTimeStr) {
          const lastPlayed = await AsyncStorage.getItem(`lastPlayed-${prayer}`);
          const lastPlayedDate = lastPlayed ? new Date(lastPlayed) : null;
          if (!lastPlayedDate || now - lastPlayedDate > 3600000) {
            await AsyncStorage.setItem(`lastPlayed-${prayer}`, now.toISOString());
            playAzan(prayer);
          }
        }

        const [hours, minutes] = prayerTime.split(':');
        const prayerDate = new Date();
        prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        if (prayerDate > now && (!nextPrayerFound || prayerDate < nextPrayerFound.time)) {
          nextPrayerFound = { name: prayer, time: prayerDate };
        }
      }

      setNextPrayer(nextPrayerFound);
      scheduleNotifications(nextPrayerFound);
    }
  };

  const calculateTimeRemaining = (prayerTime) => {
    const now = new Date();
    const diff = prayerTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const scheduleNotifications = async (nextPrayerFound) => {
    if (nextPrayerFound) {
      const timeRemaining = nextPrayerFound.time - new Date();
      const notificationTime = timeRemaining - 5 * 60 * 1000;

      if (notificationTime > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `It's time for ${nextPrayerFound.name}!`,
            body: `Next prayer: ${nextPrayerFound.name}`,
          },
          trigger: {
            seconds: notificationTime / 1000,
          },
        });
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.loadingText}>Getting prayer times...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primaryGreen} barStyle="light-content" />
      <View style={styles.header}>
        <Ionicons name="time" size={28} color="#fff" />
        <Text style={styles.headerTitle}>Prayer Times</Text>
        <TouchableOpacity onPress={requestLocation}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.timeLocationContainer}>
          <Text style={styles.currentTime}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.locationText}>
              {location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : 'Location not available'}
            </Text>
          </View>
        </View>

        {nextPrayer && (
          <View style={styles.nextPrayerCard}>
            <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
            <View style={styles.nextPrayerInfo}>
              <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
              <Text style={styles.nextPrayerTime}>
                {prayerTimesData[nextPrayer.name] || 'N/A'}
              </Text>
            </View>
            <Text style={styles.nextPrayerRemaining}>
              {nextPrayer.time ? calculateTimeRemaining(nextPrayer.time) : 'N/A'} remaining
            </Text>
          </View>
        )}

        <View style={styles.prayerTimesContainer}>
          {prayerTimesData && Object.entries(prayerTimesData).map(([prayer, time]) => (
            <View
              key={prayer}
              style={[styles.prayerCard, nextPrayer?.name === prayer && styles.activePrayerCard]}>
              <View style={styles.prayerInfo}>
                <Text style={styles.prayerName}>{prayer}</Text>
                <Text style={styles.prayerTime}>{time || 'N/A'}</Text>
              </View>
              <TouchableOpacity
                style={styles.azanButton}
                onPress={() => playAzan(prayer)}>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.azanButtonText}>Play Azan</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sectionBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.sectionBg,
  },
  loadingText: {
    marginTop: 15,
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryGreen,
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  timeLocationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationText: {
    marginLeft: 5,
    color: colors.textSecondary,
  },
  nextPrayerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nextPrayerLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  nextPrayerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  nextPrayerTime: {
    fontSize: 20,
    color: colors.primaryGreen,
  },
  nextPrayerRemaining: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  prayerTimesContainer: {
    marginTop: 10,
  },
  prayerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activePrayerCard: {
    borderColor: colors.primaryGreen,
    borderWidth: 2,
  },
  prayerInfo: {},
  prayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  prayerTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  azanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  azanButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
});

export default PrayerTimesScreen;
