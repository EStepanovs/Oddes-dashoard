<template>
  <div class="app-layout">
    <!-- Navigation -->
    <nav>
      <div class="container nav-container">
        <div>
          <h1>Dashboard</h1>
        </div>
        <div class="nav-links">
          <button @click="handleLogout" class="logout-btn" :disabled="loggingOut">
            <span v-if="loggingOut" class="loading-spinner"></span>
            <span v-else>Logout</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <div class="container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loggingOut = ref(false);

const handleLogout = async () => {
  loggingOut.value = true;
  try {
    await authStore.signOut();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    loggingOut.value = false;
  }
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  transform: translateY(-1px);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 14px;
  height: 14px;
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
