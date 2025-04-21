import { supabase } from './supabase.js';

const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const activeUsersList = document.getElementById('activeUsers');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mobileUserAvatar = document.getElementById('mobileUserAvatar');

// =========================
// Mobile Sidebar Toggle
// =========================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
  }
}

// Make toggleSidebar available globally
window.toggleSidebar = toggleSidebar;

// Close sidebar on window resize if it gets to desktop size
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth >= 768 && sidebar && !sidebar.classList.contains('-translate-x-full')) {
    toggleSidebar();
  }
});

let currentUser = null;

// =========================
// Logout Confirmation Popup
// =========================
window.logout = function () {
  const confirmBox = document.createElement('div');
  confirmBox.className = 'fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50';
  confirmBox.innerHTML = `
    <div class="bg-[#1e1e2f] p-6 rounded-xl shadow-lg w-80 text-white text-center">
      <h2 class="text-lg font-semibold mb-4">Are you sure you want to logout?</h2>
      <div class="flex justify-center gap-6">
        <button id="confirmLogout" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md">Logout <span id="log" class="bi bi-door-open"></span></button>
        <button id="cancelLogout" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(confirmBox);

  document.getElementById('confirmLogout').onclick = async () => {
    await supabase.auth.signOut();
    document.getElementById('log').classList.replace('bi-door-open','bi-door-closed');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  };

  document.getElementById('cancelLogout').onclick = () => {
    confirmBox.remove();
  };
};

// =========================
// Load Current User Info
// =========================
async function loadCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    window.location.href = '/login.html';
    return;
  }
  currentUser = data.user;

  // Update UI with user info
  const username = currentUser.user_metadata.username || currentUser.email;
  const userInitial = username[0].toUpperCase();
  document.getElementById('currentUserName').textContent = username;
  document.getElementById('currentUserAvatar').textContent = userInitial;
  // Update mobile avatar
  if (mobileUserAvatar) {
    mobileUserAvatar.textContent = userInitial;
  }
}

// =========================
// Load Active Users
// =========================
async function loadActiveUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .neq('id', currentUser.id); // exclude self
    if (error) throw error;

    activeUsersList.innerHTML = '';
    data.forEach(user => {
      const li = document.createElement('li');
      li.className = 'flex items-center gap-3 p-2.5 bg-[#1f1f30] hover:bg-[#2a2a3d] rounded-lg cursor-pointer transition-all group';
      
      // Create user avatar
      const avatar = document.createElement('div');
      avatar.className = 'w-9 h-9 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-glow group-hover:scale-105 transition-transform';
      avatar.textContent = user.username[0].toUpperCase();

      // Create user info container
      const userInfo = document.createElement('div');
      userInfo.className = 'flex-1 flex items-center justify-between';
      
      // Add username
      const username = document.createElement('div');
      username.className = 'text-sm font-medium text-gray-200';
      username.textContent = user.username;

      // Add online indicator
      const status = document.createElement('div');
      status.className = 'w-2 h-2 rounded-full bg-green-400 animate-pulse';

      userInfo.appendChild(username);
      userInfo.appendChild(status);
      
      li.appendChild(avatar);
      li.appendChild(userInfo);
      activeUsersList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading users:', err.message);
  }
}

// =========================
// Load Chat History
// =========================
async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, user_id, username, inserted_at')
    .order('inserted_at', { ascending: true });

  if (error) {
    console.error('Failed to load messages:', error.message);
    return;
  }

  // Clear existing messages
  const messagesList = document.getElementById('messagesList');
  if (messagesList) messagesList.innerHTML = '';

  if (data.length === 0) {
    document.getElementById('noMessages').style.display = 'flex';
  } else {
    document.getElementById('noMessages').style.display = 'none';
    data.forEach(displayMessage);
  }
  scrollToBottom();
}

// =========================
// Send a Message
// =========================
window.sendMessage = async function () {
  const content = messageInput.value.trim();
  if (!content || !currentUser) return;

  const username = currentUser.user_metadata.username || currentUser.email;

  const { error } = await supabase
    .from('messages')
    .insert({ user_id: currentUser.id, content, username });

  if (error) console.error('Error sending message:', error.message);
  else messageInput.value = '';
};

// =========================
// Display a Message
// =========================
function displayMessage({ user_id, content, username, inserted_at }) {
  // Hide the 'no messages' placeholder if it's visible
  const noMessages = document.getElementById('noMessages');
  if (noMessages) noMessages.style.display = 'none';

  // Get the messages list container
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;

  // Clone the message template
  const template = document.getElementById('messageTemplate');
  const messageEl = template.content.cloneNode(true);

  // Get references to the elements we need to update
  const messageDiv = messageEl.querySelector('.message-appear');
  const avatar = messageEl.querySelector('.flex-shrink-0 div');
  const sender = messageEl.querySelector('.message-sender');
  const time = messageEl.querySelector('.message-time');
  const content_el = messageEl.querySelector('.message-content');

  // Set the message content
  content_el.textContent = content;
  sender.textContent = user_id === currentUser.id ? 'You' : username;

  // Set the time
  const messageTime = new Date(inserted_at);
  time.textContent = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Set avatar initial
  avatar.textContent = (username || 'U')[0].toUpperCase();

  // Add appropriate styling for own messages
  if (user_id === currentUser.id) {
    messageDiv.classList.add('bg-gradient-to-r', 'from-pink-600/10', 'to-purple-600/10');
  }

  // Append the message
  messagesList.appendChild(messageEl);
  scrollToBottom();
}

// =========================
// Scroll to Bottom
// =========================
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// =========================
// Real-time Updates
// =========================
function subscribeToMessages() {
  supabase
    .channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      displayMessage(payload.new);
    })
    .subscribe();
}

// =========================
// Sidebar Toggle (Optional UI Enhancer)
// =========================
const toggleBtn = document.createElement('button');
toggleBtn.innerHTML = '<i class="bi bi-list text-xl"></i>';
toggleBtn.className = 'md:hidden absolute top-20 left-4 z-10 bg-[#202030] p-2 rounded-md';
document.body.appendChild(toggleBtn);

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
});

// =========================
// Init Everything
// =========================
(async function init() {
  await loadCurrentUser();
  await loadActiveUsers();
  await loadMessages();
  subscribeToMessages();
})();
