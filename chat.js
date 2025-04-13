import {
    auth,
    db,
    onAuthStateChanged,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy
  } from './firebase.js';
  
  const messagesContainer = document.getElementById('messagesContainer');
  const messageInput = document.getElementById('messageInput');
  
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'index.html';
    } else {
      loadMessages();
    }
  });
  
  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
  
    await addDoc(collection(db, 'messages'), {
      uid: auth.currentUser.uid,
      message,
      timestamp: new Date(),
      displayName: auth.currentUser.email,
    });
  
    messageInput.value = '';
  }
  
  function loadMessages() {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
  
    onSnapshot(q, (snapshot) => {
      messagesContainer.innerHTML = '';
      snapshot.forEach((doc) => {
        const msg = doc.data();
        const msgEl = document.createElement('div');
        msgEl.className = "bg-[#2f2f46] p-3 rounded-lg max-w-lg";
  
        msgEl.innerHTML = `
          <div class="text-sm text-teal-400 font-bold">${msg.displayName}</div>
          <div class="text-white">${msg.message}</div>
        `;
        messagesContainer.appendChild(msgEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    });
  }
  
  window.logout = function () {
    auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  };
  
  window.sendMessage = sendMessage;
  