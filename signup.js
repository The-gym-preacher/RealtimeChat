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
