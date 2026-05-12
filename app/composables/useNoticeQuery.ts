/**
 * 공지 페이지 URL 쿼리 관리 (?id=<noticeId>)
 * - currentId: 현재 쿼리의 공지 id
 * - clearNoticeId: 쿼리에서 id 제거 (목록 복귀 시)
 * - setNoticeId: 쿼리에 id 박기 (필요 시)
 */
export function useNoticeQuery() {
  const route = useRoute();
  const router = useRouter();

  const currentId = computed(() => (route.query.id as string | undefined) ?? null);

  function setNoticeId(id: string) {
    if (route.query.id === id) return;
    router.push({ path: route.path, query: { ...route.query, id } });
  }

  function clearNoticeId() {
    if (!route.query.id) return;
    const { id: _omit, ...rest } = route.query;
    void _omit;
    router.replace({ path: route.path, query: rest });
  }

  return { currentId, setNoticeId, clearNoticeId };
}
