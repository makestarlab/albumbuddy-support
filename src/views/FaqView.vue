<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { CancelCircleMono, HelpMono } from '../icons';
import { faqs } from '../lib/faqData';
import { trackClick } from '../lib/faqClickTracker';
import { fetchFaqItems } from '../lib/faqSupabase';
import { t, currentLang } from '../i18n';

const emit = defineEmits<{ navigate: [view: string] }>();

const activeCategory = ref('All');
const expandedSet = ref<Set<number>>(new Set());
const searchQuery = ref('');

// ── Notion 데이터 상태 ──────────────────────────────────────────
const notionItems = ref<Awaited<ReturnType<typeof fetchFaqItems>>>([]);
const notionLoading = ref(true);
const notionError = ref(false);

// ── 통합 표시 아이템 타입 ────────────────────────────────────────
interface DisplayItem {
  id?: string;
  q: string;
  a: string;
  category: string;
}

const isSearching = computed(() => searchQuery.value.trim().length > 0);

// 현재 언어로 필터된 아이템 (DB order_index 순서 그대로)
const langItems = computed<DisplayItem[]>(() => {
  if (!notionError.value && notionItems.value.length > 0) {
    const lang = currentLang.value;
    return notionItems.value
      .map((item) => ({
        id: item.id,
        q: item.questions[lang] || '',
        a: item.answers[lang] || '',
        category: item.category,
      }))
      .filter((item) => item.q);
  }
  return faqs.map((f) => ({ q: f.q, a: f.a, category: f.category }));
});

// 카테고리 목록 (등장 순서)
const categories = computed(() => {
  const cats = [...new Set(langItems.value.map((i) => i.category).filter(Boolean))];
  return ['All', ...cats];
});

const filteredItems = computed<DisplayItem[]>(() => {
  if (isSearching.value) {
    const q = searchQuery.value.trim().toLowerCase();
    return langItems.value.filter(
      (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q),
    );
  }
  if (activeCategory.value === 'All') return langItems.value;
  return langItems.value.filter((i) => i.category === activeCategory.value);
});

// 검색 중일 때 답변 포함 항목 자동 펼치기
watch(filteredItems, (results) => {
  if (!isSearching.value) return;
  const q = searchQuery.value.trim().toLowerCase();
  const newSet = new Set<number>();
  results.forEach((item, idx) => {
    if (item.a.toLowerCase().includes(q)) newSet.add(idx);
  });
  expandedSet.value = newSet;
});

// 언어 변경 시 카테고리/펼침 초기화
watch(currentLang, () => {
  activeCategory.value = 'All';
  expandedSet.value = new Set();
});

// 카테고리 목록 변경 시 현재 카테고리가 없으면 초기화
watch(categories, (cats) => {
  if (!cats.includes(activeCategory.value)) {
    activeCategory.value = 'All';
  }
});

// Sticky bar logic
const stickyRef = ref<HTMLElement | null>(null);
const isStuck = ref(false);
const stickyHeight = ref(0);
let stickyOriginalTop = 0;

function handleScroll() {
  isStuck.value = window.scrollY > stickyOriginalTop - 64;
}

function measureBar() {
  if (stickyRef.value) {
    stickyHeight.value = stickyRef.value.offsetHeight;
    stickyOriginalTop = stickyRef.value.getBoundingClientRect().top + window.scrollY;
  }
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  requestAnimationFrame(measureBar);

  try {
    notionItems.value = await fetchFaqItems();
  } catch {
    notionError.value = true;
  } finally {
    notionLoading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

function selectCategory(cat: string) {
  activeCategory.value = cat;
  expandedSet.value = new Set();
}

function toggleFaq(idx: number) {
  const s = new Set(expandedSet.value);
  const isExpanding = !s.has(idx);
  if (s.has(idx)) s.delete(idx);
  else s.add(idx);
  expandedSet.value = s;

  if (isExpanding) {
    const item = filteredItems.value[idx];
    // 클릭 즉시 누적 저장 (표시 순서는 1시간마다만 반영)
    trackClick(item.id ?? item.q);
  }
}

function highlight(text: string): string {
  if (!isSearching.value) return text;
  const q = searchQuery.value.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<span style="color: #6204fb">$1</span>');
}
</script>

<template>
  <div class="faq-root" style="background-color: #ffffff; min-height: 100vh; padding-top: 64px">
    <div class="faq-container">
      <!-- 1) Title + Contact Us button -->
      <div class="faq-header-top">
        <h1 class="faq-title" style="color: #212529; font-weight: 700; margin: 0">FAQ</h1>
        <button
          class="contact-btn"
          style="
            background-color: transparent;
            color: #111417;
            border: 1.5px solid #c4cdd3;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          "
          @click="emit('navigate', 'contact')"
        >
          <HelpMono style="width: 24px; height: 24px; flex-shrink: 0" />
          Contact Us
        </button>
      </div>

      <!-- 2) Search + Chips bar (sticky) -->
      <div ref="stickyRef" class="faq-bar" :class="{ 'faq-bar--stuck': isStuck }">
        <div class="faq-bar-inner">
          <div class="faq-search-wrap">
            <svg
              class="faq-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              :value="searchQuery"
              type="text"
              placeholder="Search questions"
              class="faq-search-input"
              @input="searchQuery = ($event.target as HTMLInputElement).value"
            />
            <button
              v-if="searchQuery"
              class="faq-search-clear"
              @click="
                searchQuery = '';
                expandedSet = new Set();
              "
            >
              <CancelCircleMono style="width: 20px; height: 20px" />
            </button>
          </div>

          <div v-if="!isSearching" class="faq-chips">
            <button
              v-for="cat in categories"
              :key="cat"
              class="faq-chip"
              :style="
                activeCategory === cat
                  ? { backgroundColor: '#863dff', color: '#ffffff', border: '1px solid #863dff' }
                  : { border: '1px solid #f1f3f5', backgroundColor: '#f1f3f5', color: '#212529' }
              "
              @click="selectCategory(cat)"
            >
              {{ cat === 'All' ? t('All') : t(cat) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Spacer when bar is fixed -->
      <div v-if="isStuck" :style="{ height: stickyHeight + 'px' }" />

      <!-- 3) Loading state -->
      <div v-if="notionLoading" class="faq-loading">
        <div class="faq-loading-spinner" />
      </div>

      <!-- 4) FAQ List -->
      <div v-else class="faq-list">
        <div v-for="(item, idx) in filteredItems" :key="item.id ?? idx" class="faq-item">
          <button class="faq-btn" @click="toggleFaq(idx)">
            <span
              class="faq-q"
              style="color: #212529; font-weight: 700"
              v-html="'Q. ' + highlight(item.q)"
            />
            <div class="faq-icon">
              <svg
                class="faq-chevron"
                :class="expandedSet.has(idx) && 'faq-chevron-open'"
                style="color: #adb5bd"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>
          <div v-if="expandedSet.has(idx)" class="faq-answer">
            <p
              class="faq-a"
              style="color: #868e96; font-weight: 700; margin: 0; white-space: pre-line"
              v-html="'A. ' + highlight(item.a)"
            />
          </div>
        </div>

        <p
          v-if="filteredItems.length === 0"
          style="color: #868e96; padding: 40px 0; text-align: center"
        >
          {{ isSearching ? 'No results found.' : 'No articles in this category.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 24px 100px;
}

.faq-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.faq-title {
  font-size: 32px;
  line-height: 48px;
}

.contact-btn {
  font-size: 16px;
  line-height: 24px;
  padding: 0 14px;
  height: 48px;
  transition: background-color 0.15s;
}
.contact-btn:hover {
  background-color: rgba(76, 90, 102, 0.08) !important;
}
.contact-btn:active {
  background-color: rgba(76, 90, 102, 0.2) !important;
}

/* Search + Chips bar */
.faq-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}
.faq-bar--stuck {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: #ffffff;
  padding: 12px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.faq-bar--stuck .faq-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.faq-bar-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Search input */
.faq-search-wrap {
  display: flex;
  align-items: center;
  height: 48px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0 16px;
}
.faq-search-icon {
  width: 20px;
  height: 20px;
  color: #adb5bd;
  flex-shrink: 0;
  margin-right: 8px;
}
.faq-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  line-height: 24px;
  color: #212529;
}
.faq-search-input::placeholder {
  color: #adb5bd;
}
.faq-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #adb5bd;
  flex-shrink: 0;
  padding: 0;
}

/* Chips */
.faq-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.faq-chips::-webkit-scrollbar {
  display: none;
}
.faq-chip {
  padding: 0 14px;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  cursor: pointer;
  white-space: nowrap;
  height: 40px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.faq-chip:hover {
  opacity: 0.85;
}

/* Loading */
.faq-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
.faq-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f3f5;
  border-top-color: #863dff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* FAQ list */
.faq-list {
  margin-top: 16px;
}
.faq-list > * + * {
  border-top: 1px solid #dee2e6;
}
.faq-item {
  padding: 20px 0;
}
.faq-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.faq-q {
  font-size: 16px;
  line-height: 24px;
}
.faq-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}
.faq-chevron {
  width: 20px;
  height: 20px;
  transition: transform 0.2s;
}
.faq-chevron-open {
  transform: rotate(180deg);
}
.faq-answer {
  margin-top: 12px;
}
.faq-a {
  font-size: 14px;
  line-height: 20px;
}

/* Desktop */
@media (min-width: 768px) {
  .faq-container {
    padding: 80px 120px 200px;
  }
  .faq-header-top {
    margin-bottom: 32px;
  }
  .faq-title {
    font-size: 60px;
    line-height: 78px;
  }
  .contact-btn {
    font-size: 18px;
    line-height: 28px;
    height: 56px;
    padding: 0 14px;
  }
  .faq-chips {
    flex-wrap: wrap;
    overflow-x: visible;
  }
  .faq-chip {
    height: 48px;
    padding: 10px 20px;
  }
  .faq-bar--stuck {
    padding: 12px 120px;
  }
  .faq-list {
    margin-top: 24px;
  }
  .faq-item {
    padding: 24px 0;
  }
  .faq-q {
    font-size: 20px;
    line-height: 32px;
  }
  .faq-answer {
    margin-top: 16px;
  }
  .faq-a {
    font-size: 16px;
    line-height: 24px;
  }
}
</style>
