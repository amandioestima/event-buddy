/**
 * Authentication Context Module
 * Provides authentication state and functions throughout the app
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../firebaseConfig";

// Create a context for authentication with empty default value
const AuthContext = createContext({});

/**
 * Custom hook to access auth context
 * Provides easier access to auth context throughout the app
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider Component
 * Manages authentication state and provides auth-related functions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with auth context
 */
export const AuthProvider = ({ children }) => {
  // State for current user and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Effect hook to handle Firebase authentication state changes
   * Sets up a listener for auth state changes and updates local state accordingly
   */
  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

