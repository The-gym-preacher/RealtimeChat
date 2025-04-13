import {
    auth,
    signInWithEmailAndPassword
  } from './firebase.js';
  
  window.login = async function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'chat.html';
    } catch (error) {
      alert(error.message);
    }
  };
  