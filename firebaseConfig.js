/**
 * Firebase Configuration Module
 * Sets up and exports Firebase instances for authentication and database
 */

import firebase from "firebase";

/**
 * Firebase configuration object
 * Contains credentials and settings for Firebase services
 * @type {Object}
 */
const firebaseConfig = {
  apiKey: "AIzaSyDKd2L7b8pitOut0FUDzUrVr1jn6dfc2V0",
  authDomain: "eventbuddy-f40a4.firebaseapp.com",
  projectId: "eventbuddy-f40a4",
  storageBucket: "eventbuddy-f40a4.firebasestorage.app",
  messagingSenderId: "883715889747",
  appId: "1:883715889747:web:d2bbc3c686d7d9845304a6",
  measurementId: "G-H7KT6P4RK9"
};

// Initialize Firebase only if no instance exists
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase service instances
export const database = firebase.firestore(); // Firestore database instance
export const auth = firebase.auth();          // Firebase Auth instance
export default firebase;                      // Main Firebase instance


