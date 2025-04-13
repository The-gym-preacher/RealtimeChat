import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";


const firebaseConfig = {
    apikey: "AIzaSyBIH9Uu5f8ZAKmgYaVzA1AkF_Er0i3QngM",
    authDomain: "troisidiot-755c0.firebaseapp.com",
    projectId: "troisidiot-755c0",
    storageBucket: "troisidiot-755c0.firebasestorage.app",
    messagingSenderId: "535712535929",
    appId: "1:535712535929 :web : b01be2b8de0ebbc8ed0ba8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export { app, auth, db, storage, signInWithEmailAndPassword, onAuthStateChanged, collection, addDoc, onSnapshot, query, orderBy, ref, uploadBytes, getDownloadURL };
