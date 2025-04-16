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
  apiKey: "AIzaSyBAVH9GOpF7zzOrgOGuO__PSFhtVGUmt4g",
  authDomain: "troisidiot-preacher.firebaseapp.com",
  projectId: "troisidiot-preacher",
  storageBucket: "troisidiot-preacher.firebasestorage.app",
  messagingSenderId: "1075577991177",
  appId: "1:1075577991177:web:e0d9bf2760ffda60b2c8d8"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export { app, auth, db, storage, signInWithEmailAndPassword, onAuthStateChanged, collection, addDoc, onSnapshot, query, orderBy, ref, uploadBytes, getDownloadURL };
