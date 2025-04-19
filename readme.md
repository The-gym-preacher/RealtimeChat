# 🔧 Step-by-Step Supabase Setup & Integration

## 🧱 1. Create a Supabase Project

Go to https://supabase.com

Log in with GitHub or another method.

Click New Project: Name your project

Choose Region

Set a strong Database Password (store this safely)

Wait for Supabase to set it up.

## 🔐 2. Enable Authentication
In the Supabase dashboard:

Navigate to **Authentication** > **Providers**

Enable Email authentication.

*Optionally*, **go to Auth** > **Settings** and **configure**:

Site URL: http://localhost:3000 (or wherever you test)

Confirm Email Redirect: Optional for now

## 🗃️ 3. Create Tables for Messages

In SQL Editor, paste this:

```sql
-- Users are managed automatically by Supabase Auth
-- Create Messages Table
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  username text,
  content text,
  created_at timestamp with time zone default now()
);

-- Enable realtime
alter table messages enable row level security;
create policy "Allow all" on messages for select using (true);
create policy "Insert messages" on messages for insert using (auth.uid() = user_id);
```
## 📦 4. Install Supabase JS Library

Run this in your project root:

```bash
npm install @supabase/supabase-js
```
## 🧩 5. Connect Supabase in your firebase.js (rename it to supabase.js)
```js
// supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
Get supabaseUrl and anon-key from Settings > API.
```
## 👥 6. Signup & Login
In your signup.js, login.js and Chat.js; do:

### Sign Up
```js
// Sign-up.js
import { supabase } from './supabase.js';

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usernameEl = document.getElementById('username');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const errorEl = document.getElementById('error-message');

  const username = usernameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  // Check if username already exists in your custom "users" table
  const { data: userWithUsername } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (userWithUsername) {
    errorEl.textContent = 'Username is already taken.';
    errorEl.classList.remove('hidden');
    return;
  }

  // Sign up the user using Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }, // store in user_metadata
    },
  });

  if (error) {
    errorEl.textContent = 'Signup failed: ' + error.message;
    errorEl.classList.remove('hidden');
    return;
  }

  // Add the user into the custom "users" table
  const userId = data.user?.id;
  if (userId) {
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: userId, username }]);

    if (insertError) {
      errorEl.textContent = 'Error saving user data: ' + insertError.message;
      errorEl.classList.remove('hidden');
      return;
    }
  }

  // Success
  errorEl.classList.add('hidden');
  console.log('Signup successful:', data);
  window.location.href = '/webpage/login.html';
});
```
### Sign In
```js
// login.js
import { supabase } from './supabase.js'

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const emailEl = document.getElementById('email')
  const passwordEl = document.getElementById('password')
  const errorEl = document.getElementById('error-message')

  let input = emailEl.value.trim()
  const password = passwordEl.value
  let emailToUse = input

  if (!input.includes('@')) {
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('username', input)
      .single()

    if (error || !user) {
      errorEl.textContent = 'Login failed: Username not found.'
      errorEl.classList.remove('hidden')
      emailEl.value = ''
      passwordEl.value = ''
      return
    }

    emailToUse = user.email
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password,
  })

  if (error) {
    errorEl.textContent = 'Login failed: ' + error.message
    errorEl.classList.remove('hidden')
    emailEl.value = ''
    passwordEl.value = ''
    return
  }

  errorEl.classList.add('hidden')
  console.log('Login successful:', data)
  window.location.href = '/webpage/chat.html'
})
```
### Chat & Messages
```js
// Chat.js
import { supabase } from './supabase.js';

const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const activeUsersList = document.getElementById('activeUsers');
const sidebar = document.getElementById('sidebar');

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
      window.location.href = '/webpage/login.html';
    }, 800);
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
    window.location.href = '/webpage/login.html';
    return;
  }
  currentUser = data.user;
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
      li.className = 'bg-[#1a1a28] p-3 rounded-md text-sm';
      li.textContent = user.username;
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

  data.forEach(displayMessage);
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
function displayMessage({ user_id, content, username }) {
  const isOwn = user_id === currentUser.id;

  const messageDiv = document.createElement('div');
  messageDiv.className = `max-w-[75%] px-4 py-2 rounded-xl ${
    isOwn
      ? 'bg-orange-700 self-end text-right rounded-br-none'
      : 'bg-[#2c2c3c] self-start text-left rounded-bl-none'
  }`;

  const name = document.createElement('div');
  name.className = 'text-xs text-gray-300 mb-1 font-semibold';
  name.textContent = isOwn ? 'You' : username;

  const msg = document.createElement('p');
  msg.className = 'break-words';
  msg.textContent = content;

  messageDiv.appendChild(name);
  messageDiv.appendChild(msg);

  const wrapper = document.createElement('div');
  wrapper.className = `flex ${isOwn ? 'justify-end' : 'justify-start'}`;
  wrapper.appendChild(messageDiv);

  messagesContainer.appendChild(wrapper);
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
```