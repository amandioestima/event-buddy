import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { database } from "../firebaseConfig";

/**
 * Create Event Component
 * Form component for creating new events
 * Handles image upload, date/time selection, and event details
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback function called after successful event creation
 */
export default function CriarEvento({ onSuccess }) {
  // State management for form fields
  const [title, setTitle] = useState(""); // Event title
  const [description, setDescription] = useState(""); // Event description
  const [location, setLocation] = useState(""); // Event location
  const [dateText, setDateText] = useState(""); // Event date
  const [timeText, setTimeText] = useState(""); // Event time
  const [imageUri, setImageUri] = useState(null); // Event image URI

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (!title || !description || !location || !dateText || !timeText) {
      Alert.alert("Preencha todos os campos.");
      return;
    }

    const [d, m, y] = dateText.split("/");
    const [h, min] = timeText.split(":");
    const iso = `${y}-${m}-${d}T${h}:${min}:00`;
    const datetime = new Date(iso);

    if (isNaN(datetime)) {
      Alert.alert("Data ou hora inválida.");
      return;
    }

    try {
      await database.collection("events").add({
        title,
        description,
        location,
        datetime,
        imageUrl: imageUri || "",
        participants: [],
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setDateText("");
      setTimeText("");
      setImageUri(null);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      Alert.alert("Erro ao guardar evento.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 26, marginBottom: 32 }} />

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Localização"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Data (ex: 25/12/2025)"
        value={dateText}
        onChangeText={setDateText}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Hora (ex: 14:30)"
        value={timeText}
        onChangeText={setTimeText}
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      <TouchableOpacity style={styles.selectImageButton} onPress={handleImagePick}>
        <Text style={styles.selectImageText}>Seleccionar Imagem</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <TouchableOpacity onPress={handleCreateEvent} style={styles.button}>
        <Text style={styles.buttonText}>Guardar Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60, 
    paddingBottom: 80,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectImageButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  selectImageText: {
    color: "#ed128d",
    fontWeight: "bold",
    fontSize: 16,
  },
  image: {
    height: 160,
    width: "100%",
    borderRadius: 8,
    marginVertical: 12,
  },
  button: {
    width: "60%",
    alignSelf: "center",
    backgroundColor: "#5e17eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
});




