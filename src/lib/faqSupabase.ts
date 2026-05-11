/**
 * Supabase 기반 FAQ 데이터 (이전: faqNotion.ts)
 * 인터페이스는 동일하게 유지 — 뷰 코드 변경 최소화.
 */

import { supabase } from './supabase';

export interface FaqNotionItem {
  id: string;
  questions: Partial<Record<string, string>>;
  answers: Partial<Record<string, string>>;
  category: string;
}

const CACHE_TTL = 2 * 60 * 1000;
let _cacheTs = 0;
let _cacheItems: FaqNotionItem[] = [];

export async function fetchFaqItems(): Promise<FaqNotionItem[]> {
  if (Date.now() - _cacheTs < CACHE_TTL && _cacheItems.length > 0) return _cacheItems;

  const { data, error } = await supabase
    .from('faqs')
    .select(
      'id, category, question_ko, question_en, question_ja, question_zh_cn, answer_ko, answer_en, answer_ja, answer_zh_cn',
    )
    .order('order_index', { ascending: true });

  if (error) throw new Error(`fetchFaqItems: ${error.message}`);

  const items: FaqNotionItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    category: row.category ?? '',
    questions: {
      ko: row.question_ko ?? '',
      en: row.question_en ?? '',
      ja: row.question_ja ?? '',
      'zh-CN': row.question_zh_cn ?? '',
    },
    answers: {
      ko: row.answer_ko ?? '',
      en: row.answer_en ?? '',
      ja: row.answer_ja ?? '',
      'zh-CN': row.answer_zh_cn ?? '',
    },
  }));

  _cacheTs = Date.now();
  _cacheItems = items;
  return items;
}

export function invalidateFaqCache(): void {
  _cacheTs = 0;
}
