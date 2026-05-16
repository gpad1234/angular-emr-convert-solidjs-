<template>
  <router-link :to="`/patients/${patient.id}`" class="block">
    <div class="card flex items-center gap-3">
      <div class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span class="font-bold">{{ initials }}</span>
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-gray-800">{{ patient.first_name }} {{ patient.last_name }}</p>
            <p class="text-xs text-gray-400">{{ patient.gender }} · {{ patient.age || '' }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold">{{ patient.latest_hba1c ? patient.latest_hba1c.value_percent.toFixed(1) + '%' : '—' }}</p>
            <p class="text-xs text-gray-400">HbA1c</p>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
const props = defineProps({ patient: Object })
const initials = (() => {
  const p = props.patient || {}
  return (p.first_name ? p.first_name[0] : '') + (p.last_name ? p.last_name[0] : '')
})()
</script>
