import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebaseConfig";

/**
 * Favorites Screen Component
 * Displays and manages user's favorited events
 * Allows users to view and remove events from their favorites list
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen transitions
 */
export default function Favoritos({ navigation }) {
  // Get current user from auth context
  const { user } = useAuth();
  // State management
  const [favorites, setFavorites] = useState([]); // List of favorited events
  const [loading, setLoading] = useState(true); // Loading state for data fetching

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const userDoc = await database.collection("users").doc(user.uid).get();
        const favIds = userDoc.exists ? userDoc.data().favoritos || [] : [];

        if (favIds.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        const eventsRef = database
          .collection("events")
          .where("__name__", "in", favIds);

        const snapshot = await eventsRef.get();
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => {
          const dateA = a.datetime && typeof a.datetime.toDate === 'function' ? a.datetime.toDate() : new Date(a.datetime);
          const dateB = b.datetime && typeof b.datetime.toDate === 'function' ? b.datetime.toDate() : new Date(b.datetime);
          return dateA - dateB;
        });

        setFavorites(data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
        setFavorites([]);
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user.uid]);

  const removerFavorito = async (eventId) => {
    try {
      const userRef = database.collection("users").doc(user.uid);
      const doc = await userRef.get();
      if (!doc.exists) return;

      const atual = doc.data().favoritos || [];
      const atualizados = atual.filter((id) => id !== eventId);

      await userRef.update({ favoritos: atualizados });

      setFavorites((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      Alert.alert("Erro", "Não foi possível remover este evento dos favoritos.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetails", { event: item })}
    >
      <View style={styles.card}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <TouchableOpacity
            onPress={() => removerFavorito(item.id)}
            style={styles.starButton}
          >
            <Text style={styles.star}>⭐</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>
            {item.datetime && typeof item.datetime.toDate === 'function'
              ? new Date(item.datetime.toDate()).toLocaleDateString("pt-PT")
              : new Date(item.datetime).toLocaleDateString("pt-PT")} às{" "}
            {item.datetime && typeof item.datetime.toDate === 'function'
              ? new Date(item.datetime.toDate()).toLocaleTimeString("pt-PT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date(item.datetime).toLocaleTimeString("pt-PT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.heading}>Favoritos</Text>

        {favorites.length === 0 ? (
          <Text style={styles.empty}>Nenhum evento favorito.</Text>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}

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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 80,
    
  },
  heading: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 28,
    color: "#FFFFFF",
  },
  empty: {
  textAlign: "center",
  fontSize: 20,
  fontWeight: "500",
  color: "#FFF",
  marginTop: 120,
  paddingHorizontal: 24,
  lineHeight: 28,
},
  list: { paddingBottom: 16 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { height: 160, width: "100%" },
  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  date: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  starButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    padding: 6,
  },
  star: { fontSize: 20 },
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
  bottomText: {
    fontSize: 18,
    textAlign: "center",
    color: "#FFFFFF",
  },
});

