/**
 * 공지/약관 composable
 * Supabase row 1개 = 4개 언어 → NoticePost로 펼쳐서 기존 인터페이스 호환
 */

export type NoticeLang = 'ko' | 'en' | 'ja' | 'zh-CN';

const LANGS: NoticeLang[] = ['ko', 'en', 'ja', 'zh-CN'];

const LANG_TO_DB: Record<NoticeLang, string> = {
  ko: '국문',
  en: '영문',
  ja: '일어',
  'zh-CN': '중문',
};

const COL = {
  ko: { title: 'title_ko', body: 'body_ko' },
  en: { title: 'title_en', body: 'body_en' },
  ja: { title: 'title_ja', body: 'body_ja' },
  'zh-CN': { title: 'title_zh_cn', body: 'body_zh_cn' },
} as const satisfies Record<NoticeLang, { title: keyof NoticeRow; body: keyof NoticeRow }>;

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

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

function rowsToPosts(rows: NoticeRow[]): NoticePost[] {
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

/** 공지 전체 목록 (모든 언어 펼침, groupIdx로 묶음) */
export function useNoticePosts() {
  const supabase = useSupabaseClient();

  return useAsyncData<NoticePost[]>(
    'notices',
    async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw new Error(`useNoticePosts: ${error.message}`);
      return rowsToPosts((data as NoticeRow[]) ?? []);
    },
    { default: () => [] },
  );
}

/** 단일 공지 상세 — slug = `${rowId}:${lang}` */
export async function fetchNoticeDetail(slug: string): Promise<NoticeDetail> {
  const supabase = useSupabaseClient();
  const [id, langRaw] = slug.split(':');
  if (!id) throw new Error('invalid slug');
  const lang = (LANGS.includes(langRaw as NoticeLang) ? langRaw : 'en') as NoticeLang;

  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new Error(`notice not found: ${id}`);

  const row = data as NoticeRow;
  return {
    title: String(row[COL[lang].title] ?? ''),
    date: formatDate(row.published_at),
    contentHtml: String(row[COL[lang].body] ?? ''),
  };
}

/**
 * 현재 언어에 맞는 변형 하나씩만 추출 (기존 로직 그대로)
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
      group[0]!;

    const enDate = group.find((p) => p.dbLang === LANG_TO_DB['en'])?.date;
    return { ...selected, date: enDate ?? selected.date };
  });
}
