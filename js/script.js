let currentGroup = null;  // 'top6', 'all_2026', 'all_2025', 'award'
let currentEntryIndex = null;
let entryOrders = {
  top6: [],
  all_2026: [],
  all_2025: [],
  award: []
};
let entryOrdersInitialized = false;

function initEntryOrders() {
  if (entryOrdersInitialized) return;
  entryOrdersInitialized = true;

  const idsFromEls = els => Array.from(els).map(el => el.getAttribute('href').substring(1));

  entryOrders.top6 = idsFromEls(document.querySelectorAll('.entry.top6'));
  entryOrders.award = idsFromEls(document.querySelectorAll('.entry.taisho, .entry.kinsho, .entry.ginsho, .entry.nyuusho'));
  entryOrders.all_2026 = idsFromEls(document.querySelectorAll('.entry[data-year="2026"]:not(.top6):not(.taisho):not(.kinsho):not(.ginsho):not(.nyuusho)'));
  entryOrders.all_2025 = idsFromEls(document.querySelectorAll('.entry[data-year="2025"]:not(.top6):not(.taisho):not(.kinsho):not(.ginsho):not(.nyuusho)'));
}

function openDetail(el) {
  initEntryOrders();

  const detailId = el.getAttribute('href').substring(1);  // "detail-2026-01" 等
  if (el.classList.contains('top6')) {
    currentGroup = 'top6';
  } else if (isAwardEntry(el)) {
    currentGroup = 'award';
  } else if (el.getAttribute('data-year') === '2025') {
    currentGroup = 'all_2025';
  } else {
    currentGroup = 'all_2026';
  }
  currentEntryIndex = entryOrders[currentGroup].indexOf(detailId);

  showDetailById(detailId);
  document.getElementById('overlay').classList.remove('hidden');
  return false;
}

function closeDetail() {
  stopAutoplay();
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('overlay-content').innerHTML = '';
  currentGroup = null;
  currentEntryIndex = null;
  clearHash();
}

function showDetailById(detailId) {
  const detailHtml = document.getElementById(detailId).innerHTML;
  document.getElementById('overlay-content').innerHTML = detailHtml;
  syncHash(detailId);  // 表示中の作品をURLに反映し、そのままリンクを共有できるようにする
}

function isAwardEntry(el) {
  return el.classList.contains('taisho') || el.classList.contains('kinsho')
      || el.classList.contains('ginsho') || el.classList.contains('nyuusho');
}

function prevDetail(event) {
  event.stopPropagation();

  if (currentGroup === null || currentEntryIndex === null) return;
  if (currentEntryIndex > 0) {
    currentEntryIndex--;
    showDetailById(entryOrders[currentGroup][currentEntryIndex]);
    restartAutoplayTimer();
  }
}

function nextDetail(event) {
  event.stopPropagation();

  if (currentGroup === null || currentEntryIndex === null) return;
  if (currentEntryIndex < entryOrders[currentGroup].length - 1) {
    currentEntryIndex++;
    showDetailById(entryOrders[currentGroup][currentEntryIndex]);
    restartAutoplayTimer();
  }
}


// 自動送り (一定時間ごとに次の作品へ、末尾まで行ったら先頭に戻る)
const AUTOPLAY_INTERVAL_MS = 5000;
let autoplayTimer = null;

function isAutoplayOn() {
  return autoplayTimer !== null;
}

function toggleAutoplay(event) {
  if (event) event.stopPropagation();

  if (isAutoplayOn()) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

function startAutoplay() {
  if (currentGroup === null || currentEntryIndex === null) return;

  stopAutoplay();
  autoplayTimer = setInterval(advanceAutoplay, AUTOPLAY_INTERVAL_MS);
  updateAutoplayButton();
}

function stopAutoplay() {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  updateAutoplayButton();
}

// 手動で ＜ ＞ を押した直後は、待ち時間を最初から数え直す
function restartAutoplayTimer() {
  if (isAutoplayOn()) startAutoplay();
}

function advanceAutoplay() {
  if (currentGroup === null || currentEntryIndex === null) {
    stopAutoplay();
    return;
  }

  const order = entryOrders[currentGroup];
  if (order.length === 0) {
    stopAutoplay();
    return;
  }

  currentEntryIndex = (currentEntryIndex + 1) % order.length;  // 末尾の次は先頭へ
  showDetailById(order[currentEntryIndex]);
}

function updateAutoplayButton() {
  const btn = document.getElementById('autoplay-btn');
  if (!btn) return;

  const on = isAutoplayOn();
  btn.classList.toggle('active', on);
  btn.setAttribute('aria-pressed', String(on));
  btn.textContent = on ? '❚❚ 自動送り' : '▶ 自動送り';
}


// 作品への直リンク (例: index.html#detail-2026-05)
// location.hash は利用者が自由に書き換えられるので、作品IDの形式を検査してから使う
const DETAIL_ID_PATTERN = /^detail-\d{4}-\d{2}$/;

function syncHash(detailId) {
  if (!history.replaceState) return;  // 履歴を汚さずにURLだけ差し替える
  history.replaceState(null, '', '#' + detailId);
}

function clearHash() {
  if (!history.replaceState) return;
  history.replaceState(null, '', location.pathname + location.search);
}

// 同じ作品がTOP6と一覧の両方に並ぶことがあるので、巡回範囲の広い一覧側を優先する
function findEntryLink(detailId) {
  const links = document.querySelectorAll('.entry[href="#' + detailId + '"]');
  for (const link of links) {
    if (!link.classList.contains('top6') && !isAwardEntry(link)) return link;
  }
  return links[0] || null;
}

// ハッシュ付きURLで開かれたときは、その作品を表示した状態で始める
function openDetailFromHash() {
  const detailId = location.hash.substring(1);
  if (!DETAIL_ID_PATTERN.test(detailId)) return;
  if (!document.getElementById(detailId)) return;

  const link = findEntryLink(detailId);
  if (!link) return;

  // 昨年度作品は折り畳みの中にあるため、閉じたあとに元の場所が分かるよう開いておく
  const archive = link.closest('details');
  if (archive) archive.open = true;

  openDetail(link);
}


// クリックされた場所が overlay-content じゃなければ閉じる
function overlayClick(event) {
  if (event.target.id === 'overlay') {
    closeDetail();
  }
}

// JavaScriptを無効にしてたりしてなかったりの対策用
// detail- で始まる要素すべてに hidden を付ける
window.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[id^="detail-"]').forEach(el => {
    el.classList.add('hidden');
  });
  updateStepStates();
  openDetailFromHash();
});

// STEP 05, 06 の状態を現在時刻に応じて自動遷移
// HTML 側 fallback は current (JS無効時はそのまま「現在」表示のまま)
function updateStepStates() {
  const steps = document.querySelectorAll('.flow-chart .step');
  if (steps.length < 6) return;

  const now = new Date();

  // STEP 05: アートコンテスト当日 (8/7 00:00 〜 8/9 00:00 JST が「現在」)
  applyStepState(steps[4],
    new Date('2026-08-07T00:00:00+09:00'),
    new Date('2026-08-09T00:00:00+09:00'),
    now);

  // STEP 06: 結果発表と表彰 (8/8 18:30 〜 20:30 JST が「現在」)
  applyStepState(steps[5],
    new Date('2026-08-08T18:30:00+09:00'),
    new Date('2026-08-08T20:30:00+09:00'),
    now);
}

function applyStepState(el, start, end, now) {
  el.classList.remove('scheduled', 'current', 'completed');
  if (now < start) el.classList.add('scheduled');
  else if (now < end) el.classList.add('current');
  else el.classList.add('completed');
}
