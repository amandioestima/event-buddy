import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { signUp } from "../services/firebaseAuth";
import { auth, database } from "../firebaseConfig";

/**
 * Signup Screen Component
 * Handles new user registration with email and password
 * Includes form validation and user profile creation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen transitions
 */
export default function SignupScreen({ navigation }) {
  // State management for form fields
  const [name, setName] = useState(""); // User's display name
  const [email, setEmail] = useState(""); // User's email
  const [password, setPassword] = useState(""); // User's password
  const [confirmPassword, setConfirmPassword] = useState(""); // Password confirmation

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As Passwords não coincidem.");
      return;
    }

    try {
      await signUp(email, password);

      auth.onAuthStateChanged(async (newUser) => {
        if (newUser) {
          console.log("Novo user:", newUser.uid);

          //  Create user profile in Firestore
          await database.collection("users").doc(newUser.uid).set({
            email: newUser.email,
            name: name.trim(),
            isAdmin: false,
            favoritos: [],
          });

          Alert.alert("Conta criada com sucesso!");
          navigation.navigate("Login");
        }
      });
    } catch (error) {
      console.error("Erro ao registar:", error);
      Alert.alert("Erro ao registar", error.message || "Tente novamente.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TextInput
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#ccc"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#ccc"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#ccc"
        />
        <TextInput
          placeholder="Confirmar Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity style={styles.customButton} onPress={handleSignUp}>
          <Text style={styles.customButtonText}>SIGN UP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Efectuar LOGIN</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#5e17eb",
  },
  customButton: {
    width: "50%",
    alignSelf: "center",
    backgroundColor: "#5e17eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 24,
  },
  customButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
  link: {
    textAlign: "center",
    color: "#A78BFA",
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: "underline",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});


