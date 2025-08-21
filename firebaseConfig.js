/**
 * Firebase Configuration Module
 * This module serves as the central configuration point for Firebase services in the EventBuddy app.
 * It initializes Firebase with the necessary credentials and exports configured service instances.
 * 
 * @module firebaseConfig
 */

// Import the core Firebase library
import firebase from "firebase";

// Import environment variables for Firebase configuration
// These values are stored in .env file and accessed via @env package
// This approach keeps sensitive credentials secure and out of version control
/***
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';
***/

/**
 * Firebase configuration object
 * Contains all necessary credentials and settings for Firebase services
 * Values are loaded from environment variables to keep sensitive data secure
 * 
 * @type {Object}
 * @property {string} apiKey - Firebase API key for project authentication
 * @property {string} authDomain - Firebase Auth domain for authentication flows
 * @property {string} projectId - Unique identifier for the Firebase project
 * @property {string} storageBucket - Storage bucket for Firebase Storage
 * @property {string} messagingSenderId - Firebase Cloud Messaging sender ID
 * @property {string} appId - Firebase application ID
 * @property {string} measurementId - Google Analytics measurement ID
 */
/***
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};
***/

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKd2L7b8pitOut0FUDzUrVr1jn6dfc2V0",
  authDomain: "eventbuddy-f40a4.firebaseapp.com",
  projectId: "eventbuddy-f40a4",
  storageBucket: "eventbuddy-f40a4.firebasestorage.app",
  messagingSenderId: "883715889747",
  appId: "1:883715889747:web:d2bbc3c686d7d9845304a6",
  measurementId: "G-H7KT6P4RK9"
};

/**
 * Initialize Firebase application
 * This check prevents multiple initializations of Firebase
 * Firebase will throw an error if initialized more than once
 */
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

// Export configured Firebase service instances for use throughout the app

/**
 * Firestore Database instance
 * Used for storing and retrieving application data
 * Provides real-time updates and offline persistence
 * @const {firebase.firestore.Firestore}
 */
export const database = firebase.firestore();

/**
 * Firebase Authentication instance
 * Handles user authentication and session management
 * Supports email/password, OAuth providers, and anonymous auth
 * @const {firebase.auth.Auth}
 */
export const auth = firebase.auth();

/**
 * Default export of initialized Firebase instance
 * Provides access to core Firebase functionality
 * @const {firebase.app.App}
 */
export default firebase;



