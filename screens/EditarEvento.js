import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
} from "react-native";
import { database } from "../firebaseConfig";

/**
 * Edit Event Screen Component
 * Allows administrators to modify existing event details
 * 
 * @param {Object} props - Component props
 * @param {Object} props.route - Route object containing event data
 * @param {Object} props.navigation - Navigation object for screen transitions
 */
export default function EditarEvento({ route, navigation }) {
  // Extract event data from route params
  const { event } = route.params;

  // State management for form fields
  const [title, setTitle] = useState(event.title);          // Event title
  const [description, setDescription] = useState(event.description);  // Event description
  const [location, setLocation] = useState(event.location);  // Event location
  const [imageUrl, setImageUrl] = useState(event.imageUrl);  // Event image URL
  const [dateText, setDateText] = useState(
    event.datetime && typeof event.datetime.toDate === 'function'
      ? new Date(event.datetime.toDate()).toLocaleDateString("pt-PT")
      : new Date(event.datetime).toLocaleDateString("pt-PT")
  );
  const [timeText, setTimeText] = useState(
    event.datetime && typeof event.datetime.toDate === 'function'
      ? new Date(event.datetime.toDate()).toLocaleTimeString("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(event.datetime).toLocaleTimeString("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
        })
  );

  const parseDateTime = (dateText, timeText) => {
    const [day, month, year] = dateText.split("/");
    const [hour, minute] = timeText.split(":");
    const iso = `${year}-${month}-${day}T${hour}:${minute}:00`;
    const finalDate = new Date(iso);
    return isNaN(finalDate.getTime()) ? null : finalDate;
  };

  const handleUpdate = async () => {
    if (!title || !description || !location || !imageUrl || !dateText || !timeText) {
      Alert.alert("Todos os campos são obrigatórios.");
      return;
    }

    const newDatetime = parseDateTime(dateText, timeText);
    if (!newDatetime) {
      Alert.alert("Data ou hora inválida.");
      return;
    }

    try {
      await database.collection("events").doc(event.id).update({
        title,
        description,
        location,
        imageUrl,
        datetime: newDatetime,
      });
      Alert.alert("Evento atualizado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      Alert.alert("Não foi possível atualizar o evento.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/home.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.heading}>Editar Evento</Text>

        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          placeholder="Localização"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          placeholder="URL da Imagem"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          placeholder="Data (ex: 25/07/2025)"
          value={dateText}
          onChangeText={setDateText}
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          placeholder="Hora (ex: 14:30)"
          value={timeText}
          onChangeText={setTimeText}
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>Guardar Evento</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 80,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  heading: {
    fontSize: 26,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 28,
    textAlign: "center",
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
  saveButton: {
    backgroundColor: "#5e17eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});


