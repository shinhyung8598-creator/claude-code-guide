# 오늘 배운 클로드 코드

클로드 코드로 마크다운 블로그를 직접 만들어봤다. 프레임워크 없이 HTML, CSS, JavaScript만으로 웹사이트가 동작하는 걸 보면서 각 언어의 역할이 훨씬 선명하게 느껴졌다.

## HTML — 뼈대

HTML은 페이지의 **구조**를 담당한다. 무엇이 제목이고, 무엇이 본문이고, 무엇이 링크인지를 정의한다.

```html
<header>
  <a href="index.html">My Blog</a>
  <button id="theme-toggle">☾</button>
</header>
<main>
  <article id="post-content"></article>
</main>
```

`<header>`, `<main>`, `<article>` 같은 시맨틱 태그를 쓰면 브라우저와 검색엔진이 페이지 구조를 제대로 이해한다. 그냥 `<div>`만 쓰는 것보다 의미가 명확해진다.

## CSS — 옷

CSS는 HTML 뼈대에 **시각적 스타일**을 입힌다. 색상, 폰트, 여백, 배치를 모두 여기서 결정한다.

이번 블로그에서 가장 유용하게 쓴 기능은 **CSS 변수**다.

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --accent: #2563eb;
}

[data-theme='dark'] {
  --bg: #0f0f0f;
  --text: #e8e8e8;
  --accent: #60a5fa;
}
```

변수를 두 세트 정의해두면, `data-theme` 속성 하나만 바꿔도 페이지 전체가 다크 모드로 바뀐다. JavaScript가 색상을 일일이 바꿀 필요가 없다.

미디어 쿼리로 모바일 대응도 했다.

```css
@media (max-width: 768px) {
  .container { padding: 0 1rem; }
  article h1 { font-size: 1.6rem; }
}
```

## JavaScript — 동작

JavaScript는 페이지에 **상호작용과 동적 기능**을 넣는다. 이번 블로그에서 JS가 한 일은 크게 세 가지다.

**1. 포스트 목록 불러오기**

```js
const res = await fetch('posts/index.json');
const posts = await res.json();
```

`fetch`로 JSON 파일을 읽어서 카드 목록을 동적으로 생성했다.

**2. 마크다운 렌더링**

```js
const mdText = await fetch(`posts/${slug}.md`).then(r => r.text());
document.getElementById('post-content').innerHTML = marked.parse(mdText);
```

마크다운 파일을 텍스트로 읽은 뒤 `marked.js`로 HTML로 변환해 삽입한다.

**3. 다크 모드 토글**

```js
document.documentElement.setAttribute('data-theme', 'dark');
localStorage.setItem('blog-theme', 'dark');
```

`data-theme`을 바꾸면 CSS 변수가 즉시 교체되고, `localStorage`에 저장해두면 새로고침해도 설정이 유지된다.

## 정리

| 언어 | 역할 | 키워드 |
|------|------|--------|
| HTML | 구조 | 시맨틱 태그, 콘텐츠 |
| CSS | 스타일 | 변수, 미디어 쿼리, 다크 모드 |
| JavaScript | 동작 | fetch, DOM 조작, localStorage |

세 언어가 각자 맡은 역할에 집중할수록 코드가 깔끔해진다. CSS가 할 수 있는 건 CSS에게, JS는 꼭 필요한 동작만 담당하는 것이 핵심이었다.
