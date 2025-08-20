/**
 * @fileoverview Home Screen Component
 * Main screen of the EventBuddy application
 * Displays a list of events with search functionality and admin controls
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebaseConfig";
import CriarEvento from "./CriarEvento"; // CreateEvent component

/**
 * Home Screen Component
 * Main screen displaying list of events with search and filtering capabilities
 * Provides admin functionality for event creation and management
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen transitions
 */
export default function Home({ navigation }) {
  // Get current user from auth context
  const { user } = useAuth();
  // Reference for scroll view to enable scrolling to top
  const scrollRef = useRef(null);

  // State management
  const [events, setEvents] = useState([]); // List of all events
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [showForm, setShowForm] = useState(false); // Toggle event creation form
  const [isAdmin, setIsAdmin] = useState(false); // User admin status
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");
  const [favoritos, setFavoritos] = useState([]);
  const [search, setSearch] = useState("");

  // Check if user is admin
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      if (doc.exists && doc.data().isAdmin === true) {
        setIsAdmin(true);
      }
    });
  }, [user.uid]);

  // Load events in real-time
  useEffect(() => {
    const unsubscribe = database
      .collection("events")
      .orderBy("datetime", "asc")
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(data);
        setLoading(false);
      });
    return () => unsubscribe();
  }, []);

  // Load user's favorites
  useEffect(() => {
    const ref = database.collection("users").doc(user.uid);
    ref.get().then((doc) => {
      if (doc.exists) {
        setFavoritos(doc.data().favoritos || []);
      }
    });
  }, [user.uid]);

  // Show toast message
  const showToastMessage = (message) => {
    setToastText(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  /**
   * Toggle favorite status for an event
   * Adds or removes the event from user's favorites list
   * Updates the UI and database accordingly
   * 
   * @param {string} eventId - The ID of the event to toggle
   */
  const toggleFavorito = async (eventId) => {
    const ref = database.collection("users").doc(user.uid);
    const isFav = favoritos.includes(eventId);
    const updatedFavorites = isFav
      ? favoritos.filter((id) => id !== eventId)
      : [...favoritos, eventId];
    setFavoritos(updatedFavorites);
    try {
      await ref.update({ favoritos: updatedFavorites });
      showToastMessage(isFav ? "Retirado dos Favoritos." : "Acrescentado aos Favoritos.");
    } catch {
      Alert.alert("Error updating favorites.");
    }
  };

  /**
   * Filter events based on search input
   * Case-insensitive search in event titles
   */
  const filteredEvents = events.filter((evt) =>
    evt.title.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * Render individual event item
   * Creates a card display for each event with image, details, and favorite button
   * 
   * @param {Object} params - Item render parameters
   * @param {Object} params.item - Event data to render
   * @returns {React.ReactElement} Rendered event card
   */
  const renderItem = ({ item }) => {
    const isFav = favoritos.includes(item.id);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("EventDetails", { event: item })}
      >
        <View style={styles.card}>
          <View style={styles.cardImageWrapper}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <TouchableOpacity
              onPress={() => toggleFavorito(item.id)}
              style={styles.favButton}
            >
              <Text style={{ fontSize: 20 }}>{isFav ? "⭐" : "☆"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>
              {item.datetime && typeof item.datetime.toDate === 'function' 
                ? `${new Date(item.datetime.toDate()).toLocaleDateString("pt-PT")} às ${new Date(item.datetime.toDate()).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : new Date(item.datetime).toLocaleDateString("pt-PT") + " às " + 
                  new Date(item.datetime).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
              }
            </Text>
            <Text style={styles.cardLocation}>📌 {item.location}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 50 }}
        size="large"
        color="#ed128d"
      />
    );
  }

  return (
    <ImageBackground
      source={require("../assets/home.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastText}</Text>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        ref={scrollRef}
      >
        {/* Search bar for filtering events */}
        <TextInput
          style={styles.searchBar}
          placeholder="Procurar Eventos por nome"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />

        {/* Create Event button (admin only) */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.createButtonText}>
              {showForm ? "Cancelar" : "Criar novo Evento"}
            </Text>
          </TouchableOpacity>
        )}

        {showForm && <CriarEvento onSuccess={() => setShowForm(false)} />}

        {/* Filtered events list */}
        {filteredEvents.length === 0 ? (
          <Text style={styles.emptyText}>
            {search
              ? "No events found."
              : "No events available."}
          </Text>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {    }
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
 * StyleSheet for the Home screen component
 * Defines all visual styles for the screen's elements
 */
const styles = StyleSheet.create({
  // Toast notification styles
  toast: {
    position: "absolute",
    top: 40,
    left: "10%",
    right: "10%",
    backgroundColor: "#10B981", // Success green color
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    zIndex: 999, // Ensure toast appears above other elements
  },
  toastText: { color: "#FFFFFF", fontWeight: "bold", textAlign: "center" },

  // Search bar input field styles
  searchBar: {
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.9)", // Semi-transparent white
    fontSize: 16,
    color: "#333",
  },

  // Create event button styles
  createButton: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  // Create event button text styles
  createButtonText: {
    color: "#ed128d", // Pink accent color
    fontWeight: "bold",
    fontSize: 16,
  },

  // Event card container styles
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  // Container for card image and favorite button
  cardImageWrapper: { position: "relative" },
  // Event image styles
  cardImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  // Favorite button styles
  favButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.85)", // Semi-transparent white
    borderRadius: 20,
    padding: 6,
  },
  // Card content container styles
  cardBody: { padding: 12 },
  // Event title styles
  cardTitle: { fontSize: 18, fontWeight: "600" },
  // Event date styles
  cardDate: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  // Event location styles
  cardLocation: { fontSize: 14, color: "#374151", marginTop: 4 },
  // Event description styles
  cardDesc: { fontSize: 14, color: "#4B5563", marginTop: 6 },

  // Empty state text styles
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
    color: "#999", // Light gray color
  },

  // Bottom navigation bar container styles
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
    borderColor: "#E5E7EB", // Light border color
    backgroundColor: "#5e17eb", // Primary purple color
    elevation: 8, // Android shadow
  },
  // Bottom navigation text styles
  bottomText: {
    fontSize: 18,
    textAlign: "center",
    color: "#FFFFFF", // White text
  },
});



