import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import QuizCard from '../components/QuizCard';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const quizzes = [
  {
    id: '1',
    category: 'Quran',
    question: 'Which Surah is the longest in the Quran?',
    options: ['Surah Baqarah', 'Surah Ikhlas', 'Surah Yaseen', 'Surah Falaq'],
    answer: 'Surah Baqarah',
  },
  {
    id: '2',
    category: 'Hadith',
    question: 'What does the Hadith say about intention (niyyah)?',
    options: [
      'It is not important',
      'Only actions matter',
      'Actions are judged by intentions',
      'None of these',
    ],
    answer: 'Actions are judged by intentions',
  },
  {
    id: '3',
    category: 'Dua',
    question: 'Which Dua is recited before sleeping?',
    options: [
      'Ayat-ul-Kursi',
      'Surah Fatiha',
      'Rabbi Zidni Ilma',
      'Bismika Allahumma amutu wa ahya',
    ],
    answer: 'Bismika Allahumma amutu wa ahya',
  },
];

const GamifiedLearningScreen = () => {
  const [score, setScore] = useState(0);

  const handleAnswer = async (isCorrect) => {
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      Alert.alert('Correct!', 'Great job! 🌟');

      // Save to Firebase
      try {
        await addDoc(collection(db, 'quiz_scores'), {
          timestamp: new Date(),
          score: newScore,
          quizType: 'Islamic',
        });
        console.log('Score saved to Firestore');
      } catch (error) {
        console.error('Error saving score:', error);
      }
    } else {
      Alert.alert('Oops!', 'Try again next time.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🕌 Gamified Islamic Learning</Text>
      <Text style={styles.subtext}>Score: {score} ⭐</Text>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuizCard
            question={item.question}
            options={item.options}
            correctAnswer={item.answer}
            onAnswer={handleAnswer}
          />
        )}
      />
    </View>
  );
};

export default GamifiedLearningScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
});
