/**
 * FAQ 클릭 집계 — Supabase RPC로 click_count만 누적.
 * 화면 표시 순서엔 영향 없음(어드민이 데이터 확인용).
 */

import { supabase } from './supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function trackClick(key: string): void {
  if (!UUID_RE.test(key)) return;
  // fire-and-forget; 네트워크 실패해도 사용자 흐름엔 영향 없음
  supabase.rpc('increment_faq_click', { faq_id: key }).then(
    () => {},
    () => {},
  );
}
