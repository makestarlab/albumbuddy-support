/**
 * Supabase 스키마 타입 — @nuxtjs/supabase 모듈이 자동으로 인식 (~/types/database.types.ts)
 * supabase gen 명령으로 자동 생성 가능하지만, 우리 스키마가 작아서 수동 정의.
 */

export type Database = {
  public: {
    Tables: {
      faqs: {
        Row: {
          id: string;
          category: string;
          order_index: number;
          click_count: number;
          question_ko: string | null;
          question_en: string | null;
          question_ja: string | null;
          question_zh_cn: string | null;
          answer_ko: string | null;
          answer_en: string | null;
          answer_ja: string | null;
          answer_zh_cn: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['faqs']['Row']>;
        Update: Partial<Database['public']['Tables']['faqs']['Row']>;
        Relationships: [];
      };
      notices: {
        Row: {
          id: string;
          category: string;
          is_published: boolean;
          published_at: string;
          title_ko: string | null;
          title_en: string | null;
          title_ja: string | null;
          title_zh_cn: string | null;
          body_ko: string | null;
          body_en: string | null;
          body_ja: string | null;
          body_zh_cn: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notices']['Row']>;
        Update: Partial<Database['public']['Tables']['notices']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_faq_click: {
        Args: { faq_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
