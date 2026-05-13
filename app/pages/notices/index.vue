<script setup lang="ts">
import type { NoticePost, NoticeDetail, NoticeLang } from '~/composables/useNotices';
// 자동 import: ref, computed, watch, onMounted, onUnmounted, useRoute,
//   useNoticePosts, fetchNoticeDetail, filterPostsByLang, currentLang, t, CancelCircleMono

useHead({ title: '공지사항 — AlbumBuddy Support' });

const { currentId, clearNoticeId } = useNoticeQuery();

const { data: postsData, pending: loading, error: fetchError } = await useNoticePosts();
const posts = computed<NoticePost[]>(() => postsData.value ?? []);
const error = computed(() => !!fetchError.value);

const selectedDetail = ref<NoticeDetail | null>(null);
const currentPost = ref<NoticePost | null>(null);
const detailLoading = ref(false);
const searchQuery = ref('');
const activeCategory = ref('All');

// 현재 언어에 맞는 변형만 필터링 (언어 바뀌면 자동 반영)
const visiblePosts = computed(() =>
  filterPostsByLang(posts.value, currentLang.value as NoticeLang),
);

// 카테고리 목록 (중복 제거)
const categories = computed(() => {
  const cats = [...new Set(visiblePosts.value.map((p) => p.category).filter(Boolean))];
  return ['All', ...cats];
});

const filteredPosts = computed(() => {
  let result = visiblePosts.value;
  if (activeCategory.value !== 'All') {
    result = result.filter((p) => p.category === activeCategory.value);
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    result = result.filter((p) => p.title.toLowerCase().includes(q));
  }
  return result;
});

const isSearching = computed(() => searchQuery.value.trim().length > 0);

async function autoOpenFromQuery() {
  const id = currentId.value;
  if (!id) return;
  const visible = filterPostsByLang(posts.value, currentLang.value as NoticeLang);
  const match = visible.find((p) => p.id === id);
  if (match) await openPost(match);
}

onMounted(autoOpenFromQuery);

// query 변경 (예: footer에서 다른 공지로 이동) 감지
watch(currentId, autoOpenFromQuery);

async function openPost(post: NoticePost) {
  currentPost.value = post;
  detailLoading.value = true;
  try {
    selectedDetail.value = await fetchNoticeDetail(post.slug);
  } catch {
    selectedDetail.value = { title: post.title, date: post.date, contentHtml: '' };
  } finally {
    detailLoading.value = false;
  }
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  selectedDetail.value = null;
  currentPost.value = null;
  clearNoticeId();
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 상세 보기 중 언어 변경 시 같은 그룹의 새 언어 버전으로 재fetch
watch(currentLang, async () => {
  if (!currentPost.value) return;
  const sameGroup = visiblePosts.value.find((p) => p.groupIdx === currentPost.value!.groupIdx);
  if (sameGroup && sameGroup.slug !== currentPost.value.slug) {
    await openPost(sameGroup);
  }
});
</script>

<template>
  <div class="min-h-screen bg-white pt-16">
    <!-- ── Detail View ─────────────────────────────────────────── -->
    <template v-if="selectedDetail">
      <div class="board-container">
        <h1 class="board-title font-bold text-gray-099">
          {{ t('Notices') }}
        </h1>

        <div v-if="detailLoading" class="py-12 text-center text-[#adb5bd]">
          불러오는 중...
        </div>
        <template v-else>
          <div class="board-detail-content">
            <div class="board-post-header">
              <h2 class="m-0 text-xl font-bold leading-8 text-[#212529]">
                {{ selectedDetail.title }}
              </h2>
              <p class="m-0 text-sm font-semibold leading-5 text-[#868e96]">
                {{ selectedDetail.date }}
              </p>
            </div>

            <div
              v-if="selectedDetail.contentHtml"
              class="board-post-body"
              v-html="selectedDetail.contentHtml"
            />
            <p v-else class="py-8 text-[15px] text-[#868e96]">
              내용을 불러오지 못했습니다.
            </p>

            <button class="back-btn" @click="goBack">
              {{ t('목록으로 돌아가기') }}
            </button>
          </div>
        </template>
      </div>
    </template>

    <!-- ── List View ──────────────────────────────────────────── -->
    <template v-else>
      <div class="board-container">
        <h1 class="board-title font-bold text-gray-099">
          {{ t('Notices') }}
        </h1>

        <!-- Search bar (sticky) -->
        <div class="notices-bar">
          <div class="notices-bar-inner">
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
                placeholder="Search notices"
                class="faq-search-input"
                @input="searchQuery = ($event.target as HTMLInputElement).value"
              />
              <button v-if="searchQuery" class="faq-search-clear" @click="searchQuery = ''">
                <CancelCircleMono class="h-5 w-5" />
              </button>
            </div>

            <div v-if="!isSearching" class="notices-chips">
              <button
                v-for="cat in categories"
                :key="cat"
                class="notices-chip border"
                :class="
                  activeCategory === cat
                    ? 'border-purple-040 bg-purple-040 text-white'
                    : 'border-[#f1f3f5] bg-[#f1f3f5] text-[#212529]'
                "
                @click="activeCategory = cat"
              >
                {{ cat === 'All' ? t('All') : t(cat) }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="py-12 text-center text-[#adb5bd]">
          불러오는 중...
        </div>

        <p v-else-if="error" class="py-10 text-[15px] text-[#868e96]">
          공지사항을 불러오지 못했습니다.
        </p>

        <template v-else>
          <div class="board-list">
            <article
              v-for="post in filteredPosts"
              :key="post.id"
              class="board-post-item"
              @click="openPost(post)"
            >
              <h3 class="board-post-title mx-0 mb-1 mt-0 font-bold text-gray-099">
                {{ post.title }}
              </h3>
              <p class="m-0 text-sm font-semibold leading-5 text-gray-050">
                {{ post.date }}
              </p>
            </article>
          </div>

          <p v-if="filteredPosts.length === 0" class="py-10 text-center text-[#868e96]">
            {{ isSearching ? 'No results found.' : '게시글이 없습니다.' }}
          </p>

        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.board-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 32px 24px 100px;
}
.board-title {
  font-size: 32px;
  line-height: 48px;
  margin-bottom: 16px;
}
.board-list > * + * {
  border-top: 1px solid #e1e6ea;
}
.board-post-item {
  padding: 24px 0;
  cursor: pointer;
  transition: background-color 0.15s;
}
.board-post-item:hover {
  background-color: #f8f9fa;
}
.board-post-title {
  font-size: 16px;
  line-height: 24px;
}
.board-post-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 0;
  border-bottom: 1px solid #dee2e6;
}
.board-post-body {
  padding: 32px 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #000000;
}
.board-post-body :deep(p) {
  margin: 0;
  min-height: 24px;
}
.board-post-body :deep(ul) {
  list-style: disc;
  margin: 4px 0;
  padding-left: 24px;
}
.board-post-body :deep(ol) {
  list-style: decimal;
  margin: 4px 0;
  padding-left: 24px;
}
.board-post-body :deep(ul ul) {
  list-style: circle;
}
.board-post-body :deep(ul ul ul) {
  list-style: square;
}
.board-post-body :deep(li) {
  margin: 2px 0;
  display: list-item; /* Tailwind preflight가 li display 손대는 경우 대비 */
}
.board-post-body :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  margin: 24px 0 8px;
}
.board-post-body :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  margin: 20px 0 8px;
}
.board-post-body :deep(h3) {
  font-size: 18px;
  font-weight: 700;
  margin: 16px 0 8px;
}
.board-post-body :deep(blockquote) {
  border-left: 3px solid #e9ecef;
  padding: 8px 16px;
  margin: 8px 0;
  color: #495057;
}
.board-post-body :deep(hr) {
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 16px 0;
}
.board-post-body :deep(figure) {
  margin: 16px 0;
}
.board-post-body :deep(figcaption) {
  font-size: 14px;
  color: #868e96;
  text-align: center;
  margin-top: 8px;
}
.board-post-body :deep(pre) {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
}
.board-post-body :deep(.callout) {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 8px 0;
}
/* Chips */
.notices-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.notices-chips::-webkit-scrollbar {
  display: none;
}
.notices-chip {
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
  border: none;
  font-family: inherit;
}
.notices-chip:hover {
  opacity: 0.85;
}

/* Sticky search bar — CSS sticky로 브라우저가 처리 (JS 토글 불필요) */
.notices-bar {
  position: sticky;
  top: 64px; /* nav 높이 */
  z-index: 20;
  background-color: #ffffff;
  padding: 12px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.notices-bar-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
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
  font-family: inherit;
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

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background-color: #dee2e6;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #000000;
  padding: 12px 16px;
  font-family: inherit;
}
.back-btn:hover {
  background-color: #ced4da;
}

@media (min-width: 768px) {
  .board-container {
    padding: 80px 120px 200px;
  }
  .board-title {
    font-size: 60px;
    line-height: 78px;
    margin-bottom: 32px;
  }
  .board-post-title {
    font-size: 18px;
    line-height: 28px;
  }
  .board-post-header {
    gap: 8px;
    padding: 24px 0;
  }
  .board-detail-content {
    max-width: 100%;
  }
  .notices-chips {
    flex-wrap: wrap;
    overflow-x: visible;
  }
  .notices-chip {
    height: 48px;
    padding: 10px 20px;
  }
  .notices-bar--stuck {
    padding: 12px 120px;
  }
}
</style>
