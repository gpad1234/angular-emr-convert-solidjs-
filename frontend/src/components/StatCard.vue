<template>
  <component :is="to ? 'router-link' : 'div'" :to="to" class="block">
    <div class="card text-center cursor-pointer" role="button">
      <div class="text-2xl">{{ icon }}</div>
      <p class="stat-number mt-1 font-semibold">{{ value }}</p>
      <p class="text-xs text-gray-500 mt-0.5">{{ label }}</p>
    </div>
  </component>
</template>

<script setup>
const props = defineProps({ label: String, value: [String, Number], icon: String, to: { type: String, default: null } })
</script>
