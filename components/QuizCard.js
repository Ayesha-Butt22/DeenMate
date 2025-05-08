// components/QuizCard.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuizCard = ({ question, options, correctAnswer, onAnswer }) => {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const isCorrect = option === correctAnswer;
    onAnswer(isCorrect);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            selected === option && {
              backgroundColor:
                option === correctAnswer ? '#A7F3D0' : '#FECACA',
            },
          ]}
          onPress={() => handleSelect(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default QuizCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1F2937',
  },
  option: {
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  optionText: {
    fontSize: 15,
    color: '#111827',
  },
});
