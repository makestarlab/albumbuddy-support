<script setup lang="ts">
// 자동 import: t (i18n.ts)
</script>

<template>
  <footer class="bg-gray-005">
    <div
      class="mx-auto flex max-w-[1440px] flex-col gap-7 px-6 pb-[60px] pt-8 md:px-[100px]"
    >
      <div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col gap-2">
          <span class="text-base font-bold leading-6 tracking-[-0.3px] text-gray-050">
            AlbumBuddy
          </span>
          <p
            class="m-0 whitespace-pre-line text-sm font-semibold leading-5 tracking-[-0.3px] text-gray-040"
          >
            {{ t('footer-desc') }}
          </p>
        </div>

        <nav class="flex flex-wrap items-center gap-5 md:flex-nowrap md:gap-11">
          <NuxtLink
            to="/notices?type=terms"
            class="text-sm font-bold leading-5 tracking-[-0.3px] text-gray-050 hover:text-gray-060"
          >
            {{ t('이용약관') }}
          </NuxtLink>
          <NuxtLink
            to="/notices?type=privacy"
            class="text-sm font-bold leading-5 tracking-[-0.3px] text-gray-050 hover:text-gray-060"
          >
            {{ t('개인정보 처리방침') }}
          </NuxtLink>
        </nav>
      </div>

      <div class="h-px bg-gray-010" />

      <div class="flex flex-col gap-1">
        <span class="text-sm font-semibold leading-5 tracking-[-0.3px] text-gray-040">
          Sponsored by
        </span>
        <span class="text-base font-extrabold tracking-[-0.5px] text-gray-040">Makestar</span>
      </div>
    </div>
  </footer>
</template>
