<template>
  <div>
    <div v-if="medications.length===0" class="text-sm text-gray-500">No active medications</div>
    <ul v-else class="space-y-2">
      <li v-for="m in medications" :key="m.id" class="card">
        <div class="flex justify-between">
          <div>
            <p class="font-semibold">{{ m.name }}</p>
            <p class="text-xs text-gray-500">{{ m.dose }} • {{ m.frequency }}</p>
          </div>
          <div class="text-xs text-gray-400">{{ m.status || '' }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({ medications: { type: Array, default: () => [] } })
</script>
