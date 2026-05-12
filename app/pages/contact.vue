<script setup lang="ts">
import type { Lang } from '~/composables/i18n';
// 자동 import: ref, computed, watch, t, currentLang

useHead({ title: '문의하기 — AlbumBuddy Support' });

// 언어별 active 템플릿 (레이블만, 클릭 시 pre-fill)
const descTemplates: Record<Lang, string> = {
  ko: '현 상태 : \n문의 내용: ',
  en: 'Current status: \nDetails: ',
  ja: '現在の状況: \nお問い合わせ内容: ',
  'zh-CN': '当前状态: \n问题描述: ',
};

// 언어별 placeholder (inactive 상태, e.g. 예시 포함)
const descPlaceholders: Record<Lang, string> = {
  ko: '현 상태 : 예시) 마이 패키지 > 패키징\n문의 내용: 예시) 패키지 No. abc-ABC123의 패키징 상태를 확인하고 싶습니다. "포장 대기 중 📦" 상태이며, 📦 ABC123과 📦 ABC456이 포함되어 있습니다.',
  en: 'Current status: e.g) My packages > Packaging\nDetails: e.g) I\'d like to check the packaging status of Package No. abc-ABC123 under "Awaiting packaging 📦." Specifically, it includes 📦 ABC123 and 📦 ABC456 in the packaging details.',
  ja: '現在の状況: 例) マイパッケージ > 梱包中\nお問い合わせ内容: 例) Package No. abc-ABC123の「梱包待ち 📦」状態の梱包状況を確認したいです。📦 ABC123と📦 ABC456が含まれています。',
  'zh-CN':
    '当前状态: 例如) 我的仓库 > 打包中\n问题描述: 例如) 我想确认包裹编号 abc-ABC123 的打包状态（"等待打包 📦"），其中包含 📦 ABC123 和 📦 ABC456。',
};

function getTemplate(lang: Lang) {
  return descTemplates[lang] ?? descTemplates.en;
}

const descriptionPlaceholder = computed(
  () => descPlaceholders[currentLang.value] ?? descPlaceholders.en,
);

const form = ref({
  email: '',
  subject: '',
  category: '',
  orderNumber: '',
  description: '',
});

// 클릭 시 레이블 pre-fill
function onDescriptionFocus() {
  if (!form.value.description) {
    form.value.description = getTemplate(currentLang.value);
  }
}

// 커서를 뗐을 때 레이블만 남아있으면(내용 미입력) 초기화 → placeholder 다시 표시
function onDescriptionBlur() {
  if (form.value.description === getTemplate(currentLang.value)) {
    form.value.description = '';
  }
}

// 언어 변경 시 레이블만 있는 상태면 새 언어 템플릿으로 교체
watch(currentLang, (newLang, oldLang) => {
  if (form.value.description === getTemplate(oldLang)) {
    form.value.description = getTemplate(newLang);
  }
});

// dev/prod 동일하게 Zendesk 직접 호출.
// 운영에서 동작하려면 Zendesk Admin → Security → CORS에 본 사이트 origin 등록 필요.
const ZENDESK_BASE = 'https://albumbuddy.zendesk.com/api/v2';

const files = ref<File[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string, type: 'success' | 'error' = 'error') {
  toastMessage.value = msg;
  toastType.value = type;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMessage.value = ''; }, 3000);
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const isDragging = ref(false);
const submitting = ref(false);
const submitted = ref(false);

const categoryOptions = computed(() => [
  { value: '계정', label: t('계정 관련 문의') },
  { value: '결제/환불', label: t('결제/환불 문의') },
  { value: '주문_관련', label: t('주문 관련 문의') },
  { value: '패키징_관련', label: t('패키징 관련 문의') },
  { value: '배송_관련', label: t('배송 관련 문의') },
  { value: '기타문의', label: t('기타 문의') },
]);

// 이메일 유효성 — 한 번 blur된 후에만 에러 표시 (입력 중에는 거슬리지 않게)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const emailTouched = ref(false);
const emailValid = computed(() => EMAIL_RE.test(form.value.email.trim()));
const showEmailError = computed(
  () => emailTouched.value && form.value.email.trim().length > 0 && !emailValid.value,
);

const isValid = computed(
  () =>
    emailValid.value &&
    form.value.subject.trim() &&
    form.value.category &&
    form.value.description.trim(),
);

// ── 파일 처리 ──────────────────────────────────────────────────
const MAX_FILES = 5;
const fileSlotsFull = computed(() => files.value.length >= MAX_FILES);

function openFilePicker() {
  if (fileSlotsFull.value) return;
  fileInputRef.value?.click();
}

function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) addFiles(Array.from(input.files));
  input.value = '';
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (fileSlotsFull.value) return;
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files));
}

function addFiles(newFiles: File[]) {
  const oversized = newFiles.filter((f) => f.size > MAX_FILE_SIZE);
  if (oversized.length > 0) {
    showToast(t('파일 용량 초과'));
    newFiles = newFiles.filter((f) => f.size <= MAX_FILE_SIZE);
  }
  const merged = [...files.value, ...newFiles];
  if (merged.length > MAX_FILES) showToast(t('파일 개수 초과'));
  files.value = merged.slice(0, MAX_FILES);
}

function removeFile(idx: number) {
  files.value = files.value.filter((_, i) => i !== idx);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Zendesk API ────────────────────────────────────────────────
async function uploadFile(file: File): Promise<string> {
  const res = await fetch(`${ZENDESK_BASE}/uploads.json?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json();
  return data.upload.token as string;
}

async function submit() {
  if (!isValid.value || submitting.value) return;
  submitting.value = true;

  try {
    // 파일 업로드
    const tokens: string[] = [];
    for (const file of files.value) {
      try {
        const token = await uploadFile(file);
        tokens.push(token);
      } catch {
        // 파일 업로드 실패 시 무시하고 계속 진행
      }
    }

    const body = form.value.description.trim();

    const customFields: { id: number; value: string }[] = [
      { id: 56709693286041, value: form.value.category },
    ];
    if (form.value.orderNumber.trim()) {
      customFields.push({ id: 56709912341529, value: form.value.orderNumber.trim() });
    }

    const payload = {
      request: {
        subject: form.value.subject.trim(),
        comment: {
          body,
          ...(tokens.length > 0 ? { uploads: tokens } : {}),
        },
        requester: {
          email: form.value.email.trim(),
          name: form.value.email.trim().split('@')[0] || 'Customer',
        },
        custom_fields: customFields,
        tags: [`lang_${currentLang.value}`],
      },
    };

    const res = await fetch(`${ZENDESK_BASE}/requests.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.description ?? `Error ${res.status}`);
    }

    submitted.value = true;
    showToast(t('접수 성공 토스트'), 'success');
  } catch {
    showToast(t('접수 실패 토스트'), 'error');
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  form.value = { email: '', subject: '', category: '', orderNumber: '', description: '' };
  files.value = [];
  submitted.value = false;
  emailTouched.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-white pt-16">
    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toastMessage" class="toast" :class="`toast--${toastType}`">
        <!-- success icon -->
        <svg
          v-if="toastType === 'success'"
          class="toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#0bb678" />
          <path
            d="M7 12.5l3.5 3.5L17 9"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        <!-- error icon -->
        <svg
          v-else
          class="toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2 L22 20 L2 20 Z"
            fill="#e93939"
          />
          <path
            d="M12 9v5M12 17v.5"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <div class="contact-container">
      <!-- ── 성공 화면 ──────────────────────────────────────────── -->
      <template v-if="submitted">
        <h1 class="contact-title mx-0 mb-12 mt-0 font-bold text-[#212529]">
          {{ t('문의하기 제목') }}
        </h1>
        <div class="contact-card px-10 py-16 text-center">
          <div
            class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-005"
          >
            <svg
              class="h-7 w-7 text-purple-040"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 class="mx-0 mb-3 mt-0 text-xl font-bold text-gray-099">
            {{ t('접수 완료') }}
          </h2>
          <p class="m-0 whitespace-pre-line text-[15px] leading-[1.7] text-gray-050">
            {{ t('접수 안내') }}
          </p>
          <button class="reset-btn mt-8" @click="resetForm">
            {{ t('새 문의 작성') }}
          </button>
        </div>
      </template>

      <!-- ── 폼 화면 ─────────────────────────────────────────────── -->
      <template v-else>
        <h1 class="contact-title font-bold text-[#212529]">
          {{ t('문의하기 제목') }}
        </h1>

        <form class="contact-card" @submit.prevent="submit">
          <!-- 이메일 주소 -->
          <div class="field-group">
            <label class="field-label"> {{ t('이메일 주소') }}<span class="required-dot" /> </label>
            <input
              v-model="form.email"
              type="email"
              class="field-input"
              :class="{ 'field-input--error': showEmailError }"
              :placeholder="t('이메일 주소 placeholder')"
              required
              @blur="emailTouched = true"
            />
            <p v-if="showEmailError" class="m-0 text-sm text-[#e03131]">
              {{ t('이메일 형식 오류') }}
            </p>
          </div>

          <!-- 제목 -->
          <div class="field-group">
            <label class="field-label"> {{ t('제목') }}<span class="required-dot" /> </label>
            <input
              v-model="form.subject"
              type="text"
              class="field-input"
              :placeholder="t('제목 placeholder')"
              required
            />
          </div>

          <!-- 카테고리 -->
          <div class="field-group">
            <label class="field-label"> {{ t('카테고리') }}<span class="required-dot" /> </label>
            <div class="select-wrap">
              <select v-model="form.category" class="field-select" required>
                <option value="" disabled>
                  {{ t('카테고리 선택') }}
                </option>
                <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <svg
                class="select-chevron"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M5 7.5l5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- 주문번호 / 송장번호 / 패키지번호 -->
          <div class="field-group">
            <label class="field-label">{{ t('주문번호') }}</label>
            <input
              v-model="form.orderNumber"
              type="text"
              class="field-input"
              :placeholder="t('주문번호 placeholder')"
            />
            <p class="helper-text">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                class="h-4 w-4 shrink-0 text-gray-050"
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3" />
                <path
                  d="M8 7v5M8 5.5v.5"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
              {{ t('주문번호 도움말') }}
            </p>
          </div>

          <!-- 설명 -->
          <div class="field-group">
            <label class="field-label"> {{ t('설명') }}<span class="required-dot" /> </label>
            <textarea
              v-model="form.description"
              class="field-textarea"
              :placeholder="descriptionPlaceholder"
              required
              @focus="onDescriptionFocus"
              @blur="onDescriptionBlur"
            />
            <p class="helper-text">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                class="h-4 w-4 shrink-0 text-gray-050"
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3" />
                <path
                  d="M8 7v5M8 5.5v.5"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
              {{ t('설명 도움말') }}
            </p>
          </div>

          <!-- 파일 첨부 -->
          <div class="field-group">
            <label class="field-label">{{ t('파일 첨부') }}</label>
            <div
              class="file-drop-zone"
              :class="{
                'file-drop-zone--dragging': isDragging && !fileSlotsFull,
                'file-drop-zone--disabled': fileSlotsFull,
              }"
              :aria-disabled="fileSlotsFull"
              @click="openFilePicker"
              @dragover.prevent
              @dragenter.prevent="!fileSlotsFull && (isDragging = true)"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                class="h-6 w-6 shrink-0 text-[#868e96]"
              >
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="file-drop-label">{{ t('파일 드롭') }}</span>
              <input
                ref="fileInputRef"
                type="file"
                multiple
                class="hidden"
                @change="handleFileInput"
              />
            </div>

            <p class="helper-text mt-1.5">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                class="h-4 w-4 shrink-0 text-gray-050"
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3" />
                <path
                  d="M8 7v5M8 5.5v.5"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-linecap="round"
                />
              </svg>
              {{ t('파일 크기 안내') }}
            </p>

            <!-- 선택된 파일 목록 -->
            <ul v-if="files.length > 0" class="file-list">
              <li v-for="(file, i) in files" :key="i" class="file-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  class="h-4 w-4 shrink-0 text-[#868e96]"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  <path d="M14 2v6h6" />
                </svg>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatSize(file.size) }}</span>
                <button type="button" class="file-remove" @click.stop="removeFile(i)">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="h-3.5 w-3.5"
                  >
                    <line x1="4" y1="4" x2="12" y2="12" />
                    <line x1="12" y1="4" x2="4" y2="12" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>

          <!-- 제출 바 -->
          <div class="submit-bar">
            <button
              type="submit"
              class="submit-btn"
              :class="{ 'submit-btn--disabled': !isValid || submitting }"
              :disabled="!isValid || submitting"
            >
              <svg
                v-if="submitting"
                class="spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  stroke-linecap="round"
                />
              </svg>
              {{ t('제출') }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Toast (360×60 hug, 디자인 시안 기준) */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 280px;
  max-width: 360px;
  height: 60px;
  padding: 0 20px;
  background: #2D353D;
  color: #FCFDFD;
  border: 1px solid #e1e6ea;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  z-index: 100;
  box-shadow: 0 2px 8px 0 #00000047;
}
.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.contact-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px 100px;
}

.contact-title {
  font-size: 32px;
  line-height: 48px;
  margin: 0 0 16px;
}

/* Form Card */
.contact-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}

/* Field group */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #111417;
}

.required-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #e03131;
  flex-shrink: 0;
}

/* Inputs */
.field-input,
.field-select {
  height: 48px;
  padding: 0 16px;
  border: 1px solid #e1e6ea;
  border-radius: 8px;
  background-color: #fcfdfd;
  font-size: 16px;
  font-family: inherit;
  color: #111417;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.field-input:focus,
.field-select:focus {
  border-color: #863dff;
}
.field-input::placeholder {
  color: #8a99a8;
}
.field-input--error,
.field-input--error:focus {
  border-color: #e03131;
}

/* Select */
.select-wrap {
  position: relative;
}
.field-select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 40px;
  color: #111417;
}
.field-select option[value=''] {
  color: #8a99a8;
}
.field-select:invalid,
.field-select:has(option[value='']:checked) {
  color: #8a99a8;
}
.select-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #8a99a8;
  pointer-events: none;
}

/* Textarea */
.field-textarea {
  padding: 12px 16px;
  border: 1px solid #e1e6ea;
  border-radius: 8px;
  background-color: #fcfdfd;
  font-size: 16px;
  font-family: inherit;
  color: #111417;
  outline: none;
  resize: vertical;
  min-height: 260px;
  transition: border-color 0.15s;
  line-height: 1.6;
  box-sizing: border-box;
  width: 100%;
}
.field-textarea:focus {
  border-color: #863dff;
}
.field-textarea::placeholder {
  color: #8a99a8;
}

/* Helper text */
.helper-text {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #6d7f92;
  margin: 0;
}

/* File drop zone */
.file-drop-zone {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 16px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}
.file-drop-zone:hover {
  background-color: #f1f3f5;
  border-color: #adb5bd;
}
.file-drop-zone--dragging {
  border-color: #863dff;
  background-color: #efe8fd;
}
.file-drop-zone--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.file-drop-zone--disabled:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.file-drop-label {
  font-size: 16px;
  font-weight: 600;
  color: #868e96;
}

/* File list */
.file-list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}
.file-name {
  flex: 1;
  font-size: 13px;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-size {
  font-size: 12px;
  color: #868e96;
  flex-shrink: 0;
}
.file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #868e96;
  padding: 0;
  flex-shrink: 0;
  border-radius: 4px;
}
.file-remove:hover {
  color: #e03131;
  background: #fff5f5;
}

/* Submit bar */
.submit-bar {
  border-top: 1px solid #dee2e6;
  padding-top: 32px;
  margin-top: 0;
}
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 56px;
  border-radius: 8px;
  background-color: #863dff;
  color: #fcfdfd;
  font-size: 18px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.15s;
}
.submit-btn:hover:not(.submit-btn--disabled) {
  background-color: #7232e0;
}
.submit-btn--disabled {
  background-color: #c4cdd4;
  cursor: not-allowed;
}

/* Reset button (success) */
.reset-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  border-radius: 8px;
  background-color: #863dff;
  color: #fcfdfd;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.15s;
}
.reset-btn:hover {
  background-color: #7232e0;
}

/* Spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.spin {
  animation: spin 0.8s linear infinite;
}

/* Desktop */
@media (min-width: 768px) {
  .contact-container {
    padding: 80px 24px 200px;
    max-width: 800px;
  }
  .contact-title {
    font-size: 60px;
    line-height: 78px;
    margin-bottom: 32px;
  }
  .contact-card {
    padding: 40px;
  }
  .field-textarea {
    min-height: 180px;
  }
}
</style>
