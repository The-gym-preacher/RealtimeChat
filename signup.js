import {
    auth,
    db,
    collection,
    addDoc,
    createUserWithEmailAndPassword
  } from './firebase.js';
  
  window.signup = async function (event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Store user info in Firestore
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email,
        username,
        profilePic: '', // default
      });
  
      alert('Account created!');
      window.location.href = 'index.html';
    } catch (error) {
      alert(error.message);
    }
  };
  