can u maybe shift<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to access your dashboard</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>
        </div>

        <div v-if="message" class="success-message">
          <div class="success-content">
            <span class="success-icon">✅</span>
            <span>{{ message }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="loading || !email || !password"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>Sign In</span>
        </button>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')

const clearMessages = () => {
  error.value = ''
  message.value = ''
}

const handleSubmit = async () => {
  clearMessages()
  loading.value = true

  try {
    await authStore.signIn(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #111111 0%, #1a1a1a 50%, #111111 100%);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: rgba(25, 25, 25, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(50, 50, 50, 0.8);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: bold;
  color: #ffffff;
}

.auth-header p {
  margin: 0;
  color: #888888;
  font-size: 0.875rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message, .success-message {
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.error-message {
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(139, 0, 0, 0.5);
}

.success-message {
  background: rgba(0, 100, 0, 0.2);
  border: 1px solid rgba(0, 100, 0, 0.5);
}

.error-content, .success-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-content {
  color: #ff6b6b;
}

.success-content {
  color: #51cf66;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
}

.form-input {
  padding: 0.75rem;
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(60, 60, 60, 0.8);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #555555;
  box-shadow: 0 0 0 3px rgba(80, 80, 80, 0.3);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #666666;
}

.submit-btn {
  padding: 0.75rem;
  background: linear-gradient(135deg, #1a1a1a, #000000);
  color: white;
  border: 1px solid #333333;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #333333, #1a1a1a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>