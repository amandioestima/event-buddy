import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { database } from "../firebaseConfig";

/**
 * Profile Screen Component
 * Displays user profile information and event participation history
 * Provides options for account management and settings
 * 
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen transitions
 */
export default function Perfil({ navigation }) {
  const { user, logout } = useAuth();
  const [participatingEvents, setParticipatingEvents] = useState([]);

  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    const unsubscribe = database
      .collection("events")
      .where("participants", "array-contains", user.uid)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParticipatingEvents(data);
      });

    return () => unsubscribe();
  }, [user, navigation]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5e17eb" />
        <Text style={{ marginTop: 12, color: "#FFFFFF" }}>Carregando perfil...</Text>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Tem certeza que deseja fazer Logout?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            console.error("Erro ao deslogar:", err);
            Alert.alert("Erro ao sair da conta.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetails", { event: item })}
    >
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
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

  return (
    <ImageBackground
      source={require("../assets/home.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.heading}>😊 Perfil</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>UID:</Text>
        <Text style={styles.value}>{user.uid}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.subheading}>Eventos em que é participante:</Text>

        {participatingEvents.length === 0 ? (
          <Text style={styles.empty}>
            Você ainda não está participando de eventos.
          </Text>
        ) : (
          <FlatList
            data={participatingEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
          />
        )}
      </ScrollView>

      {   }
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 120,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heading: {
    fontSize: 26,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 28,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#F3F4F6",
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 12,
  },
  subheading: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  empty: {
    color: "#F3F4F6",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 16,
    lineHeight: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 24,
  },
  list: {
    paddingBottom: 24,
  },
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
  image: {
    height: 160,
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#5e17eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
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



