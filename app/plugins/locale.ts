/**
 * 시작 언어 결정 (우선순위)
 *   1. 사용자가 이전에 선택한 언어 (cookie `lang`, 1년)
 *   2. SSR: Accept-Language 헤더 / 클라이언트: navigator.language
 *   3. 폴백: 'en'
 *
 * 이후 setLang 호출(헤더 드롭다운에서 변경)되면 cookie 자동 동기화.
 */

import type { Lang } from '~/composables/i18n';

const SUPPORTED: Lang[] = ['ko', 'en', 'ja', 'zh-CN'];

function parseAcceptLanguage(header: string | undefined): Lang {
  if (!header) return 'en';
  const tags = header
    .split(',')
    .map((s) => (s.split(';')[0] ?? '').trim().toLowerCase());
  for (const tag of tags) {
    if (tag.startsWith('ko')) return 'ko';
    if (tag.startsWith('ja')) return 'ja';
    if (tag.startsWith('zh')) return 'zh-CN';
    if (tag.startsWith('en')) return 'en';
  }
  return 'en';
}

function detectLang(): Lang {
  if (import.meta.server) {
    const headers = useRequestHeaders(['accept-language']);
    return parseAcceptLanguage(headers['accept-language']);
  }
  return parseAcceptLanguage(typeof navigator !== 'undefined' ? navigator.language : undefined);
}

export default defineNuxtPlugin(() => {
  const cookie = useCookie<Lang>('lang', {
    default: () => detectLang(),
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  if (SUPPORTED.includes(cookie.value)) {
    setLang(cookie.value);
  }

  watch(currentLang, (newLang) => {
    cookie.value = newLang;
  });
});
