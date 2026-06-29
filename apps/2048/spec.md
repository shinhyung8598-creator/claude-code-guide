# 2048 퍼즐 게임 — 구현 계획 (spec.md)

작성일: 2026-06-29

---

## 1. 파일 구조

```
apps/2048/
├── spec.md          # 이 파일 (구현 계획)
├── index.html       # 진입점 — 게임 마크업 전체
├── css/
│   └── style.css    # 스타일 (그리드, 타일, 오버레이, 다크 모드)
└── js/
    └── game.js      # 게임 전체 로직 (이동, 합산, 점수, 저장, 이벤트)
```

빌드 도구 없음. CDN 의존성 없음. `<script type="module">` 사용.

---

## 2. 각 파일의 역할 요약

### index.html
- `<header>`: 타이틀("2048"), 현재 점수 박스, 최고 점수 박스, 새 게임 버튼.
- `<main>`: 4×4 그리드 컨테이너 `#grid` (16개 셀 `.cell`).
- 오버레이 `#overlay`: 게임 오버 또는 2048 달성 메시지 + 재시작 버튼.
- `<script type="module" src="js/game.js">` 태그 하나만.

### css/style.css
- CSS 변수로 색상 토큰 관리 (라이트/다크).
- 그리드 레이아웃: `display: grid; grid-template-columns: repeat(4, 1fr)`.
- 타일 숫자별 배경색 (2 ~ 2048 이상 각각 다른 색).
- 타일 이동 트랜지션 (`transform`, `opacity`).
- 오버레이 (`position: fixed`, 반투명 배경).
- `@media (prefers-color-scheme: dark)` 다크 모드.
- `@media (max-width: 480px)` 모바일 대응 (그리드 크기, 폰트 축소).

### js/game.js
- 상태 관리: `state = { board, score, best, status }`.
- 타일 이동 알고리즘 (행/열 단위 슬라이드 + 합산).
- 점수 계산 및 `localStorage` 저장/복원.
- DOM 렌더링 (diff 없이 매 이동마다 전체 재렌더).
- 키보드 이벤트 (`keydown` — 방향키 4개).
- 터치 이벤트 (`touchstart` / `touchend` — 스와이프 방향 판별).
- 게임 오버 / 2048 달성 감지 후 오버레이 표시.
- 새 게임 초기화 함수.

---

## 3. 게임 로직 핵심 설명

### 3-1. 보드 표현

```
board: number[4][4]  // 0 = 빈 칸, 그 외 = 타일 숫자
```

### 3-2. 타일 이동 알고리즘 (핵심: 한 행/열을 슬라이드)

이동은 방향에 따라 **행 또는 열을 추출 → 슬라이드 → 기록**하는 과정이다.

**`slide(line: number[]): { result: number[], gained: number }`**

```
1. 0을 제거해 숫자만 남긴다.         [0,2,2,4] → [2,2,4]
2. 왼쪽부터 인접한 같은 쌍을 합친다.  [2,2,4] → [4,4]  (+4 득점)
   - 한 번 합쳐진 타일은 같은 이동에서 다시 합쳐지지 않는다.
3. 뒤를 0으로 채워 길이 4로 맞춘다.  [4,4] → [4,4,0,0]
```

**방향별 처리 방법**

| 방향  | 처리 단위 | 슬라이드 방향 |
|-------|-----------|---------------|
| ←     | 각 행 그대로 | slide() 직접 적용 |
| →     | 각 행 반전 후 slide(), 재반전 | |
| ↑     | 각 열을 행으로 추출 후 slide(), 재삽입 | |
| ↓     | 각 열 반전 후 slide(), 재반전, 재삽입 | |

이렇게 하면 `slide()` 함수 하나로 4방향을 모두 처리할 수 있다.

### 3-3. 새 타일 생성

이동 후 보드가 **변경된 경우에만** 빈 칸 중 무작위 하나를 선택해 타일 추가.
- 90% 확률: 숫자 2
- 10% 확률: 숫자 4

### 3-4. 점수 계산

- 이동 한 번에 합쳐진 타일들의 합을 `score`에 누적한다.
  - 예: `[2,2]` → `[4]` 이면 +4
  - 예: `[4,4,2,2]` → `[8,4]` 이면 +8+4 = +12
- 이동 후 `score > best`이면 `best = score`로 갱신.
- `score`, `best` 모두 `localStorage`에 키 `'2048-score'`, `'2048-best'`로 저장.

### 3-5. 게임 오버 판정

다음 두 조건을 모두 만족하면 게임 오버:
1. 빈 칸(`0`)이 없다.
2. 상하좌우 인접 타일 중 같은 숫자 쌍이 하나도 없다.

### 3-6. 2048 달성 판정

타일이 합쳐진 직후, 보드에 `2048`이 존재하면 달성으로 처리.
달성 후에도 계속 플레이할 수 있도록 오버레이에 "계속하기" 버튼 제공.

---

## 4. UI/UX 결정사항

### 4-1. 색상 토큰

```css
/* 라이트 모드 */
--bg:        #faf8ef;   /* 전통적인 2048 배경 */
--grid-bg:   #bbada0;
--cell-bg:   #cdc1b4;   /* 빈 셀 */
--text:      #776e65;
--text-light:#f9f6f2;
--accent:    #8f7a66;

/* 다크 모드 (prefers-color-scheme: dark) */
--bg:        #1a1a2e;
--grid-bg:   #2a2a3e;
--cell-bg:   #3a3a4e;
--text:      #e8e8e8;
--text-light:#ffffff;
--accent:    #60a5fa;
```

### 4-2. 타일 색상 (숫자별)

| 숫자   | 배경색    | 글자색      |
|--------|-----------|-------------|
| 2      | `#eee4da` | `--text`    |
| 4      | `#ede0c8` | `--text`    |
| 8      | `#f2b179` | `--text-light` |
| 16     | `#f59563` | `--text-light` |
| 32     | `#f67c5f` | `--text-light` |
| 64     | `#f65e3b` | `--text-light` |
| 128    | `#edcf72` | `--text-light` |
| 256    | `#edcc61` | `--text-light` |
| 512    | `#edc850` | `--text-light` |
| 1024   | `#edc53f` | `--text-light` |
| 2048   | `#edc22e` | `--text-light` |
| 2048+  | `#3c3a32` | `--text-light` |

### 4-3. 레이아웃

- 최대 너비 500px, 화면 중앙 정렬.
- 헤더: 제목(왼쪽) + 점수 박스(오른쪽) + 새 게임 버튼.
- 그리드: 정사각형 유지 (`aspect-ratio: 1 / 1` 또는 고정 px).
- 그리드 gap: `12px`. 셀 모서리: `border-radius: 6px`.
- 타일 폰트: 굵게(`font-weight: 700`), 숫자가 길수록 폰트 축소.
  - 1–3자리: `2rem`
  - 4자리: `1.5rem`
  - 5자리 이상: `1.1rem`

### 4-4. 애니메이션

- 타일 등장: `scale(0) → scale(1)`, duration 150ms.
- 타일 합체: 순간적으로 `scale(1.1) → scale(1)`, duration 100ms.
- `@media (prefers-reduced-motion: reduce)` 적용 시 전환 없음.

### 4-5. 터치 스와이프

`touchstart`에서 시작 좌표 저장, `touchend`에서 델타 계산.
- `|dx| > |dy|` 이면 수평 이동 (← 또는 →).
- `|dy| > |dx|` 이면 수직 이동 (↑ 또는 ↓).
- 최소 이동 거리 임계값: `30px` (오탐 방지).

---

## 5. 구현 순서

### Step 1 — HTML 뼈대 (`index.html`)
- 헤더 (제목, 점수 박스 2개, 새 게임 버튼) 작성.
- 그리드 컨테이너 `#grid` 와 16개 `.cell` 작성.
- 오버레이 `#overlay` 작성 (초기 `display: none`).
- `<script type="module" src="js/game.js">` 연결.

### Step 2 — 스타일 기반 (`css/style.css`)
- CSS 변수 정의 (라이트/다크).
- 헤더, 그리드, 셀 레이아웃.
- 타일 숫자별 색상 클래스 `.tile-2`, `.tile-4` … `.tile-2048`, `.tile-super`.
- 오버레이 스타일.
- 모바일 미디어 쿼리 (`max-width: 480px`).
- `prefers-reduced-motion` 처리.

### Step 3 — 핵심 게임 로직 (`js/game.js`)
- `slide()` 함수 구현 및 단위 테스트 (콘솔).
- `move(direction)` 함수 구현 (4방향).
- `spawnTile()` 함수.
- `checkGameOver()`, `checkWin()` 함수.

### Step 4 — 상태 → DOM 렌더링
- `render()` 함수: `board` 배열을 읽어 그리드 DOM 갱신.
- 점수 표시 업데이트.
- 오버레이 표시/숨김 로직.

### Step 5 — 이벤트 연결
- `keydown` — 방향키 처리.
- `touchstart` / `touchend` — 스와이프 처리.
- 새 게임 버튼 클릭 핸들러.
- 오버레이 재시작 / 계속하기 버튼 핸들러.

### Step 6 — 점수 영속화
- `localStorage`에서 `best` 불러오기 (초기화 시).
- 이동 후 `score`, `best` 저장.

### Step 7 — 마무리 검증
- 브라우저에서 `python -m http.server 8000` 또는 `npx serve .` 로 실행.
- 4방향 이동, 합산, 게임 오버, 2048 달성, 새 게임, 다크 모드 동작 확인.
- 모바일 크기 (`480px` 이하)에서 레이아웃 깨짐 없는지 확인.
- `localStorage` 저장/복원 정상 동작 확인.

---

## 로컬 실행

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve apps/2048
```

브라우저에서 `http://localhost:8000` 접속.
