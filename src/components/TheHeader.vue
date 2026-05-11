<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { currentLang, langLabels, setLang, t, type Lang } from '../i18n';

const props = defineProps<{
  currentView: string;
}>();

const emit = defineEmits<{
  navigate: [view: string];
}>();

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const isLangOpen = ref(false);

const langKeys = Object.keys(langLabels) as Lang[];
const selectedLangLabel = computed(() => langLabels[currentLang.value]);

const navItems = [
  { key: 'notices', labelKey: 'Notices' },
  { key: 'faq', labelKey: 'FAQ' },
  { key: 'contact', labelKey: 'Contact Us' },
];

// Figma 로고 에셋 (node 4-4757 desktop / 46-2354 mobile)
const imgLogo = import.meta.env.BASE_URL + 'images/logo.png';

// GNB는 홈 뷰 + 스크롤 전에만 투명(흰 텍스트), 나머지는 흰 배경(다크 텍스트)
const isTransparent = computed(
  () => !isScrolled.value && props.currentView === 'home' && !isMobileMenuOpen.value,
);

function handleScroll() {
  isScrolled.value = window.scrollY > 60;
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
}

function navigate(view: string) {
  emit('navigate', view);
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }));
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<template>
  <!-- position: fixed so it overlays the hero -->
  <header class="gnb" :class="isTransparent ? 'gnb--transparent' : 'gnb--solid'">
    <div class="gnb-inner">
      <!-- Logo: icon + "Customer Support" text -->
      <button class="gnb-logo-btn" @click="navigate('home')">
        <!-- Desktop: 40×40 icon + gap 8px -->
        <img :src="imgLogo" alt="" class="gnb-logo-icon gnb-logo-icon--desktop" />
        <!-- Mobile: 32×32 icon + gap 4px -->
        <img :src="imgLogo" alt="" class="gnb-logo-icon gnb-logo-icon--mobile" />
        <span class="gnb-logo-text">Customer Support</span>
      </button>

      <!-- Desktop Nav -->
      <nav class="desktop-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-btn"
          :class="currentView === item.key ? 'nav-btn--active' : ''"
          @click="navigate(item.key)"
        >
          {{ t(item.labelKey) }}
        </button>

        <!-- Language Dropdown -->
        <div style="position: relative">
          <button class="nav-btn lang-btn" @click="isLangOpen = !isLangOpen">
            {{ selectedLangLabel }}
            <svg
              class="chevron-icon"
              :class="{ 'chevron-icon--open': isLangOpen }"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 7.5l5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div v-if="isLangOpen" class="lang-backdrop" @click="isLangOpen = false" />
          <div v-if="isLangOpen" class="lang-dropdown">
            <button
              v-for="lang in langKeys"
              :key="lang"
              class="lang-option"
              :class="{ 'lang-option--active': currentLang === lang }"
              @click="
                setLang(lang);
                isLangOpen = false;
              "
            >
              {{ langLabels[lang] }}
              <svg
                v-if="currentLang === lang"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style="flex-shrink: 0; color: #863dff"
              >
                <path
                  d="M2 7l3.5 3.5L12 3"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile Hamburger -->
      <button class="mobile-hamburger" @click="toggleMobileMenu">
        <svg
          style="width: 24px; height: 24px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <template v-if="!isMobileMenuOpen">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </template>
          <template v-else>
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </template>
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <div class="mobile-menu-backdrop" @click="toggleMobileMenu" />
      <div style="display: flex; flex-direction: column; gap: 4px; padding: 24px 24px 0">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="mobile-menu-item"
          @click="navigate(item.key)"
        >
          {{ t(item.labelKey) }}
        </button>
      </div>
      <div style="display: flex; flex-direction: column; padding: 24px 24px 0">
        <p class="mobile-lang-label">Language</p>
        <button
          v-for="lang in langKeys"
          :key="lang"
          class="mobile-lang-item"
          @click="setLang(lang)"
        >
          {{ langLabels[lang] }}
          <svg
            v-if="currentLang === lang"
            style="width: 20px; height: 20px; color: #863dff"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ── Base GNB ── */
.gnb {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition:
    background-color 0.35s ease,
    box-shadow 0.35s ease;
}

/* 홈 + 스크롤 전: 완전 투명, 텍스트 흰색 */
.gnb--transparent {
  background-color: transparent;
  box-shadow: none;
}

/* 스크롤 후 or 다른 페이지: 흰 배경 */
.gnb--solid {
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ── Inner container ── */
.gnb-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 16px;
}
@media (min-width: 768px) {
  .gnb-inner {
    height: auto;
    padding: 14px 120px;
  }
}

/* ── Logo button ── */
.gnb-logo-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
@media (min-width: 768px) {
  .gnb-logo-btn {
    gap: 8px;
  }
}

/* ── Logo icon ── */
.gnb-logo-icon {
  display: block;
  flex-shrink: 0;
  object-fit: contain;
}
.gnb-logo-icon--mobile {
  width: 32px;
  height: 32px;
}
.gnb-logo-icon--desktop {
  display: none;
  width: 40px;
  height: 40px;
}
@media (min-width: 768px) {
  .gnb-logo-icon--mobile {
    display: none;
  }
  .gnb-logo-icon--desktop {
    display: block;
  }
}

/* ── Logo text ── */
.gnb-logo-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 40px;
  white-space: nowrap;
  transition: color 0.35s ease;
}
.gnb--transparent .gnb-logo-text {
  color: #fcfdfd;
}
.gnb--solid .gnb-logo-text {
  color: #111417;
}

/* 아이콘은 투명/solid 상태 모두 원본 컬러 유지 (보라색 로고 그대로) */

/* ── Desktop Nav ── */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 24px;
}
@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

/* ── Nav Buttons ── */
.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  min-width: 40px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition:
    color 0.35s ease,
    background-color 0.15s;
  text-decoration: none;
}
.gnb--transparent .nav-btn {
  color: #fcfdfd;
}
.gnb--solid .nav-btn {
  color: #111417;
}

/* active 표시 */
.nav-btn--active {
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* hover: 투명 상태에서는 흰색 반투명, solid에서는 다크 반투명 */
.gnb--transparent .nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
.gnb--solid .nav-btn:hover {
  background-color: rgba(17, 20, 23, 0.06);
}
.gnb--transparent .nav-btn:active {
  background-color: rgba(255, 255, 255, 0.25);
}
.gnb--solid .nav-btn:active {
  background-color: rgba(17, 20, 23, 0.12);
}

/* ── Chevron Icon ── */
.chevron-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.chevron-icon--open {
  transform: rotate(180deg);
}

/* ── Language Dropdown ── */
.lang-btn {
  white-space: nowrap;
}

.lang-backdrop {
  position: fixed;
  inset: 0;
  z-index: 39;
}

.lang-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 180px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f1f3f5;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 40;
  overflow: hidden;
}

.lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  text-align: left;
  background: transparent;
  color: #495057;
}
.lang-option--active {
  background-color: #efe8fd;
  color: #863dff;
}
.lang-option:hover:not(.lang-option--active) {
  background-color: #f8f9fa;
}

/* ── Mobile Hamburger ── */
.mobile-hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.35s ease;
  padding: 0;
}
.gnb--transparent .mobile-hamburger {
  color: #fcfdfd;
}
.gnb--solid .mobile-hamburger {
  color: #111417;
}

@media (min-width: 768px) {
  .mobile-hamburger {
    display: none;
  }
}

/* ── Mobile Menu ── */
.mobile-menu {
  position: fixed;
  inset: 0;
  top: 64px;
  z-index: 40;
  background: #fff;
}
.mobile-menu-backdrop {
  position: fixed;
  inset: 0;
  top: 64px;
  z-index: -1;
}
.mobile-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  text-align: left;
  font-size: 20px;
  font-weight: 700;
  line-height: 32px;
  color: #212529;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  width: 100%;
}
.mobile-lang-label {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #adb5bd;
  margin: 0 0 4px 0;
}
.mobile-lang-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #212529;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0;
}
</style>
