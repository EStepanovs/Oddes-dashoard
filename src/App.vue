<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  // Handle auth state from email links
  const { data, error } = await supabase.auth.getSession();
  if (data?.session) {
    authStore.user = data.session.user;
    authStore.session = data.session;
    router.push('/');
  }
  
  authStore.initializeAuth();
  authStore.setupAuthListener();
});
</script>

<template>
  <div v-if="authStore.loading" class="loading-screen">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
  <RouterView v-else />
</template>

<style scoped>
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #0a0a0a 100%);
}

.loading-content {
  text-align: center;
  color: #e5e7eb;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
