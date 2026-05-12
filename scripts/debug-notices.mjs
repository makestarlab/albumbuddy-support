/**
 * 노션 공지 진단 — 게시됨 필터 적용 전 모든 row 보여줌.
 */
import { readFileSync } from 'node:fs';

try {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const NOTION_BASE = 'https://www.notion.so/api/v3';
const SPACE_ID = 'a88e0dce-491e-409a-ad13-77f7a9030ca9';
const COLLECTION_ID = '33ac0f4d-d8c8-8026-9c7e-000b0e436dfc';
const VIEW_ID = '33ac0f4d-d8c8-808c-b3eb-000cad98c7d6';

const getV = (b) => b?.value?.value ?? b?.value ?? {};
const rich = (rt) => (rt?.length ? rt.map((s) => (Array.isArray(s) ? s[0] : '')).join('') : '');

const res = await fetch(`${NOTION_BASE}/queryCollection`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
  body: JSON.stringify({
    collection: { id: COLLECTION_ID, spaceId: SPACE_ID },
    collectionView: { id: VIEW_ID, spaceId: SPACE_ID },
    query2: { aggregations: [{ property: 'title', aggregator: 'count' }] },
    loader: {
      type: 'reducer',
      reducers: { collection_group_results: { type: 'results', limit: 200 } },
      searchQuery: '',
      userTimeZone: 'Asia/Seoul',
    },
  }),
});

const data = await res.json();
const blocks = data.recordMap?.block ?? {};
const blockIds = data.result?.reducerResults?.collection_group_results?.blockIds ?? [];

console.log(`총 row: ${blockIds.length}\n`);

let count = 0;
for (const id of blockIds) {
  const v = getV(blocks[id]);
  if (!v?.type) continue;
  count++;
  const title = rich(v.properties?.title);
  const status = (v.properties?.['w<bc'] ?? []).map((s) => s[0]).join('') || '(없음)';
  const dbLang =
    (v.properties?.['|e{a'] ?? v.properties?.[':dNa'] ?? []).map((s) => s[0]).join('') ||
    '(없음)';
  const category = (v.properties?.['=^pP'] ?? []).map((s) => s[0]).join('') || '(없음)';
  console.log(`${count.toString().padStart(2)}. [${status}] [${dbLang}] [${category}] ${title}`);
}
