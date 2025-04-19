// index.js
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