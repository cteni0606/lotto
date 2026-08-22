// 동행복권 API에서 신규 회차를 수집해 lotto-update.json에 추가
// GitHub Actions에서 매주 실행 (Node 20+, 전역 fetch 사용)
var fs = require('fs');
var BASE = 1234;               // lotto-v3.html에 내장된 마지막 회차
var PATH = 'lotto-update.json';

var cur = { updated: null, draws: [] };
try { cur = JSON.parse(fs.readFileSync(PATH, 'utf8')); } catch (e) {}
if (!cur.draws) cur.draws = [];

var last = BASE;
for (var i = 0; i < cur.draws.length; i++) if (cur.draws[i][0] > last) last = cur.draws[i][0];

async function fetchRound(r) {
  var url = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchDir=center&srchLtEpsd=' + r;
  var res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': 'https://www.dhlottery.co.kr/lt645/result'
    }
  });
  if (!res.ok) return null;
  var j = await res.json().catch(function () { return null; });
  if (!j || !j.data || !j.data.list) return null;
  for (var i = 0; i < j.data.list.length; i++) {
    var it = j.data.list[i];
    if (it.ltEpsd === r) {
      var nums = [it.tm1WnNo, it.tm2WnNo, it.tm3WnNo, it.tm4WnNo, it.tm5WnNo, it.tm6WnNo];
      nums.sort(function (a, b) { return a - b; });
      var ok = nums.length === 6;
      for (var k = 0; k < 6; k++) if (!(nums[k] >= 1 && nums[k] <= 45)) ok = false;
      if (!ok) return null;
      return [r].concat(nums).concat([it.bnsWnNo]);
    }
  }
  return null;
}

(async function () {
  var added = 0;
  for (var r = last + 1; r < last + 100; r++) {
    var row = null;
    try { row = await fetchRound(r); } catch (e) { console.error('요청 실패:', r, e.message); break; }
    if (!row) break;
    cur.draws.push(row);
    added++;
    console.log('추가:', JSON.stringify(row));
  }
  if (added > 0) {
    cur.updated = new Date().toISOString().slice(0, 10);
    cur.draws.sort(function (a, b) { return a[0] - b[0]; });
    fs.writeFileSync(PATH, JSON.stringify(cur));
    console.log(added + '회차 추가 → 최신 제' + cur.draws[cur.draws.length - 1][0] + '회');
  } else {
    console.log('신규 회차 없음 (최신 제' + last + '회)');
  }
})();
