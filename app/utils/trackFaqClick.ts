/**
 * FAQ 클릭 집계 — Supabase RPC로 click_count만 누적.
 * 화면 표시 순서엔 영향 없음.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function trackFaqClick(key: string): void {
  if (!UUID_RE.test(key)) return;
  if (import.meta.server) return; // 서버 사이드에선 호출 안 함

  const supabase = useSupabaseClient();
  // fire-and-forget
  supabase.rpc('increment_faq_click', { faq_id: key }).then(
    () => {},
    () => {},
  );
}
