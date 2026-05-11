/**
 * Supabase 기반 공지/약관 (이전: notion.ts)
 *
 * 데이터 모델 차이를 호환 래퍼로 흡수:
 *   - Supabase는 한 row에 모든 언어 (title_ko/en/ja/zh_cn, body_*)
 *   - 기존 NoticePost 인터페이스는 "한 row = 한 언어"라 groupIdx로 묶는 구조
 *   → 한 Supabase row를 가용 언어 개수만큼 NoticePost로 펼친다.
 *     groupIdx = row 순서(0부터 증가), slug = `${row.id}:${lang}`
 */

import { supabase } from './supabase';

export type NoticeLang = 'ko' | 'en' | 'ja' | 'zh-CN';

const LANGS: NoticeLang[] = ['ko', 'en', 'ja', 'zh-CN'];

const LANG_TO_DB: Record<NoticeLang, string> = {
  ko: '국문',
  en: '영문',
  ja: '일어',
  'zh-CN': '중문',
};

const COL: Record<NoticeLang, { title: keyof NoticeRow; body: keyof NoticeRow }> = {
  ko: { title: 'title_ko', body: 'body_ko' },
  en: { title: 'title_en', body: 'body_en' },
  ja: { title: 'title_ja', body: 'body_ja' },
  'zh-CN': { title: 'title_zh_cn', body: 'body_zh_cn' },
};

interface NoticeRow {
  id: string;
  category: string;
  published_at: string;
  is_published: boolean;
  title_ko: string | null;
  title_en: string | null;
  title_ja: string | null;
  title_zh_cn: string | null;
  body_ko: string | null;
  body_en: string | null;
  body_ja: string | null;
  body_zh_cn: string | null;
}

export interface NoticePost {
  id: string;
  title: string;
  date: string;
  slug: string;
  dbLang: string;
  groupIdx: number;
  category: string;
}

export interface NoticeDetail {
  title: string;
  date: string;
  contentHtml: string;
}

// ── 캐시 ────────────────────────────────────────────────────────
const CACHE_TTL = 2 * 60 * 1000;
let _rowsCacheTs = 0;
let _rowsCache: NoticeRow[] = [];

async function fetchRows(): Promise<NoticeRow[]> {
  if (Date.now() - _rowsCacheTs < CACHE_TTL && _rowsCache.length > 0) return _rowsCache;

  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) throw new Error(`fetchRows: ${error.message}`);

  _rowsCache = (data as NoticeRow[]) ?? [];
  _rowsCacheTs = Date.now();
  return _rowsCache;
}

// ── 유틸 ────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

// ── 공개 API ────────────────────────────────────────────────────
export async function getNoticePosts(): Promise<NoticePost[]> {
  const rows = await fetchRows();
  const result: NoticePost[] = [];

  rows.forEach((row, groupIdx) => {
    const dateStr = formatDate(row.published_at);
    for (const lang of LANGS) {
      const title = row[COL[lang].title];
      if (!title) continue;
      result.push({
        id: row.id,
        title: String(title),
        date: dateStr,
        slug: `${row.id}:${lang}`,
        dbLang: LANG_TO_DB[lang],
        groupIdx,
        category: row.category ?? '',
      });
    }
  });

  return result;
}

export async function getNoticeDetail(slug: string): Promise<NoticeDetail> {
  const [id, langRaw] = slug.split(':');
  const lang = (LANGS.includes(langRaw as NoticeLang) ? langRaw : 'en') as NoticeLang;

  const rows = await fetchRows();
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error(`notice not found: ${id}`);

  return {
    title: String(row[COL[lang].title] ?? ''),
    date: formatDate(row.published_at),
    contentHtml: String(row[COL[lang].body] ?? ''),
  };
}

/**
 * 현재 언어에 맞는 변형 하나씩만 추출 (기존 notion.ts 로직 그대로).
 * 우선순위: 현재 언어 → 영문 폴백 → 첫 번째.
 */
export function filterPostsByLang(posts: NoticePost[], lang: NoticeLang): NoticePost[] {
  const dbLang = LANG_TO_DB[lang];
  const fallback = LANG_TO_DB['en'];

  const groupOrder = [...new Set(posts.map((p) => p.groupIdx))];
  const byGroup = new Map<number, NoticePost[]>();
  for (const p of posts) {
    if (!byGroup.has(p.groupIdx)) byGroup.set(p.groupIdx, []);
    byGroup.get(p.groupIdx)!.push(p);
  }

  return groupOrder.map((idx) => {
    const group = byGroup.get(idx)!;
    const selected =
      group.find((p) => p.dbLang === dbLang) ??
      group.find((p) => p.dbLang === fallback) ??
      group[0];

    const enDate = group.find((p) => p.dbLang === LANG_TO_DB['en'])?.date;
    return { ...selected, date: enDate ?? selected.date };
  });
}
