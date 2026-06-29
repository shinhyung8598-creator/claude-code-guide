# 2048 게임 코드 리뷰

**검토일**: 2026-06-29

---

## 1. HTML 구조 — OK

- `<header>`, `<main>` 시맨틱 태그 사용.
- `<script type="module" src="js/game.js">` 올바르게 연결됨.
- `id="overlay-win"`, `id="overlay-over"` 오버레이 마크업 모두 존재.
- `role="grid"`, `aria-label` 접근성 속성 포함.

---

## 2. CSS — OK

- **CSS 변수**: `:root`에 라이트/다크 토큰 정의됨. `[data-theme='dark']`, `[data-theme='light']` 수동 토글도 지원.
- **타일 색상 클래스**: `data-val='2'` ~ `data-val='2048'` 속성 선택자 및 `.tile.super` 모두 정의됨 (`style.css` 241~252번째 줄).
- **다크 모드**: `@media (prefers-color-scheme: dark)` 미디어 쿼리 + `[data-theme='dark']` 이중 지원 (`style.css` 19~51번째 줄).
- **모바일 반응형**: `@media (max-width: 480px)` 브레이크포인트 구현됨 (`style.css` 293번째 줄).
- **prefers-reduced-motion**: `.tile { animation: none; }` 적용 (`style.css` 234~238번째 줄).

---

## 3. JS 게임 로직 — 버그 1건 발견 → 수정 완료

### slide() 정확성 — OK
- 0 제거 후 인접 합산, `i += 2`로 한 번 합친 타일 재합산 방지 정상 구현 (`game.js` 54~63번째 줄).

### 4방향 이동 — OK
- `left`, `right`, `up`, `down` 4방향 모두 구현. `right`/`down`은 배열 reverse 후 slide, 다시 reverse하는 방식으로 올바르게 처리됨.

### 새 타일 생성 (이동 없으면 생성 안 함) — OK
- `if (!moved) return;` 이후에 `addRandom()` 호출 (`game.js` 117~127번째 줄).

### 점수 누적 — OK
- `totalGained` 누산 후 `score += totalGained`, 최고 점수 초과 시 `localStorage` 갱신.

### 게임오버 판정 — OK
- 빈 칸 없고 인접 동일 값도 없을 때 `gameOver = true` + 오버레이 표시.

### 2048 달성 판정 — OK
- `won` 플래그로 중복 표시 방지. `checkWin()` 이후 `checkOver()` 순서로 호출.

### ★ 버그: 2048 달성과 동시에 게임오버 오버레이 이중 표시
**파일**: `js/game.js`  
**위치**: 수정 전 147번째 줄 `checkOver()` 함수

**원인**: `move()` 내부에서 `checkWin()` → `checkOver()`를 순서대로 호출하는데,
2048 타일이 생성되는 순간 보드가 꽉 차고 인접 합산 가능한 타일도 없으면
`overlay-win`과 `overlay-over`가 동시에 표시됨.

**수정 내용** (`game.js` 149번째 줄에 조건 추가):
```js
// 수정 전
function checkOver() {
  // 빈 칸 있으면 계속 가능
  for (let r = 0; ...

// 수정 후
function checkOver() {
  // 2048 달성 오버레이가 표시 중이면 게임오버 판정 보류
  if (!overlayWin.classList.contains('hidden')) return;
  // 빈 칸 있으면 계속 가능
  for (let r = 0; ...
```

---

## 4. 이벤트 — OK

- **방향키**: `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` 모두 매핑, `e.preventDefault()` 호출로 스크롤 방지 (`game.js` 196~208번째 줄).
- **터치 스와이프**: 임계값 `SWIPE_THRESHOLD = 30` 설정, `touchstart`/`touchend` 이벤트로 dx/dy 비교해 방향 판정 (`game.js` 211~233번째 줄).

---

## 5. localStorage — OK

- **최고 점수**: `localStorage.getItem('2048-best')` 복원 (`game.js` 23번째 줄), `localStorage.setItem('2048-best', ...)` 갱신 (`game.js` 123번째 줄).
- **테마**: `localStorage.getItem('2048-theme')` 복원 + `applyTheme()` 저장 (`game.js` 256~265번째 줄).

---

## 6. 버그 가능성 종합

| 항목 | 상태 | 비고 |
|------|------|------|
| 타일 합산 시 연쇄 합산 방지 | OK | `i += 2` 처리 |
| 이동 없을 때 새 타일 미생성 | OK | `if (!moved) return` |
| 2048+게임오버 오버레이 이중 표시 | 수정 완료 | `game.js` `checkOver()` 첫 줄에 조건 추가 |

---

## 수정 파일 요약

- **`apps/2048/js/game.js`**: `checkOver()` 함수 첫 줄에 `overlayWin` 표시 중 게임오버 판정 보류 조건 추가.
