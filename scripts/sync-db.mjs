// 매주 Actions에서 실행: lotto-update.json 전체를 draws 테이블에 upsert (멱등)
// 겸사겸사 무료 프로젝트 휴면 방지 핑 역할
import fs from 'fs';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
if (!URL || !KEY) { console.error('SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수 필요'); process.exit(1); }

let extra = [];
try { extra = JSON.parse(fs.readFileSync('lotto-update.json', 'utf8')).draws || []; } catch (e) {}
if (extra.length === 0) { console.log('동기화할 회차 없음'); process.exit(0); }

const DRAW1 = Date.parse('2002-12-07T12:30:00Z');
const rows = extra.map((r) => {
  const nums = r.slice(1, 7).sort((a, b) => a - b);
  return {
    round: r[0], n1: nums[0], n2: nums[1], n3: nums[2], n4: nums[3], n5: nums[4], n6: nums[5],
    bonus: r[7],
    drawn_date: new Date(DRAW1 + (r[0] - 1) * 7 * 86400000).toISOString().slice(0, 10),
  };
});
const res = await fetch(URL + '/rest/v1/draws?on_conflict=round', {
  method: 'POST',
  headers: {
    apikey: KEY, Authorization: 'Bearer ' + KEY,
    'Content-Type': 'application/json',
    Prefer: 'resolution=ignore-duplicates,return=minimal',
  },
  body: JSON.stringify(rows),
});
if (!res.ok) { console.error('동기화 실패', res.status, await res.text()); process.exit(1); }
console.log('DB 동기화 완료:', rows.length, '회차 (중복 무시)');
