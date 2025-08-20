/**
 * @fileoverview Event Details Screen Component
 * Displays comprehensive information about a specific event
 * Handles user interactions like participation, favoriting, and admin actions
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebaseConfig";

/**
 * Event Details Screen Component
 * Displays detailed information about a specific event and provides interaction options
 * Features include event participation, favoriting, and admin controls
 * 
 * @param {Object} props - Component props
 * @param {Object} props.route - Navigation route object containing event data
 * @param {Object} props.navigation - Navigation object for screen transitions
 * @returns {React.ReactElement} Rendered component
 */
export default function EventDetails({ route, navigation }) {
  // Extract event data from navigation params
  const { event } = route.params;
  // Get current user from auth context
  const { user } = useAuth();

  // State management
  const [isAdmin, setIsAdmin] = useState(false);           // User's admin status
  const [eventDetails, setEventDetails] = useState(event); // Current event data
  const [isParticipant, setIsParticipant] = useState(false); // User's participation status
  const [favorited, setFavorited] = useState(false);      // Event's favorite status

  /**
   * Check user's admin status
   * Queries Firestore to determine if the current user has admin privileges
   */
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      if (doc.exists && doc.data().isAdmin === true) {
        setIsAdmin(true);
      }
    });
  }, [user.uid]);

  /**
   * Real-time event data subscription
   * Listens for changes in event details and updates UI accordingly
   * Also checks user's participation status in the event
   */
  useEffect(() => {
    const unsubscribe = database
      .collection("events")
      .doc(event.id)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const updated = { id: doc.id, ...doc.data() };
          setEventDetails(updated);
          setIsParticipant(updated.participants?.includes(user.uid));
        }
      });

    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, [event.id, user.uid]);

  /**
   * Check event's favorite status
   * Queries user's favorites collection to determine if this event is favorited
   */
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      const favs = doc.exists ? doc.data().favorites || [] : [];
      setFavorited(favs.includes(event.id));
    });
  }, [event.id, user.uid]);

  /**
   * Toggle user's participation in the event
   * Adds or removes the current user from the event's participants list
   * Updates the UI and shows confirmation message
   */
  const handleToggleParticipation = async () => {
    try {
      const ref = database.collection("events").doc(eventDetails.id);
      // Update participants list based on current status
      const updated = isParticipant
        ? eventDetails.participants.filter((id) => id !== user.uid)
        : [...eventDetails.participants, user.uid];

      await ref.update({ participants: updated });
      setIsParticipant(!isParticipant);
      Alert.alert(isParticipant ? "Participação cancelada." : "Participação confirmada.");
    } catch (err) {
      console.error("Error toggling participation:", err);
      Alert.alert("Error updating participation status.");
    }
  };

  /**
   * Toggle event's favorite status for the current user
   * Adds or removes the event from user's favorites list
   * Updates the UI and shows confirmation message
   */
  const handleToggleFavorite = async () => {
    try {
      const ref = database.collection("users").doc(user.uid);
      const doc = await ref.get();
      if (!doc.exists) return;

      // Get current favorites and update based on status
      const favs = doc.data().favorites || [];
      const updated = favorited
        ? favs.filter((id) => id !== event.id)
        : [...favs, event.id];

      await ref.update({ favorites: updated });
      setFavorited(!favorited);

      Alert.alert(favorited ? "Removed from favorites." : "Added to favorites.");
    } catch (err) {
      console.error("Error updating favorites:", err);
      Alert.alert("Error updating favorites.");
    }
  };

  /**
   * Handle event deletion
   * Shows confirmation dialog before deleting
   * Only available to admin users
   */
  const handleDeleteEvent = async () => {
    Alert.alert("Confirm", "Delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await database.collection("events").doc(eventDetails.id).delete();
            Alert.alert("Event deleted successfully.");
            navigation.goBack();
          } catch (err) {
            console.error("Error deleting event:", err);
            Alert.alert("Error deleting event.");
          }
        },
      },
    ]);
  };

  return (
    <ImageBackground
      source={require("../assets/home.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: eventDetails.imageUrl }} style={styles.image} />
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.starButton}>
            <Text style={styles.star}>{favorited ? "⭐" : "☆"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{eventDetails.title}</Text>
        <Text style={styles.date}>
          {eventDetails.datetime && typeof eventDetails.datetime.toDate === 'function'
            ? new Date(eventDetails.datetime.toDate()).toLocaleDateString("pt-PT")
            : new Date(eventDetails.datetime).toLocaleDateString("pt-PT")} às{" "}
          {eventDetails.datetime && typeof eventDetails.datetime.toDate === 'function'
            ? new Date(eventDetails.datetime.toDate()).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date(eventDetails.datetime).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
        </Text>
        <Text style={styles.location}>📌 {eventDetails.location}</Text>
        <Text style={styles.description}>{eventDetails.description}</Text>
        <Text style={styles.participants}>
          Participants: {eventDetails.participants?.length || 0}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleToggleParticipation}>
          <Text style={styles.buttonText}>
            {isParticipant ? "Cancelar participação" : "Participar"}
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#5e17eb" }]}
            onPress={() =>
              navigation.navigate("EditarEvento", { event: eventDetails })
            }
          >
            <Text style={styles.buttonText}>Editar Evento</Text>
          </TouchableOpacity>
        )}

        {isAdmin && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#EF4444" }]}
            onPress={handleDeleteEvent}
          >
            <Text style={styles.buttonText}>Apagar Evento</Text>
          </TouchableOpacity>
        )}
        
      </ScrollView>
      <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => navigation.navigate("Eventos")}>
            <Text style={styles.bottomText}>🏛️{"\n"}Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Favoritos")}>
            <Text style={styles.bottomText}>⭐{"\n"}Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
            <Text style={styles.bottomText}>😊{"\n"}Perfil</Text>
          </TouchableOpacity>
        </View> 
    </ImageBackground>
  );
}

/**
 * Styles for the EventDetails component
 * Defines layout, colors, and visual properties
 */
const styles = StyleSheet.create({
  // Main container background
  background: { flex: 1 },
  // Semi-transparent overlay for content
  overlay: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  // Event image styles
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  // Favorite button styles
  starButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 6,
  },
  // Star icon styles
  star: { fontSize: 22 },
  // Event title text styles
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  // Event date text styles
  date: {
    fontSize: 16,
    color: "#F3F4F6",
    textAlign: "center",
    marginBottom: 4,
  },
  // Event location text styles
  location: {
    fontSize: 16,
    color: "#F3F4F6",
    textAlign: "center",
    marginBottom: 16,
  },
  // Event description text styles
  description: {
    fontSize: 16,
    color: "#E5E7EB",
    marginBottom: 20,
    lineHeight: 22,
  },
  // Participants count text styles
  participants: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  // Action button styles (participate, edit, delete)
  button: {
    backgroundColor: "#5e17eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
  },
  // Action button text styles
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  // Bottom navigation bar styles
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#5e17eb",
    elevation: 8,
  },
  // Bottom navigation text styles
  bottomText: {
    fontSize: 18,
    textAlign: "center",
    color: "#FFFFFF",
  },
});
