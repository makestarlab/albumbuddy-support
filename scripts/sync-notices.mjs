/**
 * 노션 공지 → Supabase 증분 동기화 (일회성)
 *
 * 사용:
 *   node scripts/sync-notices.mjs              # 미리보기 (insert 안 함)
 *   node scripts/sync-notices.mjs --apply      # 실제 insert
 *
 * 필요 env (.env.local):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (브라우저 노출 금지)
 *
 * 동작:
 *   1. 노션에서 게시된 공지 목록 + 본문 fetch
 *   2. 언어별 row를 그룹으로 묶음
 *   3. Supabase 기존 공지의 title_* 컬럼과 매칭 (어느 언어든 title 일치 시 기존으로 간주)
 *   4. 매칭 안 되는 그룹만 INSERT (이미지는 Storage에 업로드)
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// ── .env.local 수동 로드 (dotenv 없이) ──────────────────────────
try {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APPLY = process.argv.includes('--apply');
const STORAGE_BUCKET = 'notice-images';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다 (.env.local)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── 노션 상수 ────────────────────────────────────────────────────
const NOTION_BASE = 'https://www.notion.so/api/v3';
const SPACE_ID = 'a88e0dce-491e-409a-ad13-77f7a9030ca9';
const COLLECTION_ID = '33ac0f4d-d8c8-8026-9c7e-000b0e436dfc';
const VIEW_ID = '33ac0f4d-d8c8-808c-b3eb-000cad98c7d6';

const DB_TO_LANG = { 국문: 'ko', 영문: 'en', 일어: 'ja', 중문: 'zh-CN' };

// ── 유틸 ─────────────────────────────────────────────────────────
const getV = (b) => b?.value?.value ?? b?.value ?? {};
const rich = (rt) => (rt?.length ? rt.map((s) => (Array.isArray(s) ? s[0] : '')).join('') : '');
const toUuid = (id) => {
  const c = id.replace(/-/g, '');
  return `${c.slice(0, 8)}-${c.slice(8, 12)}-${c.slice(12, 16)}-${c.slice(16, 20)}-${c.slice(20)}`;
};
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function notionPost(endpoint, body, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${NOTION_BASE}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${endpoint} → ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw lastErr;
}

// ── 그룹화 (DB 정렬 순서로 동일 언어 재등장 시 새 그룹) ────────────
function assignGroupIdx(items) {
  const result = [];
  let g = 0;
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it.dbLang)) {
      g++;
      seen.clear();
    }
    seen.add(it.dbLang);
    result.push(g);
  }
  return result;
}

// ── 이미지 Storage 업로드 ────────────────────────────────────────
const imageCache = new Map();
async function uploadImage(signedUrl, blockId) {
  if (imageCache.has(signedUrl)) return imageCache.get(signedUrl);
  if (!/^https?:\/\//i.test(signedUrl)) {
    imageCache.set(signedUrl, signedUrl);
    return signedUrl;
  }

  try {
    const res = await fetch(signedUrl);
    if (!res.ok) return signedUrl;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.split('/')[1]?.split(';')[0] || 'bin';
    const fileName = `${blockId.replace(/-/g, '')}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buf, { contentType, upsert: true });
    if (error) return signedUrl;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    imageCache.set(signedUrl, data.publicUrl);
    return data.publicUrl;
  } catch {
    return signedUrl;
  }
}

// ── 블록 → HTML ─────────────────────────────────────────────────
function rtHtml(rt) {
  if (!rt?.length) return '';
  return rt
    .map((seg) => {
      const [text, decs] = seg;
      let s = esc(String(text)).replace(/\n/g, '<br/>');
      if (decs) {
        for (const d of decs) {
          switch (d[0]) {
            case 'b': s = `<strong>${s}</strong>`; break;
            case 'i': s = `<em>${s}</em>`; break;
            case '_': s = `<u>${s}</u>`; break;
            case 's': s = `<s>${s}</s>`; break;
            case 'c': s = `<code style="background:#f1f3f5;padding:2px 4px;border-radius:3px;font-size:13px">${s}</code>`; break;
            case 'a': s = `<a href="${esc(d[1])}" style="color:#6204fb;text-decoration:underline" target="_blank" rel="noopener">${s}</a>`; break;
          }
        }
      }
      return s;
    })
    .join('');
}

async function renderBlocks(blocks, recordMap, allBlocks) {
  let html = '';
  let inList = null;
  for (const v of blocks) {
    if (v.type !== 'bulleted_list' && v.type !== 'numbered_list' && inList) {
      html += inList === 'ul' ? '</ul>' : '</ol>';
      inList = null;
    }
    switch (v.type) {
      case 'text':
        html += rtHtml(v.properties?.title) ? `<p>${rtHtml(v.properties?.title)}</p>` : '<br/>';
        break;
      case 'header': html += `<h1>${rtHtml(v.properties?.title)}</h1>`; break;
      case 'sub_header': html += `<h2>${rtHtml(v.properties?.title)}</h2>`; break;
      case 'sub_sub_header': html += `<h3>${rtHtml(v.properties?.title)}</h3>`; break;
      case 'bulleted_list':
      case 'numbered_list': {
        const tag = v.type === 'bulleted_list' ? 'ul' : 'ol';
        if (inList !== tag) {
          if (inList) html += inList === 'ul' ? '</ul>' : '</ol>';
          html += `<${tag}>`;
          inList = tag;
        }
        const children = (v.content ?? [])
          .map((id) => getV(allBlocks[id]))
          .filter((c) => c.type);
        const nested = children.length ? await renderBlocks(children, recordMap, allBlocks) : '';
        html += `<li>${rtHtml(v.properties?.title)}${nested}</li>`;
        break;
      }
      case 'image': {
        const signed = recordMap?.signed_urls?.[v.id] ?? v.properties?.source?.[0]?.[0] ?? '';
        const cap = rich(v.properties?.caption);
        const url = signed ? await uploadImage(signed, v.id) : '';
        html += `<figure><img src="${esc(url)}" alt="${esc(cap)}" style="max-width:100%;border-radius:8px"/>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`;
        break;
      }
      case 'quote': html += `<blockquote>${rtHtml(v.properties?.title)}</blockquote>`; break;
      case 'callout':
        html += `<div class="callout">${v.format?.page_icon ? `<span>${v.format.page_icon}</span> ` : ''}${rtHtml(v.properties?.title)}</div>`;
        break;
      case 'divider': html += '<hr/>'; break;
      case 'bookmark': {
        const bUrl = v.properties?.link?.[0]?.[0] ?? '';
        html += `<a href="${esc(bUrl)}" target="_blank" rel="noopener" style="color:#6204fb;text-decoration:underline">${esc(bUrl)}</a>`;
        break;
      }
    }
  }
  if (inList) html += inList === 'ul' ? '</ul>' : '</ol>';
  return html;
}

async function getNoticeDetail(uuid) {
  const chunk = await notionPost('loadPageChunk', {
    pageId: uuid,
    limit: 300,
    cursor: { stack: [] },
    chunkNumber: 0,
    verticalColumns: false,
  });
  const blocks = chunk.recordMap?.block ?? {};
  const root = getV(blocks[uuid]);
  const title = rich(root.properties?.title);
  const createdAt = root.created_time ?? 0;
  const contentIds = root.content ?? [];
  const contentBlocks = contentIds.map((id) => getV(blocks[id])).filter((v) => v.type);
  const html = await renderBlocks(contentBlocks, chunk.recordMap, blocks);
  return { title, html, createdAt };
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  console.log(`🔄 노션 공지 → Supabase 증분 동기화`);
  console.log(`   모드: ${APPLY ? 'APPLY (실제 INSERT)' : 'DRY (미리보기)'}\n`);

  // 1. 노션 공지 fetch
  const result = await notionPost('queryCollection', {
    collection: { id: COLLECTION_ID, spaceId: SPACE_ID },
    collectionView: { id: VIEW_ID, spaceId: SPACE_ID },
    query2: { aggregations: [{ property: 'title', aggregator: 'count' }] },
    loader: {
      type: 'reducer',
      reducers: { collection_group_results: { type: 'results', limit: 200 } },
      searchQuery: '',
      userTimeZone: 'Asia/Seoul',
    },
  });

  const blocks = result.recordMap?.block ?? {};
  const blockIds = result.result?.reducerResults?.collection_group_results?.blockIds ?? [];

  const raw = [];
  for (const id of blockIds) {
    const v = getV(blocks[id]);
    if (!v?.type) continue;
    const title = rich(v.properties?.title);
    if (!title) continue;
    // status는 노션 hidden 필드. 빈 값이거나 '게시됨'은 통과, 다른 명시 값(초안 등)만 skip
    const status = (v.properties?.['w<bc'] ?? []).map((s) => s[0]).join('');
    if (status && status !== '게시됨') continue;
    const dbLang =
      (v.properties?.['|e{a'] ?? v.properties?.[':dNa'] ?? []).map((s) => s[0]).join('') || '영문';
    const category = (v.properties?.['=^pP'] ?? []).map((s) => s[0]).join('') || '';
    raw.push({ id, uuid: toUuid(id), title, dbLang, category, createdAt: v.created_time ?? 0 });
  }

  if (raw.length === 0) {
    console.error('❌ 노션에서 공지를 못 가져왔습니다. Share to web이 켜져 있는지 확인하세요.');
    process.exit(1);
  }

  console.log(`   노션에서 ${raw.length}개 언어 row 가져옴`);

  // 2. 그룹화
  const groupIdxs = assignGroupIdx(raw);
  const groupMap = new Map();
  for (let i = 0; i < raw.length; i++) {
    const g = groupIdxs[i];
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g).push(raw[i]);
  }
  console.log(`   → ${groupMap.size}개 공지 그룹\n`);

  // 3. Supabase 기존 공지 fetch (제목들로 중복 판별)
  const { data: existing, error: fetchErr } = await supabase
    .from('notices')
    .select('id, title_ko, title_en, title_ja, title_zh_cn');
  if (fetchErr) {
    console.error('❌ Supabase fetch 실패:', fetchErr.message);
    process.exit(1);
  }
  const existingTitles = new Set();
  for (const row of existing ?? []) {
    for (const k of ['title_ko', 'title_en', 'title_ja', 'title_zh_cn']) {
      if (row[k]) existingTitles.add(row[k]);
    }
  }
  console.log(`   기존 Supabase 공지: ${existing.length}건 (제목 ${existingTitles.size}개 인덱스)\n`);

  // 4. 각 그룹: 중복 체크 + 새 그룹만 처리
  const toInsert = [];
  let groupNum = 0;
  for (const [, group] of groupMap) {
    groupNum++;
    const titles = group.map((g) => g.title);
    const isDuplicate = titles.some((t) => existingTitles.has(t));
    if (isDuplicate) {
      console.log(`   [${groupNum}/${groupMap.size}] skip (이미 존재): ${titles[0]}`);
      continue;
    }
    console.log(`   [${groupNum}/${groupMap.size}] 신규: ${titles[0]}`);
    const row = {
      category: group[0].category,
      is_published: true,
      published_at: new Date(Math.max(...group.map((g) => g.createdAt))).toISOString(),
      title_ko: null, title_en: null, title_ja: null, title_zh_cn: null,
      body_ko: null, body_en: null, body_ja: null, body_zh_cn: null,
    };
    for (const item of group) {
      const lang = DB_TO_LANG[item.dbLang];
      if (!lang) continue;
      console.log(`     - ${lang}: ${item.title.slice(0, 60)}`);
      try {
        const detail = await getNoticeDetail(item.uuid);
        const langKey = lang.replace('-', '_').toLowerCase();
        row[`title_${langKey}`] = detail.title;
        row[`body_${langKey}`] = detail.html;
      } catch (e) {
        console.warn(`     ⚠️  ${item.title} fetch 실패: ${e.message}`);
      }
    }
    toInsert.push(row);
  }

  console.log(`\n📊 결과:`);
  console.log(`   기존(skip): ${groupMap.size - toInsert.length}개`);
  console.log(`   신규(insert 예정): ${toInsert.length}개`);
  console.log(`   이미지 Storage 업로드: ${imageCache.size}장`);

  if (toInsert.length === 0) {
    console.log(`\n✅ 새 공지 없음 — 종료`);
    return;
  }

  if (!APPLY) {
    console.log(`\n💡 미리보기 완료. 실제 INSERT 하려면 --apply 옵션과 함께 다시 실행`);
    return;
  }

  const { error: insertErr } = await supabase.from('notices').insert(toInsert);
  if (insertErr) {
    console.error('❌ INSERT 실패:', insertErr.message);
    process.exit(1);
  }
  console.log(`\n✅ ${toInsert.length}개 공지 추가 완료`);
}

main().catch((e) => {
  console.error('\n❌ 실패:', e.message);
  process.exit(1);
});
