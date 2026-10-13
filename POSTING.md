# 글 올리는 방법 (Blog & Updates)

홈페이지의 **Blog** 메뉴는 `posts/` 폴더의 마크다운(.md) 파일을 그대로 읽어서 보여줍니다.
서버나 관리자 로그인 없이, **GitHub에 파일 하나를 올리는 것**이 곧 게시입니다.
휴대폰·노트북 어디서든 가능하고, 올린 뒤 1~2분이면 https://soorobotics.org/blog.html 에 반영됩니다.

## 방법 1 — 글쓰기 페이지 (가장 쉬움)

1. https://soorobotics.org/write.html 접속 (휴대폰 브라우저도 됩니다)
2. 제목, 본문, 태그 등을 입력 → 오른쪽에 미리보기가 보입니다
3. **GitHub에 올리기** 클릭 → 내용이 채워진 GitHub 새 파일 화면이 열립니다 (GitHub 로그인 필요)
4. 화면 오른쪽 위 **Commit changes...** → 다시 **Commit changes** 클릭. 끝.

쓰는 중인 내용은 그 기기 브라우저에 자동 저장되므로 중간에 닫아도 이어서 쓸 수 있습니다.

## 방법 2 — GitHub 앱 / 웹에서 직접 파일 만들기

1. 저장소 https://github.com/jewonlee72/SooRobotics → `posts` 폴더
2. **Add file → Create new file**
3. 파일 이름: `2026-10-20-hanoi-expo.md` 형식 (날짜-영문이름.md)
4. 내용은 `posts/_template.md` 를 복사해서 채웁니다:

```markdown
---
title: 하노이 드론 전시회 참가
date: 2026-10-20
lang: ko
tags: 베트남, 출장, 드론
summary: 목록에 보일 한 줄 요약
cover: images/2026-10-hanoi.jpg
---

본문은 마크다운으로 씁니다.

## 소제목

![사진 설명](images/2026-10-hanoi.jpg)
```

5. **Commit changes**

| 항목 | 설명 |
|---|---|
| `title` | 글 제목 (필수) |
| `date` | 날짜 `YYYY-MM-DD`. 목록 정렬 기준 |
| `lang` | `ko` 또는 `en`. 영문 블로그(en/blog.html)에는 `en` 글이 기본 표시 |
| `tags` | 쉼표로 구분 |
| `summary` | 목록 카드에 보일 요약. 비우면 본문 앞부분 자동 사용 |
| `cover` | 대표 이미지 (선택). `posts/` 기준 경로 |
| `draft: true` | 넣으면 목록에서 숨김 (작성 중인 글) |

## 사진 올리기

1. https://github.com/jewonlee72/SooRobotics/upload/main/posts/images 에서 사진을 끌어다 놓고 **Commit changes**
2. 본문에 `![설명](images/파일명.jpg)` 로 넣습니다.

휴대폰 사진은 용량이 크므로 가능하면 1~2MB 이하로 줄여서 올리는 것이 좋습니다 (GitHub 파일당 최대 25MB).

## 글 수정 / 삭제

- 수정: 글 맨 아래 **GitHub에서 편집** 클릭 → 고치고 Commit
- 삭제: GitHub에서 해당 .md 파일 열기 → 오른쪽 `...` → **Delete file**
- 잠시 숨기기: 맨 위에 `draft: true` 한 줄 추가

## 동작 원리 (참고)

- `posts/*.md` 가 올라오면 GitHub Actions(`.github/workflows/posts-index.yml`)가 `posts/index.json` 목록을 자동 생성해 커밋합니다.
- `blog.html` / `en/blog.html` 은 이 목록을 읽어 카드로 표시하고, `post.html?p=파일명` 이 본문을 마크다운으로 렌더링합니다.
- 목록 파일이 아직 안 만들어졌더라도 페이지가 GitHub API로 직접 `posts/` 폴더를 읽으므로 새 글은 바로 보입니다.
- 메인 페이지 하단 **LATEST** 줄에는 가장 최근 글 제목이 자동으로 표시됩니다.
