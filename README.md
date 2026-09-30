# TelegramCommander Mini App 페이지

텔레그램 봇 TelegramCommander 가 여는 정적 페이지(`WEBAPP_URL`). 원본은 agent-playground 저장소 `TelegramCommander/webapp/` 이고 이 브랜치는 게시용 사본이다.

- `index.html` — 시크릿 암호화 입력(공개키는 주소 `?k=` 로 받는다)
- `view.html` — 통합 뷰어(글·JSON·Markdown·Mermaid·리더). 데이터는 주소 `#` 뒤에만 실려 서버로 가지 않는다
- `vendor/` — marked · DOMPurify · mermaid · Readability (버전·sha256 은 `vendor/VERSIONS.txt`)
