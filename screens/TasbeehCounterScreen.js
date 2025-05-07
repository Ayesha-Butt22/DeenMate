import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const TasbeehCounterScreen = () => {
  const [count, setCount] = useState(0);

  // Load saved count on mount
  useEffect(() => {
    loadCount();
  }, []);

  // Save count to AsyncStorage
  const saveCount = async (value) => {
    try {
      await AsyncStorage.setItem('tasbeehCount', value.toString());
    } catch (error) {
      console.error('Error saving count:', error);
    }
  };

  // Load count from AsyncStorage
  const loadCount = async () => {
    try {
      const savedCount = await AsyncStorage.getItem('tasbeehCount');
      if (savedCount !== null) {
        setCount(parseInt(savedCount));
      }
    } catch (error) {
      console.error('Error loading count:', error);
    }
  };

  // Increase tasbeeh count
  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    saveCount(newCount);
  };

  // Reset tasbeeh count
  const handleReset = () => {
    Alert.alert(
      'Reset Counter',
      'Are you sure you want to reset?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            setCount(0);
            await saveCount(0);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasbeeh Counter</Text>

      <View style={styles.counterContainer}>
        <Text style={styles.countText}>{count}</Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.button} onPress={handleIncrement}>
          <Ionicons name="add-circle" size={50} color="#0b8457" />
          <Text style={styles.buttonText}>Count</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Ionicons name="refresh-circle" size={50} color="#d9534f" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Your Zikr progress is automatically saved.</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7f4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0b8457',
    marginBottom: 40,
  },
  counterContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#0b8457',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 8,
  },
  countText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0b8457',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 50,
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  buttonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    marginTop: 30,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});


export default TasbeehCounterScreen;
