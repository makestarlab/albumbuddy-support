/**
 * FAQ 데이터 composable
 * useAsyncData로 SSR 캐시 + 자동 hydration
 */

export interface FaqNotionItem {
  id: string;
  questions: Partial<Record<string, string>>;
  answers: Partial<Record<string, string>>;
  category: string;
}

export function useFaqs() {
  const supabase = useSupabaseClient();

  // useAsyncData로 SSR/client 캐싱
  return useAsyncData<FaqNotionItem[]>(
    'faqs',
    async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select(
          'id, category, question_ko, question_en, question_ja, question_zh_cn, answer_ko, answer_en, answer_ja, answer_zh_cn, order_index',
        )
        .order('order_index', { ascending: true });

      if (error) throw new Error(`useFaqs: ${error.message}`);

      return (data ?? []).map((row: any) => ({
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
    },
    { default: () => [] },
  );
}
