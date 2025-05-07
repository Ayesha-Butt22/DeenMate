//screens/NotificationSettingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationSettingsScreen = () => {
  const [useAdhan, setUseAdhan] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const value = await AsyncStorage.getItem('useAdhan');
    setUseAdhan(value === null ? true : value === 'true');
  };

  const toggleSetting = async () => {
    const newSetting = !useAdhan;
    setUseAdhan(newSetting);
    await AsyncStorage.setItem('useAdhan', newSetting.toString());
    Alert.alert('Setting Updated', newSetting ? 'Adhan sound enabled' : 'Vibration only');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notification Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Use Adhan Sound</Text>
        <Switch value={useAdhan} onValueChange={toggleSetting} />
      </View>
      <Text style={styles.note}>If disabled, device vibration will be used instead of Adhan.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 18,
  },
  note: {
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
});

export default NotificationSettingsScreen;
