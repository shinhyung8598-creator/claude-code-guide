'use strict';

// ===== 상태 =====
let board = [];       // 4×4 배열, 0은 빈 칸
let score = 0;
let best = 0;
let won = false;      // 2048 달성 여부 (계속하기 후에도 다시 표시 안 함)
let gameOver = false;

// ===== DOM 참조 =====
const tilesEl    = document.getElementById('tiles');
const scoreEl    = document.getElementById('score');
const bestEl     = document.getElementById('best');
const overlayWin = document.getElementById('overlay-win');
const overlayOver= document.getElementById('overlay-over');

// ===== 초기화 =====
function init() {
  board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  score = 0;
  won = false;
  gameOver = false;
  best = parseInt(localStorage.getItem('2048-best') || '0', 10);
  overlayWin.classList.add('hidden');
  overlayOver.classList.add('hidden');
  updateScoreDisplay();
  addRandom();
  addRandom();
  render();
}

// ===== 빈 칸에 랜덤 타일 추가 =====
function addRandom() {
  const empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

// ===== 핵심 슬라이드 알고리즘 =====
// line: 길이 4 배열 → 왼쪽으로 민 결과 반환 + 합산 점수
function slide(line) {
  let gained = 0;
  // 1. 0 제거
  const nums = line.filter(v => v !== 0);
  // 2. 인접 합산 (한 번 합친 타일 재합산 금지)
  const merged = [];
  let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const val = nums[i] * 2;
      merged.push(val);
      gained += val;
      i += 2;
    } else {
      merged.push(nums[i]);
      i++;
    }
  }
  // 3. 길이 4 맞춤
  while (merged.length < 4) merged.push(0);
  return { result: merged, gained };
}

// ===== 4방향 이동 =====
function move(dir) {
  if (gameOver) return;

  let moved = false;
  let totalGained = 0;

  const newBoard = Array.from({ length: 4 }, () => [0, 0, 0, 0]);

  if (dir === 'left') {
    for (let r = 0; r < 4; r++) {
      const { result, gained } = slide(board[r]);
      newBoard[r] = result;
      if (result.some((v, c) => v !== board[r][c])) moved = true;
      totalGained += gained;
    }
  } else if (dir === 'right') {
    for (let r = 0; r < 4; r++) {
      const reversed = [...board[r]].reverse();
      const { result, gained } = slide(reversed);
      newBoard[r] = result.reverse();
      if (newBoard[r].some((v, c) => v !== board[r][c])) moved = true;
      totalGained += gained;
    }
  } else if (dir === 'up') {
    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const { result, gained } = slide(col);
      for (let r = 0; r < 4; r++) {
        newBoard[r][c] = result[r];
        if (result[r] !== board[r][c]) moved = true;
      }
      totalGained += gained;
    }
  } else if (dir === 'down') {
    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]].reverse();
      const { result, gained } = slide(col);
      const placed = result.reverse();
      for (let r = 0; r < 4; r++) {
        newBoard[r][c] = placed[r];
        if (placed[r] !== board[r][c]) moved = true;
      }
      totalGained += gained;
    }
  }

  if (!moved) return;

  board = newBoard;
  score += totalGained;
  if (score > best) {
    best = score;
    localStorage.setItem('2048-best', String(best));
  }
  updateScoreDisplay();
  addRandom();
  render();
  checkWin();
  checkOver();
}

// ===== 2048 달성 확인 =====
function checkWin() {
  if (won) return;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 2048) {
        won = true;
        overlayWin.classList.remove('hidden');
        return;
      }
    }
  }
}

// ===== 게임 오버 확인 =====
function checkOver() {
  // 2048 달성 오버레이가 표시 중이면 게임오버 판정 보류
  if (!overlayWin.classList.contains('hidden')) return;
  // 빈 칸 있으면 계속 가능
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return;
    }
  }
  // 인접 같은 수 있으면 계속 가능
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (c + 1 < 4 && board[r][c] === board[r][c + 1]) return;
      if (r + 1 < 4 && board[r][c] === board[r + 1][c]) return;
    }
  }
  gameOver = true;
  overlayOver.classList.remove('hidden');
}

// ===== 점수 표시 갱신 =====
function updateScoreDisplay() {
  scoreEl.textContent = score;
  bestEl.textContent = best;
}

// ===== 렌더링 =====
function render() {
  tilesEl.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = board[r][c];
      const cell = document.createElement('div');
      if (val !== 0) {
        cell.className = 'tile';
        cell.textContent = val;
        if (val > 2048) {
          cell.classList.add('super');
        } else {
          cell.dataset.val = String(val);
        }
        if (val >= 10000) {
          cell.classList.add('large-num');
        }
      }
      tilesEl.appendChild(cell);
    }
  }
}

// ===== 키보드 입력 =====
document.addEventListener('keydown', (e) => {
  const map = {
    'ArrowLeft':  'left',
    'ArrowRight': 'right',
    'ArrowUp':    'up',
    'ArrowDown':  'down',
  };
  const dir = map[e.key];
  if (dir) {
    e.preventDefault();
    move(dir);
  }
});

// ===== 터치 스와이프 =====
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30;

document.getElementById('grid-wrapper').addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.getElementById('grid-wrapper').addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

  if (absDx > absDy) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
}, { passive: true });

// ===== 버튼 이벤트 =====
document.getElementById('new-game').addEventListener('click', init);

document.getElementById('continue-btn').addEventListener('click', () => {
  overlayWin.classList.add('hidden');
  // won = true 유지 → 다시 2048 감지해도 오버레이 표시 안 함
});

document.getElementById('retry-btn').addEventListener('click', init);

// ===== 다크 모드 토글 =====
const themeBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

function applyTheme(theme) {
  html.dataset.theme = theme;
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('2048-theme', theme);
}

// 저장된 테마 복원, 없으면 시스템 설정 따름
const savedTheme = localStorage.getItem('2048-theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

themeBtn.addEventListener('click', () => {
  applyTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
});

// ===== 게임 시작 =====
init();
