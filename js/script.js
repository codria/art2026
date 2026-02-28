let currentGroup = null;  // 'top6', 'all', 'award'
let currentEntryIndex = null;
let entryOrders = {
  top6: [],
  all: [],
  award: []
};

function initEntryOrders() {
  if (entryOrders.top6.length > 0 && entryOrders.all.length > 0 && entryOrders.award.length > 0) return;

  entryOrders.top6 = Array.from(document.querySelectorAll('.entry.top6')).map(el => el.getAttribute('data-entry-number'));
  entryOrders.all = Array.from(document.querySelectorAll('.entry:not(.top6):not(.taisho):not(.kinsho):not(.ginsho):not(.nyuusho)')).map(el => el.getAttribute('data-entry-number'));

  // award は taisho, kinsho, ginsho のエントリーをまとめて
  entryOrders.award = Array.from(document.querySelectorAll('.entry.taisho, .entry.kinsho, .entry.ginsho, .entry.nyuusho')).map(el => el.getAttribute('data-entry-number'));
}

function openDetail(el) {
  initEntryOrders();

  const entryId = el.getAttribute('data-entry-number');
  if (el.classList.contains('top6')) {
    currentGroup = 'top6';
  } else if (el.classList.contains('taisho') || el.classList.contains('kinsho') || el.classList.contains('ginsho') || el.classList.contains('nyuusho')) {
    currentGroup = 'award';
  } else {
    currentGroup = 'all';
  }
  currentEntryIndex = entryOrders[currentGroup].indexOf(entryId);

  showDetailById(entryId);
  document.getElementById('overlay').classList.remove('hidden');
  return false;
}

function closeDetail() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('overlay-content').innerHTML = '';
  currentGroup = null;
  currentEntryIndex = null;
}

function showDetailById(entryId) {
  const detailHtml = document.getElementById('detail-' + entryId).innerHTML;
  document.getElementById('overlay-content').innerHTML = detailHtml;
}

function prevDetail(event) {
  event.stopPropagation();

  if (currentGroup === null || currentEntryIndex === null) return;
  if (currentEntryIndex > 0) {
    currentEntryIndex--;
    const prevId = entryOrders[currentGroup][currentEntryIndex];
    showDetailById(prevId);
  }
}

function nextDetail(event) {
  event.stopPropagation();

  if (currentGroup === null || currentEntryIndex === null) return;
  if (currentEntryIndex < entryOrders[currentGroup].length - 1) {
    currentEntryIndex++;
    const nextId = entryOrders[currentGroup][currentEntryIndex];
    showDetailById(nextId);
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
