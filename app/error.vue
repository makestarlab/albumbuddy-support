<script setup lang="ts">
defineProps<{ error: { statusCode: number; message: string } }>();

function handleError() {
  clearError({ redirect: '/' });
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <h1 class="text-3xl font-bold mb-4">{{ error.statusCode }}</h1>
    <p class="text-gray-600 mb-6">{{ error.message }}</p>
    <button
      class="px-6 h-12 rounded-lg bg-[#863dff] text-white font-bold"
      @click="handleError"
    >
      홈으로
    </button>
  </div>
</template>
