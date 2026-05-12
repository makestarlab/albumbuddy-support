<script setup lang="ts">
import { faqs, popularityOrder, categoryKeyMap } from '~/lib/faqData';
import type { FaqNotionItem } from '~/composables/useFaqs';
// 자동 import: ref, computed, watch, onMounted, onUnmounted, useFaqs, t, currentLang, NuxtLink, NuxtImg

useHead({ title: 'AlbumBuddy Support' });

const { data: notionFaqItemsData } = await useFaqs();
const notionFaqItems = computed<FaqNotionItem[]>(() => notionFaqItemsData.value ?? []);

// ── 로컬 폴백 (Supabase 응답 없을 때) ──────────────────────────
function buildLocalTopFaqs() {
  return popularityOrder.slice(0, 5).map((i) => {
    const faq = faqs[i];
    return { q: faq.q, a: faq.a, category: categoryKeyMap[faq.category] ?? '기타 문의' };
  });
}

// ── Supabase FAQ 처음 5개 (DB order_index 순서) ─────────────────
function buildTopFaqs(lang: string) {
  const seenId = new Set<string>();
  const seenQ = new Set<string>();
  return notionFaqItems.value
    .map((i) => ({
      id: i.id,
      q: i.questions[lang] || i.questions['en'] || '',
      a: i.answers[lang] || i.answers['en'] || '',
      category: i.category,
    }))
    .filter((i) => {
      if (!i.q) return false;
      if (seenId.has(i.id) || seenQ.has(i.q)) return false;
      seenId.add(i.id);
      seenQ.add(i.q);
      return true;
    })
    .slice(0, 5);
}

function refreshTopFaqs() {
  if (notionFaqItems.value.length > 0) {
    const top = buildTopFaqs(currentLang.value);
    if (top.length > 0) {
      topFaqs.value = top;
      return;
    }
  }
  topFaqs.value = buildLocalTopFaqs();
}

const topFaqs = ref<Array<{ q: string; a: string; category: string }>>([]);
const topFaqsLoading = ref(true);
const expandedFaq = ref<Set<number>>(new Set());

function toggleFaq(idx: number) {
  const s = new Set(expandedFaq.value);
  if (s.has(idx)) s.delete(idx);
  else s.add(idx);
  expandedFaq.value = s;
}

// 언어 변경 시 top FAQ 재계산
watch(currentLang, refreshTopFaqs);

// useFaqs는 await로 받아왔으니 mount 시점에 이미 채워져 있음
refreshTopFaqs();
topFaqsLoading.value = false;

// 언어 변경 시 + 데이터 변경 시 재계산
watch(notionFaqItems, refreshTopFaqs);

const proxySteps = computed(() => [
  t('구매대행 step1'),
  t('구매대행 step2'),
  t('구매대행 step3'),
  t('구매대행 step4'),
]);

const shippingSteps = computed(() => [
  t('배송대행 step1'),
  t('배송대행 step2'),
  t('배송대행 step3'),
  t('배송대행 step4'),
]);

// ── 이미지 경로 ─────────────────────────────────────────────────
const imgHeroBg = 'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com/media/2026/05/320dc473-b790-4a77-8c05-7cfa8639ea8e.png';
const imgHeroBgMobile = 'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com/media/2026/05/5787dcb2-5dfa-4b6c-92cb-0498dc5b5abb.png';
const imgLogo = '/images/logo.png';

const imgPhone1Desktop = 'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com/media/2026/05/4c4e46df-c105-4964-b620-aad96e70d506.png';
const imgPhone2Desktop =
      'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com/media/2026/05/8a41cb3e-044d-4a2b-b144-89eba640f500.png';

const imgPhone1Mobile = 'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com/media/2026/05/46f160ca-0469-46dc-b6e2-e5ba9bcf7d48.png';
const imgPhone2Mobile = 'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com/media/2026/05/10c51467-3606-470a-99f9-934ec359f4d0.png'; // 배송대행 440×894

const imgCta =
  'https://warwiqpssw4f1yzy.public.blob.vercel-storage.com/media/2026/05/a3f0e223-0dbf-4f54-a04d-ed8d22a4daa1.png';

// ── Hero LCP preload (NuxtImg는 srcset 자동 생성, 여기선 첫 페인트용 preload만 추가)
const img = useImage();

useHead({
  link: () => {
    const desktopWidths = [1024, 1280, 1536, 1920];
    const mobileWidths = [375, 640, 828];

    const desktopSrcset = desktopWidths
      .map((w) => `${img(imgHeroBg, { width: w, quality: 75 })} ${w}w`)
      .join(', ');
    const mobileSrcset = mobileWidths
      .map((w) => `${img(imgHeroBgMobile, { width: w, quality: 75 })} ${w}w`)
      .join(', ');

    return [
      {
        rel: 'preload',
        as: 'image',
        imagesrcset: desktopSrcset,
        imagesizes: '100vw',
        media: '(min-width: 768px)',
        fetchpriority: 'high',
      },
      {
        rel: 'preload',
        as: 'image',
        imagesrcset: mobileSrcset,
        imagesizes: '100vw',
        media: '(max-width: 767px)',
        fetchpriority: 'high',
      },
    ];
  },
});

function scrollToStats() {
  document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' });
}

// ── 카운팅 인터랙션 ─────────────────────────────────────────────
// 숫자값만 ref로 관리, 표시값은 computed로 자동 번역
const statCounts = [ref(0), ref(0), ref(0), ref(0)];

const statConfigs = [
  {
    target: 24,
    suffixKey: 'stat-suffix-개+',
    countRef: statCounts[0],
    format: undefined as ((n: number) => string) | undefined,
  },
  {
    target: 97000,
    suffixKey: '+',
    countRef: statCounts[1],
    format: (n: number) => n.toLocaleString(),
  },
  {
    target: 1,
    suffixKey: 'stat-suffix-시간',
    countRef: statCounts[2],
    format: undefined as ((n: number) => string) | undefined,
  },
  {
    target: 1,
    suffixKey: 'stat-suffix-분이내',
    countRef: statCounts[3],
    format: undefined as ((n: number) => string) | undefined,
  },
];

// currentLang이 바뀌면 자동으로 재계산 (computed + t() 의존성)
const statValues = statConfigs.map((cfg) =>
  computed(() => {
    const n = cfg.format ? cfg.format(cfg.countRef.value) : String(cfg.countRef.value);
    const suffix = cfg.suffixKey.startsWith('stat-suffix-') ? t(cfg.suffixKey) : cfg.suffixKey;
    return n + suffix;
  }),
);

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function animateCount(cfg: (typeof statConfigs)[number]) {
  const duration = 1800;
  const start = performance.now();

  function tick(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    cfg.countRef.value = Math.round(eased * cfg.target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

let observer: IntersectionObserver | null = null;

onMounted(() => {
  const section = document.getElementById('stats-section');
  if (!section) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        statConfigs.forEach(animateCount);
        observer?.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  observer.observe(section);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div class="overflow-x-hidden bg-white">
    <!-- ── Hero ─────────────────────────────────────────────────── -->
    <section class="hero-section">
      <!-- Background (NuxtImg + LCP preload via useHead) -->
      <NuxtImg
        :src="imgHeroBg"
        alt=""
        class="hero-bg hero-bg--desktop"
        sizes="100vw md:1024px lg:1280px xl:1920px"
        fetchpriority="high"
      />
      <NuxtImg
        :src="imgHeroBgMobile"
        alt=""
        class="hero-bg hero-bg--mobile"
        sizes="100vw"
        fetchpriority="high"
      />
      <!-- Flat dark overlay -->
      <div
        class="pointer-events-none absolute inset-0 bg-black/20"
      />

      <!-- Bottom gradient + content (295px desktop / 254px mobile) -->
      <div class="hero-bottom">
        <!-- Logo: fixed dimensions, object-fit:contain prevents squish -->
        <NuxtImg
          class="hero-logo hero-logo--desktop"
          :src="imgLogo"
          alt="AlbumBuddy"
          fetchpriority="high"
          sizes="262px md:523px"
        />
        <NuxtImg
          class="hero-logo hero-logo--mobile"
          :src="imgLogo"
          alt="AlbumBuddy"
          fetchpriority="high"
          sizes="262px"
        />

        <p class="hero-subtitle">
          {{ t('hero-subtitle') }}
        </p>

        <button class="hero-scroll-btn" aria-label="Scroll down" @click="scrollToStats">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            class="h-6 w-6"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </section>

    <!-- ── Stats ─────────────────────────────────────────────────── -->
    <section id="stats-section" class="stats-section">
      <div class="stats-container">
        <h2 class="stats-title">
          {{ t('홈 섹션1 제목') }}
        </h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">{{ t('판매처') }}</span>
            <span class="stat-value">{{ statValues[0].value }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('등록 상품 수') }}</span>
            <span class="stat-value">{{ statValues[1].value }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('업데이트 주기') }}</span>
            <span class="stat-value">{{ statValues[2].value }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('상품 직접 등록') }}</span>
            <span class="stat-value">{{ statValues[3].value }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Features ──────────────────────────────────────────────── -->
    <section class="features-section">
      <div class="features-container">
        <h2 class="features-title">
          {{ t('홈 섹션2 제목') }}
        </h2>

        <!-- ① 구매대행: image LEFT, content RIGHT (desktop) -->
        <div class="feature-row">
          <!-- ── MOBILE phone mockup ── -->
          <div class="phone-mobile-wrap">
            <NuxtImg
              :src="imgPhone1Mobile"
              alt=""
              loading="lazy"
              sizes="100vw md:640px"
              class="block w-full"
            />
          </div>

          <!-- ── DESKTOP phone mockup: composite image, scales below 1440px ── -->
          <div class="phone-desktop-wrap proxy-desktop-wrap">
            <NuxtImg
              :src="imgPhone1Desktop"
              alt=""
              class="desktop-phone-img"
              loading="lazy"
              sizes="md:616px lg:616px"
            />
          </div>

          <!-- Content -->
          <div class="feature-content">
            <!-- Mobile -->
            <div class="feature-text--mobile">
              <h3 class="feature-subtitle">
                {{ t('구매대행 제목 모바일') }}
              </h3>
              <p class="feature-desc">
                {{ t('구매대행 설명 모바일') }}
              </p>
            </div>
            <!-- Desktop -->
            <div class="feature-text--desktop">
              <h3 class="feature-subtitle">
                {{ t('구매대행 이용법') }}
              </h3>
              <div v-for="(step, i) in proxySteps" :key="i" class="step-item">
                <span class="step-num">Step{{ i + 1 }}</span>
                <p class="step-desc">
                  {{ step }}
                </p>
              </div>
            </div>
            <a href="https://albumbuddy.kr/shop" target="_blank" rel="noopener" class="feature-btn">
              {{ t('쇼핑하러 가기') }}
              <svg
                class="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>

        <!-- ② 배송대행: content LEFT, image RIGHT (desktop) -->
        <div class="feature-row feature-row--reversed">
          <!-- ── MOBILE phone mockup (rendered first → top on mobile) ── -->
          <div class="phone-mobile-wrap shipping-mobile-phone">
            <NuxtImg
              :src="imgPhone2Mobile"
              alt=""
              loading="lazy"
              sizes="100vw md:640px"
              class="block w-full"
            />
          </div>

          <!-- ── DESKTOP phone mockup: percentage-based ── -->
          <div class="phone-desktop-wrap shipping-desktop-wrap">
            <NuxtImg
              :src="imgPhone2Desktop"
              alt=""
              class="desktop-phone-img"
              loading="lazy"
            />
          </div>

          <!-- Content -->
          <div class="feature-content">
            <!-- Mobile -->
            <div class="feature-text--mobile">
              <h3 class="feature-subtitle">
                {{ t('배송대행 제목 모바일') }}
              </h3>
              <p class="feature-desc">
                {{ t('배송대행 설명 모바일') }}
              </p>
            </div>
            <!-- Desktop -->
            <div class="feature-text--desktop">
              <h3 class="feature-subtitle">
                {{ t('배송대행 이용법') }}
              </h3>
              <div v-for="(step, i) in shippingSteps" :key="i" class="step-item">
                <span class="step-num">Step{{ i + 1 }}</span>
                <p class="step-desc">
                  {{ step }}
                </p>
              </div>
            </div>
            <a href="https://albumbuddy.kr/my?tab=KOREAN_ADDRESS" target="_blank" rel="noopener" class="feature-btn">
              {{ t('확인하러 가기') }}
              <svg
                class="btn-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FAQ ───────────────────────────────────────────────────── -->
    <section class="faq-home-section">
      <div class="faq-home-container">
        <h2 class="faq-home-title">
          {{ t('자주 묻는 질문') }}
        </h2>

        <!-- 로딩 스켈레톤 -->
        <div v-if="topFaqsLoading" class="faq-home-list">
          <div v-for="i in 5" :key="i" class="faq-home-skeleton">
            <div class="faq-skeleton-badge" />
            <div class="faq-skeleton-text" />
          </div>
        </div>

        <!-- 데이터 로드 완료 -->
        <div v-else class="faq-home-list">
          <div v-for="(faq, i) in topFaqs" :key="i" class="faq-home-item">
            <button class="faq-home-btn" @click="toggleFaq(i)">
              <div class="faq-home-item-left">
                <span class="faq-home-badge">{{ t(faq.category) }}</span>
                <span class="faq-home-q">{{ faq.q }}</span>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="faq-home-chevron"
                :class="{ 'faq-home-chevron--open': expandedFaq.has(i) }"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div v-if="expandedFaq.has(i)" class="faq-home-answer">
              <p class="m-0 whitespace-pre-line">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-center">
          <NuxtLink to="/faq" class="faq-more-btn">
            {{ t('더 보러 가기') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── CTA ───────────────────────────────────────────────────── -->
    <section class="cta-section">
      <NuxtImg
        :src="imgCta"
        alt=""
        class="cta-bg cta-bg--desktop"
        sizes="100vw md:1024px lg:1280px"
        loading="lazy"
      />
      <NuxtImg
        :src="imgCta"
        alt=""
        class="cta-bg cta-bg--mobile"
        sizes="100vw"
        loading="lazy"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-black/50"
      />
      <div class="cta-content">
        <p class="cta-text">
          {{ t('홈 CTA 문구') }}
        </p>
        <a href="https://albumbuddy.kr/shop" target="_blank" rel="noopener" class="cta-btn">
          {{ t('쇼핑하러 가기') }}
          <svg
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Hero ─────────────────────────────────────────────────────── */
.hero-section {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 70% top;
}
.hero-bg--desktop {
  display: none;
}
.hero-bg--mobile {
  display: block;
}

/* Bottom 254px (mobile) / 295px (desktop): gradient + logo + text + btn */
.hero-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 254px;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.2));
  display: flex;
  flex-direction: column;
  align-items: center;
  /* logo centered at ~72px, sub at ~131px, btn at ~158px → paddings approximate */
  padding-top: 52px;
  gap: 18px;
}

/* Logo: explicit natural dimensions, never stretches */
.hero-logo {
  flex-shrink: 0;
  object-fit: contain;
  display: block;
}
.hero-logo--desktop {
  display: none;
  width: 523px;
  height: 79px;
}
.hero-logo--mobile {
  display: block;
  width: 262px;
  height: 40px;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
}

.hero-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  letter-spacing: -0.3px;
  line-height: 24px;
  margin: 0;
  white-space: nowrap;
}

.hero-scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

/* ── Stats ─────────────────────────────────────────────────────── */
.stats-section {
  background: #ffffff;
  padding: 60px 24px;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-title {
  font-size: 24px;
  font-weight: 700;
  color: #212529;
  letter-spacing: -0.3px;
  line-height: 40px;
  margin: 0;
  white-space: pre-line;
  hyphens: none;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #868e96;
  letter-spacing: -0.3px;
  line-height: 20px;
}

.stat-value {
  font-size: 60px;
  font-weight: 700;
  color: #212529;
  letter-spacing: -0.3px;
  line-height: 78px;
}

/* ── Features ──────────────────────────────────────────────────── */
.features-section {
  background: #f8f9fa;
  padding: 60px 24px;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.features-title {
  font-size: 24px;
  font-weight: 700;
  color: #212529;
  letter-spacing: -0.3px;
  line-height: 40px;
  margin: 0;
  white-space: pre-line;
  hyphens: none;
}

/* Each feature block stacks on mobile */
.feature-row {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Mobile phone wrappers (visible on mobile only) ── */
.phone-mobile-wrap {
  position: relative;
  width: 100%;
  display: block;
}

/* Proxy buying: phone + vendor overlay */
.phone-mobile-frame {
  position: relative;
  width: 100%;
  /* Container: aspect-ratio matches Figma 343.48/714.28 */
  aspect-ratio: 343.48 / 714.28;
}

.phone-mobile-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* White block behind vendor card: 321×117 at top:191, left:20 inside 343×714 */
.phone-mobile-white {
  position: absolute;
  top: 26.74%; /* 191/714.28 */
  left: 5.86%; /* 20.11/343.48 */
  width: 93.7%; /* 321.818/343.48 */
  height: 16.44%; /* 117.464/714.28 */
  background: #ffffff;
}

/* Vendor card: 343×96 at top:201, left:11 inside 343×714 */
.vendor-mobile-wrap {
  position: absolute;
  top: 28.14%; /* 201/714.28 */
  left: 3.2%; /* 11/343.48 */
  width: 99.86%; /* 343/343.48 */
  height: 13.44%; /* 96/714.28 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* Shipping mobile phone (just image, no overlay) */
.shipping-mobile-phone {
  order: -1;
} /* always on top on mobile */

/* ── Desktop phone wrappers (hidden on mobile) ── */
.phone-desktop-wrap {
  display: none;
}

/* ── Feature content ── */
.feature-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 20px;
}

.feature-text--desktop {
  display: none;
}
.feature-text--mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-subtitle {
  font-size: 24px;
  font-weight: 700;
  color: #111417;
  letter-spacing: -0.3px;
  line-height: 40px;
  margin: 0;
}

.feature-desc {
  font-size: 14px;
  font-weight: 600;
  color: #868e96;
  letter-spacing: -0.3px;
  line-height: 20px;
  margin: 0;
  white-space: pre-line;
}

.step-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-num {
  font-size: 28px;
  font-weight: 700;
  color: #8a99a8;
  letter-spacing: -0.3px;
  line-height: 44px;
}

.step-desc {
  font-size: 18px;
  font-weight: 600;
  color: #111417;
  letter-spacing: -0.3px;
  line-height: 28px;
  margin: 0;
  white-space: pre-line;
}

.feature-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px;
  border-radius: 8px;
  background: #2d353d;
  color: #fcfdfd;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  border: none;
  cursor: pointer;
  align-self: flex-start;
  text-decoration: none;
  transition: background-color 0.15s;
}
.feature-btn:hover {
  background: #1e252b;
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* ── FAQ Home ──────────────────────────────────────────────────── */
.faq-home-section {
  background: #ffffff;
  padding: 60px 24px;
}

.faq-home-container {
  max-width: 1040px;
  margin: 0 auto;
}

.faq-home-title {
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  text-align: center;
  letter-spacing: -2px;
  margin: 0 0 24px;
  line-height: 48px;
}

.faq-home-list {
  display: flex;
  flex-direction: column;
}

/* 스켈레톤 */
.faq-home-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 0;
  border-top: 1px solid #dee2e6;
}
.faq-home-skeleton:first-child {
  border-top: none;
}
.faq-skeleton-badge {
  width: 80px;
  height: 22px;
  background: linear-gradient(90deg, #f1f3f5 25%, #e9ecef 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
}
.faq-skeleton-text {
  width: 70%;
  height: 20px;
  background: linear-gradient(90deg, #f1f3f5 25%, #e9ecef 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite 0.1s;
  border-radius: 4px;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.faq-home-item {
  border-bottom: 1px solid #e1e6ea;
  background: #ffffff;
}
.faq-home-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: background-color 0.15s;
}
.faq-home-btn:hover {
  background: #f8f9fa;
}
.faq-home-answer {
  padding: 0 12px 24px;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #868e96;
}

.faq-home-item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.faq-home-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 99px;
  background: #efe8fd;
  border: 1px solid #d9c6fb;
  font-size: 12px;
  font-weight: 600;
  color: #863dff;
  letter-spacing: -0.3px;
  white-space: nowrap;
  align-self: flex-start;
}

.faq-home-q {
  font-size: 16px;
  font-weight: 600;
  color: #111417;
  letter-spacing: -0.3px;
  line-height: 24px;
}

.faq-home-chevron {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #adb5bd;
  transition: transform 0.2s;
}
.faq-home-chevron--open {
  transform: rotate(180deg);
}

.faq-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 12px;
  border-radius: 8px;
  background: #2d353d;
  color: #fcfdfd;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s;
}
.faq-more-btn:hover {
  background: #1e252b;
}

/* ── CTA ───────────────────────────────────────────────────────── */
.cta-section {
  position: relative;
  min-height: 875px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 60px 24px;
}

.cta-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.cta-bg--desktop {
  display: none;
}
.cta-bg--mobile {
  display: block;
}

.cta-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.cta-text {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  line-height: 40px;
  margin: 0;
  white-space: pre-line;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  background: #fcfdfd;
  color: #111417;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.15s;
}
.cta-btn:hover {
  background: #e9ecef;
}

/* ════════════════════════════════════════════════════════════════
   Desktop  ≥ 768px
════════════════════════════════════════════════════════════════ */
@media (min-width: 768px) {
  /* Hero */
  .hero-bg {
    object-position: center top;
  }
  .hero-bg--desktop {
    display: block;
  }
  .hero-bg--mobile {
    display: none;
  }

  .hero-bottom {
    height: 295px;
    padding-top: 21px;
    gap: 20px;
  }

  .hero-logo--desktop {
    display: block;
  }
  .hero-logo--mobile {
    display: none;
  }
  .hero-subtitle {
    font-size: 24px;
    line-height: 40px;
  }

  /* Stats */
  .stats-section {
    padding: 160px 120px;
  }
  .stats-title {
    font-size: 42px;
    line-height: 63px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 460px 1fr;
    gap: 60px 0;
  }
  .stat-label {
    font-size: 24px;
    font-weight: 700;
    line-height: 40px;
  }
  .stat-value {
    font-size: 80px;
    line-height: normal;
  }

  /* Features */
  .features-section {
    padding: 160px 60px;
  }
  .features-title {
    font-size: 42px;
    line-height: 63px;
  }
  .features-container {
    gap: 120px;
  }

  /* Feature rows: side-by-side, no inner padding (outer section padding is enough) */
  .feature-row {
    flex-direction: row;
    align-items: center;
    gap: 50px;
  }

  /* Reversed row: content left (order:1), image right (order:2) */
  .feature-row--reversed .feature-content {
    order: 1;
  }
  .feature-row--reversed .shipping-desktop-wrap {
    order: 2;
  }

  /* Hide mobile phone wrappers */
  .phone-mobile-wrap {
    display: none;
  }

  /* Show desktop phone wrappers */
  .phone-desktop-wrap {
    display: block;
    position: relative;
    flex-shrink: 1;
  }

  /* Proxy (구매대행): 616px at 1440px, scales down via vw below that */
  .proxy-desktop-wrap {
    width: min(42.78vw, 616px);
    aspect-ratio: 616 / 915;
  }

  /* Shipping (배송대행): 440px at 1440px → 30.56vw */
  .shipping-desktop-wrap {
    width: min(30.56vw, 440px);
    aspect-ratio: 440 / 894;
  }

  /* Single full-size image inside phone wrapper */
  .desktop-phone-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Feature content: grows freely, never shrinks below 300px so text stays readable */
  .feature-content {
    flex: 1 0 300px;
    gap: 32px;
    padding: 80px 0 0;
    align-self: stretch;
    justify-content: center;
  }

  .feature-text--desktop {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .feature-text--mobile {
    display: none;
  }

  .feature-subtitle {
    font-size: 32px;
    line-height: 48px;
  }

  /* FAQ */
  .faq-home-section {
    padding: 160px 200px;
  }
  .faq-home-title {
    font-size: 60px;
    line-height: normal;
    margin-bottom: 32px;
  }
  .faq-home-btn {
    padding: 36px 20px;
    gap: 52px;
  }
  .faq-home-answer {
    padding: 0 20px 36px;
    font-size: 16px;
    line-height: 26px;
  }
  .faq-home-q {
    font-size: 24px;
    line-height: 40px;
  }
  .faq-home-chevron {
    width: 32px;
    height: 32px;
  }

  /* CTA */
  .cta-bg--desktop {
    display: block;
  }
  .cta-bg--mobile {
    display: none;
  }
  .cta-section {
    min-height: 626px;
    padding: 0 24px;
  }
  .cta-text {
    font-size: 32px;
    line-height: 48px;
  }
}

/* ── 1280px+: features section 좌우 패딩 원본 120px로 복원 ── */
@media (min-width: 1280px) {
  .features-section {
    padding: 160px 120px;
  }
}
</style>
