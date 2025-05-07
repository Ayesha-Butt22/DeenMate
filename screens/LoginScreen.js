//screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigation } from "@react-navigation/native";
import colors from "../constants/colors"; // ✅ Import your color theme

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigation = useNavigation();

  const handleLogin = () => {
    if (!email || !password) {
      setMessage("Please fill in both fields.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User logged in:", userCredential.user.email);
        navigation.replace("Home");
      })
      .catch((error) => {
        console.log("Login Error:", error.message);
        setMessage("Login Failed: " + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />

      <Button title="Login" color={colors.primaryGreen} onPress={handleLogin} />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.signupLink}>
          Don't have an account? <Text style={styles.signupBold}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.backgroundLight,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.textPrimary,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryGreen,
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  message: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  signupLink: {
    color: colors.primaryGreen,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  signupBold: {
    fontWeight: "bold",
    color: colors.primaryGreen, // ✅ Makes "Sign up" match the theme
  },
});
