# 2048 게임 — build 지침

## 역할
이 파일을 받은 서브에이전트는 2048 퍼즐 게임을 구현한다.

## 작업 범위
`C:\Users\82103\Desktop\claude_exame\apps\2048\` 폴더 내 파일만 생성/수정한다.
블로그의 다른 파일(index.html, css/, js/, posts/ 등)은 절대 건드리지 않는다.

## 만들어야 할 파일
1. `apps/2048/index.html`
2. `apps/2048/css/style.css`
3. `apps/2048/js/game.js`

## spec 요약 (apps/2048/spec.md 참고)

### 기능
- 4×4 그리드, 방향키(↑↓←→)로 타일 이동
- 터치 스와이프 지원 (임계값 30px)
- 같은 숫자 타일이 부딪히면 합산
- 점수판: 현재 점수 + 최고 점수 (localStorage 저장)
- 2048 달성 감지 → 오버레이 + "계속하기" 버튼
- 게임 오버 감지 → 오버레이 + "다시하기" 버튼
- 새 게임 버튼
- 다크 모드 (prefers-color-scheme: dark)
- 모바일 반응형 (max-width: 480px)

### 핵심 알고리즘
slide(line) 함수로 4방향 처리:
1. 0 제거 → 숫자만 추출
2. 왼쪽부터 인접 같은 수 합산 (한 번 합친 타일은 재합산 금지)
3. 0으로 채워 길이 4 맞춤

방향별:
- ←: 각 행에 slide() 직접 적용
- →: 각 행 반전 후 slide(), 재반전
- ↑: 각 열 추출 후 slide(), 재삽입
- ↓: 각 열 반전 후 slide(), 재반전, 재삽입

### 색상 토큰
라이트: --bg:#faf8ef, --grid-bg:#bbada0, --cell-bg:#cdc1b4
다크: --bg:#1a1a2e, --grid-bg:#2a2a3e, --cell-bg:#3a3a4e

타일 색상 (숫자 → 배경):
2:#eee4da, 4:#ede0c8, 8:#f2b179, 16:#f59563, 32:#f67c5f,
64:#f65e3b, 128:#edcf72, 256:#edcc61, 512:#edc850,
1024:#edc53f, 2048:#edc22e, 2048+:#3c3a32

### 레이아웃
- 최대 너비 500px, 중앙 정렬
- 그리드 gap 12px, 셀 border-radius 6px
- 폰트: 1-3자리 2rem, 4자리 1.5rem, 5자리+ 1.1rem

### 애니메이션
- 타일 등장: scale(0→1) 150ms
- prefers-reduced-motion 존중

## 구현 규칙
- 빌드 도구 없음, CDN 없음
- `<script type="module">` 사용
- 인라인 스타일 금지
- 세미콜론 있음, 작은따옴표, 스페이스 2칸 들여쓰기
