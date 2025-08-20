/**
 * Firebase Authentication Service Module
 * Provides authentication-related functions using Firebase Auth
 */

import { auth } from "../firebaseConfig";

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<UserCredential>} Firebase auth user credential
 */
export const signUp = async (email, password) => {
  return await auth.createUserWithEmailAndPassword(email, password);
};

/**
 * Sign in existing user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<UserCredential>} Firebase auth user credential
 */
export const signIn = async (email, password) => {
  return await auth.signInWithEmailAndPassword(email, password);
};



