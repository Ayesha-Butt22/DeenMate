// components/QuizScreen.js
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

const questions = [
  {
    question: "What is the first verse of the Quran?",
    options: ["Alhamdulillah", "Bismillah", "Iqra", "SubhanAllah"],
    answer: "Bismillah"
  },
  {
    question: "Which Surah has no Bismillah?",
    options: ["At-Tawbah", "Al-Fatiha", "Yasin", "Al-Ikhlas"],
    answer: "At-Tawbah"
  }
];

export default function QuizScreen() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const checkAnswer = (selected) => {
    if (selected === questions[index].answer) setScore(score + 1);
    if (index + 1 < questions.length) setIndex(index + 1);
    else alert(`Quiz completed! Your score: ${score + 1}`);
  };

  return (
    <View>
      <Text>{questions[index].question}</Text>
      {questions[index].options.map((opt, i) => (
        <Button key={i} title={opt} onPress={() => checkAnswer(opt)} />
      ))}
    </View>
  );
}
