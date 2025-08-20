// Import required navigation components from React Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import all screens components
import LoginScreen from "./screens/Login";
import SignupScreen from "./screens/Signup";
import HomeScreen from "./screens/Home";
import FavoritosScreen from "./screens/Favoritos";
import PerfilScreen from "./screens/Perfil";
import EventDetails from "./screens/EventDetails";
import EditarEvento from "./screens/EditarEvento";

// Import authentication context provider and hook
import { AuthProvider, useAuth } from "./context/AuthContext";

// Create a stack navigator instance for managing screen navigation
const Stack = createStackNavigator();

/**
 * AppNavigator Component
 * Handles the main navigation structure of the app
 * Implements conditional rendering based on authentication state
 */
function AppNavigator() {
  // Get authentication state and loading status from auth context
  const { user, loading } = useAuth();

  // Show nothing while authentication state is being determined
  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen
  name="Eventos"
  component={HomeScreen}
  options={{ title: "Eventos", headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFFFFF", headerTitleAlign: "center" }}
/>
          <Stack.Screen name="Favoritos" component={FavoritosScreen}
          options={{ title: "Favoritos", headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFFFFF", headerTitleAlign: "center" }}
           />
          <Stack.Screen name="Perfil" component={PerfilScreen}
          options={{ title: "Perfil", headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFFFFF", headerTitleAlign: "center" }}
           />
          <Stack.Screen name="EventDetails" component={EventDetails} 
          options={{ title: "Detalhes",headerStyle: { backgroundColor: "#5e17eb" }, headerTintColor: "#FFFFFF", headerTitleAlign: "center" }} />
          <Stack.Screen name="EditarEvento" component={EditarEvento}
    options={{ title: "Editar Evento" }}
  />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
  name="Login"
  component={LoginScreen}
  options={{
    title: "Login",
    headerStyle: { backgroundColor: "#5e17eb" },
    headerTintColor: "#FFFFFF",
    headerTitleAlign: "center",
  }}
/>
          <Stack.Screen name="Signup" component={SignupScreen} options={{
    title: "Registe-se",
    headerStyle: { backgroundColor: "#5e17eb" },
    headerTintColor: "#FFFFFF",
    headerTitleAlign: "center",
  }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}





