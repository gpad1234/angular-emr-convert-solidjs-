<template>
  <span :class="badgeClass" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ label }}</span>
</template>

<script setup>
const props = defineProps({ type: String, size: { type: String, default: 'md' } })
const map = {
  'Type 1': { label: 'Type 1', badgeClass: 'bg-blue-100 text-blue-800' },
  'Type 2': { label: 'Type 2', badgeClass: 'bg-purple-100 text-purple-800' },
}
const conf = map[props.type] || { label: props.type || 'Other', badgeClass: 'bg-gray-100 text-gray-700' }
const label = conf.label
const badgeClass = conf.badgeClass
</script>
