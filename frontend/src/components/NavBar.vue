<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
    <div class="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
        <router-link to="/" class="flex flex-col items-center text-sm text-gray-600" @click="handleClick('home')">
          <span>🏠</span>
          <span>Home</span>
        </router-link>

        <router-link to="/patients" class="flex flex-col items-center text-sm text-gray-600" @click="handleClick('patients')">
          <span>👤</span>
          <span>Patients</span>
        </router-link>

        <router-link to="/settings" class="flex flex-col items-center text-sm text-gray-600" @click="handleClick('settings')">
          <span>⚙️</span>
          <span>Settings</span>
        </router-link>
      </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
// router-link used in template; import kept for potential future programmatic navigation
const router = useRouter()

function handleClick(target) {
  // dispatch a global event to notify pages to refresh or react
  try {
    window.dispatchEvent(new CustomEvent('app-refresh', { detail: { from: 'nav', target } }))
  } catch (e) {
    // ignore in non-browser env
  }
}
</script>
