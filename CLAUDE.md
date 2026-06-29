# My Blog — CLAUDE.md

## 프로젝트 개요

마크다운 파일을 읽어 렌더링하는 정적 블로그 웹사이트.
프레임워크 없이 순수 HTML, CSS, JavaScript로만 구현한다.

## 기술 스택

- **HTML5** — 시맨틱 마크업
- **CSS3** — 커스텀 프로퍼티(변수), Flexbox, Grid
- **JavaScript (ES6+)** — 빌드 도구 없이 네이티브 모듈 또는 단일 스크립트
- **마크다운 파서** — CDN에서 로드하는 `marked.js` (외부 의존성은 이것만 허용)

## 디렉터리 구조

```
my-blog/
├── CLAUDE.md
├── index.html          # 포스트 목록 페이지
├── post.html           # 개별 포스트 렌더링 페이지
├── css/
│   └── style.css       # 전체 스타일 (다크 모드 포함)
├── js/
│   └── main.js         # 마크다운 로드·렌더링·라우팅 로직
└── posts/
    ├── index.json      # 포스트 메타데이터 목록 (title, date, slug, description)
    └── *.md            # 마크다운 포스트 파일
```

## 디자인 원칙

- **타이포그래피 우선** — 본문 가독성이 핵심. 줄 길이는 최대 70ch.
- **다크 모드** — `prefers-color-scheme: dark` 미디어 쿼리 + `data-theme` 속성으로 수동 토글 지원.
- **모바일 반응형** — 모바일 퍼스트. 브레이크포인트는 `768px` 하나만 사용.
- **애니메이션 최소화** — `prefers-reduced-motion` 존중.
- **폰트** — 시스템 폰트 스택 사용. 외부 폰트 CDN 금지.

### 색상 토큰 (CSS 변수)

```css
/* 라이트 모드 */
--bg: #ffffff;
--surface: #f5f5f5;
--text: #1a1a1a;
--text-muted: #666666;
--accent: #2563eb;
--border: #e0e0e0;

/* 다크 모드 */
--bg: #0f0f0f;
--surface: #1a1a1a;
--text: #e8e8e8;
--text-muted: #999999;
--accent: #60a5fa;
--border: #2a2a2a;
```

## posts/index.json 형식

```json
[
  {
    "slug": "hello-world",
    "title": "Hello World",
    "date": "2026-01-01",
    "description": "첫 번째 포스트입니다."
  }
]
```

- `slug`는 `posts/{slug}.md` 파일명과 일치해야 한다.
- 날짜 내림차순으로 정렬해서 저장한다.

## 구현 규칙

1. **빌드 단계 없음** — `npm`, `webpack`, `vite` 등 일체 사용 금지.
2. **외부 스크립트는 marked.js CDN 하나만** — 다른 라이브러리 추가 금지.
3. **인라인 스타일 금지** — 모든 스타일은 `css/style.css`에서 관리.
4. **`<script type="module">`** — ES 모듈 문법 사용 (로컬에서 HTTP 서버로 열어야 동작).
5. **접근성** — `<nav>`, `<main>`, `<article>` 등 시맨틱 태그 필수. 이미지에 `alt` 속성 필수.
6. **다크 모드 토글** — 헤더 오른쪽에 버튼 배치. 선택값은 `localStorage`에 저장.

## 로컬 실행

```bash
# Python 3
python -m http.server 8000

# Node.js (npx 허용)
npx serve .
```

브라우저에서 `http://localhost:8000` 접속.

## 코드 스타일

- 들여쓰기: 스페이스 2칸
- 세미콜론: 있음
- 문자열: 작은따옴표(`'`)
- 주석: 명백한 코드에는 달지 않는다. WHY가 불명확할 때만 한 줄.
