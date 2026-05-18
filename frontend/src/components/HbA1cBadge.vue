<template>
  <div>
    <div :class="['inline-flex items-center justify-center rounded-full px-3 py-1', colorClass]">
      <span class="font-semibold">{{ value != null ? value.toFixed(1) : '—' }}%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ value: Number, size: { type: String, default: 'md' } })
const colorClass = computed(() => {
  if (props.value == null) return 'bg-gray-100 text-gray-500'
  return props.value < 7 ? 'bg-green-100 text-green-800' : (props.value < 8.5 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
})
</script>
