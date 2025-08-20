import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { signIn } from "../services/firebaseAuth";
import { useAuth } from "../context/AuthContext";

/**
 * Login Screen Component
 * Handles user authentication with email and password
 * Provides navigation to signup screen for new users
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen transitions
 */
export default function LoginScreen({ navigation }) {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useAuth(); // Get auth context

  /**
   * Handle user login attempt
   * Authenticates user with provided credentials
   */
  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {   }
      <View style={styles.overlay}>
       

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

        <TouchableOpacity style={styles.customButton} onPress={handleLogin}>
  <Text style={styles.customButtonText}>LOGIN</Text>
    </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}>Efectuar registo SIGNUP</Text>
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
  backgroundColor: "#5e17eb",
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignItems: "center",
   alignSelf: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
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
