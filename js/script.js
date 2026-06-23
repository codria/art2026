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
  } else if (el.classList.contains('taisho') || el.classList.contains('kinsho') || el.classList.contains('ginsho') || el.classList.contains('nyuusho')) {
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
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('overlay-content').innerHTML = '';
  currentGroup = null;
  currentEntryIndex = null;
}

function showDetailById(detailId) {
  const detailHtml = document.getElementById(detailId).innerHTML;
  document.getElementById('overlay-content').innerHTML = detailHtml;
}

function prevDetail(event) {
  event.stopPropagation();

  if (currentGroup === null || currentEntryIndex === null) return;
  if (currentEntryIndex > 0) {
    currentEntryIndex--;
    showDetailById(entryOrders[currentGroup][currentEntryIndex]);
  }
}

function nextDetail(event) {
  event.stopPropagation();

  if (currentGroup === null || currentEntryIndex === null) return;
  if (currentEntryIndex < entryOrders[currentGroup].length - 1) {
    currentEntryIndex++;
    showDetailById(entryOrders[currentGroup][currentEntryIndex]);
  }
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
});
