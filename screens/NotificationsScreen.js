import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationsScreen = () => {
  const [reminders, setReminders] = useState({
    prayer: { hour: 5, minute: 0, enabled: true },
    fasting: { hour: 4, minute: 30, enabled: false },
    azkar: { hour: 18, minute: 0, enabled: true },
    quran: { hour: 20, minute: 0, enabled: true }
  });

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please enable notifications to receive reminders.');
    }
  };

  const scheduleNotification = async (title, body, time) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
    }
  };

  const handleTimeChange = (type, field, value) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = field === 'hour' 
      ? Math.min(23, Math.max(0, numValue))
      : Math.min(59, Math.max(0, numValue));
    
    setReminders({
      ...reminders,
      [type]: {
        ...reminders[type],
        [field]: clampedValue
      }
    });
  };

  const toggleReminder = (type) => {
    setReminders({
      ...reminders,
      [type]: {
        ...reminders[type],
        enabled: !reminders[type].enabled
      }
    });
  };

  const setReminder = async (type, title, message) => {
    if (!reminders[type].enabled) {
      Alert.alert('Reminder Disabled', `Please enable ${title} reminder first.`);
      return;
    }
    await scheduleNotification(title, message, reminders[type]);
    Alert.alert(
      'Success', 
      `${title} reminder set for ${String(reminders[type].hour).padStart(2, '0')}:${String(reminders[type].minute).padStart(2, '0')}`
    );
  };

  // Verified MaterialCommunityIcons names
  const reminderIcons = {
    prayer: 'calendar-clock', // Alternative to 'pray'
    fasting: 'food-apple-outline',
    azkar: 'book-multiple',  // Alternative for dhikr/azkar
    quran: 'book-open-variant'
  };

  const reminderColors = {
    prayer: '#3498DB',  // Blue
    fasting: '#2ECC71', // Green
    azkar: '#9B59B6',   // Purple
    quran: '#E74C3C'    // Red
  };

  return (
    <LinearGradient colors={[colors.backgroundLight, '#F0F8FF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="bell-outline" size={40} color={colors.primaryGreen} />
          <Text style={styles.heading}>Islamic Reminders</Text>
          <Text style={styles.subHeading}>Set your daily spiritual notifications</Text>
        </View>

        {Object.entries(reminders).map(([type, reminder]) => (
          <View 
            key={type}
            style={[
              styles.card, 
              { 
                borderLeftColor: reminderColors[type],
                backgroundColor: colors.sectionBg
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Icon 
                  name={reminderIcons[type]} 
                  size={24} 
                  color={reminderColors[type]} 
                />
                <Text style={[styles.cardTitleText, { color: reminderColors[type] }]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Time
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleReminder(type)}>
                <Icon 
                  name={reminder.enabled ? "toggle-switch" : "toggle-switch-off-outline"} 
                  size={40} 
                  color={reminder.enabled ? colors.primaryGreen : colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeContainer}>
              <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                value={String(reminder.hour)}
                onChangeText={(text) => handleTimeChange(type, 'hour', text)}
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                keyboardType="numeric"
                value={String(reminder.minute)}
                onChangeText={(text) => handleTimeChange(type, 'minute', text)}
                maxLength={2}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: reminderColors[type] }]}
              onPress={() => setReminder(
                type,
                `${type.charAt(0).toUpperCase() + type.slice(1)} Reminder`,
                type === 'prayer' ? "It's time for your prayer." :
                type === 'fasting' ? "Time to start your fast." :
                type === 'azkar' ? "Time to recite your Azkar." :
                "Let's read the Quran now."
              )}
            >
              <Text style={styles.buttonText}>Set {type.charAt(0).toUpperCase() + type.slice(1)} Reminder</Text>
            </TouchableOpacity>
          </View>
        ))}
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 15,
  },
  subHeading: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.sectionBg,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  timeInput: {
    width: 60,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    backgroundColor: '#FFF',
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    color: colors.textSecondary,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;