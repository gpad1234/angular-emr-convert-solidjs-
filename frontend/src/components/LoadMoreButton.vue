<template>
  <div class="mt-3">
    <button v-if="hasMore" @click="$emit('click')" class="btn-primary w-full flex items-center justify-center gap-2">
      <span v-if="!isLoading">{{ label || 'Load More' }}</span>
      <span v-else>Loading...</span>
    </button>
  </div>
</template>

<script setup>
defineProps({ isLoading: Boolean, hasMore: Boolean, label: String })
</script>
