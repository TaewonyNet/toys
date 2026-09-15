/*!
 * markdown-viewer — 브라우저에 «날것으로» 떠 있는 마크다운을 읽을 수 있게 만든다.
 *
 * 무엇을 하는가
 *   .md 파일을 브라우저로 열면 본문이 통째로 평문 한 덩어리로 나온다. 이 스크립트를
 *   그 페이지에 주입하면 document.body 의 텍스트를 마크다운으로 해석해 다시 그린다.
 *   mermaid 코드펜스는 다이어그램으로 렌더하고, 코드블록과 다이어그램에는 복사·
 *   다운로드·이미지 저장 손잡이를 붙인다.
 *
 * 쓰는 법 — 북마크릿
 *   북마크 주소에 아래를 넣고, .md 를 연 탭에서 누른다.
 *     javascript:(function(){var s=document.createElement('script');
 *     s.charset='utf-8';s.src='<이 파일의 CDN 주소>';document.body.appendChild(s);})();
 *
 *   charset='utf-8' 을 빼지 말 것. 스크립트를 charset 없이 내려주는 호스트에서는
 *   이 파일 «안» 의 한글·이모지가 Latin-1 로 읽혀 버튼 라벨이 통째로 깨진다
 *   (실측: "📝 MD" 가 "ðŸ" MD" 로 나온다). 본문 쪽 깨짐은 아래 resolveSource()
 *   가 따로 처리한다 — 둘은 원인이 다르므로 한쪽만 고치면 나머지가 남는다.
 *
 * 버튼 언어
 *   navigator.languages 를 보고 ko · en · ja · zh · pt 중에서 고른다. 목록에
 *   없는 언어는 영어로 떨어진다 — 아이콘만 남겨 두는 것보다 낫다. 이 뷰어는
 *   링크로 남에게 건네질 수 있고, 받는 쪽이 한글을 읽는다는 보장이 없다.
 *
 * 설계에서 지키는 것
 *   - 원본을 먼저 잡는다. rawText 는 body 를 갈아엎기 «전에» 읽는다. 그 시점을
 *     놓치면 원본 마크다운을 어디서도 되찾을 수 없고, MD 복사·저장이 렌더 결과를
 *     주는 가짜가 된다.
 *   - 한 번만 돈다. window.__md_v 로 재주입을 막는다. 두 번 돌면 이미 렌더된
 *     HTML 을 마크다운으로 다시 해석해 본문이 깨진다.
 *   - 도구는 CDN 에서 늦게 받는다(marked · mermaid · github-markdown-css).
 *     북마크릿은 파일 하나로 배포되어야 하므로 번들하지 않는다.
 *
 * 알려진 한계
 *   - CDN 세 곳에 네트워크가 필요하다. 오프라인에서는 렌더되지 않는다.
 *   - CSP 가 외부 스크립트를 막는 페이지에서는 주입이 실패한다. file:// 과
 *     평범한 정적 호스팅에서는 문제되지 않는다.
 *   - raw.githubusercontent.com 은 «스크립트 자체» 가 막힌다. 그쪽은
 *     `Content-Security-Policy: default-src 'none'; sandbox` 를 보내는데, sandbox 에
 *     allow-scripts 가 없어 북마크릿이 발화조차 못 한다. 그 페이지에서는 이 코드도
 *     안 돌므로 여기서 고칠 수 없다 — jsDelivr 주소로 «가서» 누른다.
 *     주소 변환은 별도 북마크릿으로 뒀다(markdownveiwer.md 참고). 렌더러가 페이지를
 *     옮기면, 눌렀는데 렌더는 안 되고 주소만 바뀌어 무엇이 일어났는지 알 수 없다.
 *   - 클립보드 API 는 보안 컨텍스트(https · localhost · file://)에서만 동작한다.
 *
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 강태원
 *
 * 이 스크립트가 실행 중에 받아 쓰는 것들은 각자의 라이선스를 따른다 —
 * marked(MIT) · mermaid(MIT) · github-markdown-css(MIT).
 */
(function () {
  if (window.__md_v) return;
  window.__md_v = 1;

  // 버튼 문구는 브라우저 언어를 따른다. 이 뷰어는 남에게 링크로 건네질 수 있고,
  // 받는 쪽이 한글을 못 읽으면 아이콘만 남아 무엇을 하는 버튼인지 알 수 없다.
  const I18N = {
    ko: { md:'MD', mdT:'원본 마크다운 복사', html:'HTML', htmlT:'렌더된 HTML 복사',
          img:'이미지', imgT:'본문을 이미지로 복사', save:'.md', saveT:'원본 마크다운 저장',
          top:'맨 위로', bottom:'맨 아래로', toLight:'라이트 모드로', toDark:'다크 모드로',
          copy:'복사', copyCode:'코드 복사', down:'다운로드', downSrc:'소스 다운로드',
          saveImg:'이미지 저장', reset:'크기 초기화', resetT:'끌어서 바꾼 크기를 되돌린다',
          docInfo:'문서 정보', done:'완료' },
    en: { md:'MD', mdT:'Copy source Markdown', html:'HTML', htmlT:'Copy rendered HTML',
          img:'Image', imgT:'Copy page as image', save:'.md', saveT:'Save source Markdown',
          top:'Top', bottom:'Bottom', toLight:'Switch to light', toDark:'Switch to dark',
          copy:'Copy', copyCode:'Copy code', down:'Download', downSrc:'Download source',
          saveImg:'Save image', reset:'Reset size', resetT:'Undo the size you dragged',
          docInfo:'Document info', done:'Done' },
    ja: { md:'MD', mdT:'元のMarkdownをコピー', html:'HTML', htmlT:'描画されたHTMLをコピー',
          img:'画像', imgT:'本文を画像としてコピー', save:'.md', saveT:'元のMarkdownを保存',
          top:'先頭へ', bottom:'末尾へ', toLight:'ライトモードへ', toDark:'ダークモードへ',
          copy:'コピー', copyCode:'コードをコピー', down:'ダウンロード', downSrc:'ソースをダウンロード',
          saveImg:'画像を保存', reset:'サイズを戻す', resetT:'ドラッグで変えたサイズを戻す',
          docInfo:'ドキュメント情報', done:'完了' },
    zh: { md:'MD', mdT:'复制原始 Markdown', html:'HTML', htmlT:'复制渲染后的 HTML',
          img:'图片', imgT:'将正文复制为图片', save:'.md', saveT:'保存原始 Markdown',
          top:'回到顶部', bottom:'跳到底部', toLight:'切换为浅色', toDark:'切换为深色',
          copy:'复制', copyCode:'复制代码', down:'下载', downSrc:'下载源码',
          saveImg:'保存图片', reset:'重置大小', resetT:'撤销拖动后的大小',
          docInfo:'文档信息', done:'完成' },
    pt: { md:'MD', mdT:'Copiar Markdown original', html:'HTML', htmlT:'Copiar HTML renderizado',
          img:'Imagem', imgT:'Copiar conteúdo como imagem', save:'.md', saveT:'Salvar Markdown original',
          top:'Ir ao topo', bottom:'Ir ao fim', toLight:'Modo claro', toDark:'Modo escuro',
          copy:'Copiar', copyCode:'Copiar código', down:'Baixar', downSrc:'Baixar fonte',
          saveImg:'Salvar imagem', reset:'Redefinir tamanho', resetT:'Desfaz o tamanho arrastado',
          docInfo:'Informações do documento', done:'Concluído' },
  };
  const LANG = (function () {
    const cands = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || 'en'];
    for (const c of cands) {
      const l = String(c).toLowerCase();
      if (l.startsWith('ko')) return 'ko';
      if (l.startsWith('ja')) return 'ja';
      if (l.startsWith('zh')) return 'zh';
      if (l.startsWith('pt')) return 'pt';
      if (l.startsWith('en')) return 'en';
    }
    return 'en';   // 모르는 언어는 영어로 — 아이콘만 남기는 것보다 낫다
  })();
  const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;

  // 원본은 body 를 갈아엎기 «전에» 잡는다. 이 시점을 놓치면 되찾을 수 없다.
  let rawText = document.body.innerText || document.body.textContent;

  // 서버가 .md 를 charset 없이 내려주면 브라우저가 Latin-1 로 읽어 한글이
  // 깨진다(실측: `text/markdown` 만 오면 "하네스" 가 "í•˜ë„¤ìŠ¤" 가 된다).
  // 정적 호스팅에서 흔한 일이라 여기서 되살린다 — 같은 URL 을 바이트로 다시
  // 받아 UTF-8 로 해독한다. 깨진 흔적이 없으면 요청 자체를 만들지 않는다.
  const looksMojibake = /[\u00C3\u00C2\u00E2][\u0080-\u00BF]/.test(rawText);
  async function resolveSource() {
    if (!looksMojibake) return rawText;
    try {
      const res = await fetch(location.href, { cache: 'force-cache' });
      if (!res.ok) return rawText;
      const text = new TextDecoder('utf-8').decode(await res.arrayBuffer());
      return text || rawText;
    } catch (e) {
      return rawText;   // file:// 등 fetch 가 막히면 원래 값을 쓴다
    }
  }

  // 본문 타이포그래피는 «인라인» 으로 넣는다. 외부 .css 를 걸면 style-src 가 좁은
  // 페이지에서 통째로 막힌다(실측: raw.githubusercontent.com 은
  // `style-src 'unsafe-inline'` 만 허용해 CDN 스타일시트가 차단된다). 인라인
  // <style> 은 그 CSP 에서도 통과한다.
  const baseCss = document.createElement('style');
  baseCss.textContent = [
    '.markdown-body{word-wrap:break-word}',
    '.markdown-body>*:first-child{margin-top:0}',
    '.markdown-body h1,.markdown-body h2{padding-bottom:.3em;border-bottom:1px solid rgba(128,128,128,.3)}',
    '.markdown-body h1{font-size:2em;margin:.67em 0}',
    '.markdown-body h2{font-size:1.5em;margin:1.6em 0 .6em}',
    '.markdown-body h3{font-size:1.25em;margin:1.4em 0 .5em}',
    '.markdown-body h4,.markdown-body h5,.markdown-body h6{margin:1.2em 0 .4em}',
    '.markdown-body p,.markdown-body ul,.markdown-body ol{margin:0 0 1em}',
    '.markdown-body ul,.markdown-body ol{padding-left:2em}',
    '.markdown-body li+li{margin-top:.25em}',
    '.markdown-body blockquote{margin:0 0 1em;padding:0 1em;border-left:.25em solid rgba(128,128,128,.4);opacity:.85}',
    '.markdown-body table{border-collapse:collapse;display:block;overflow:auto;margin:0 0 1em}',
    '.markdown-body th,.markdown-body td{padding:6px 13px;border:1px solid rgba(128,128,128,.4)}',
    '.markdown-body th{font-weight:700;background:rgba(128,128,128,.12)}',
    '.markdown-body hr{height:1px;border:0;background:rgba(128,128,128,.35);margin:1.6em 0}',
    '.markdown-body a{color:#3b82f6;text-decoration:none}',
    '.markdown-body a:hover{text-decoration:underline}',
    '.markdown-body img{max-width:100%}',
    '.markdown-body code,.markdown-body pre{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}',
  ].join('');
  document.head.appendChild(baseCss);

  // ── 내장 렌더러 ─────────────────────────────────────────────────────────
  // marked 를 못 받는 페이지가 있다. raw.githubusercontent.com 이 그렇다 —
  // `default-src 'none'` 이라 CDN 에서 아무것도 못 가져온다. 거기서도 «읽을 수는
  // 있게» 최소한의 마크다운을 직접 그린다. marked 가 있으면 그쪽을 쓴다.
  //
  // 완전한 구현이 아니다. 중첩 목록·각주·정의 목록 같은 것은 다루지 않는다.
  // 목적은 «CDN 이 막힌 곳에서 문서를 읽는 것» 이지 marked 를 대체하는 것이 아니다.
  const esc = (x) => String(x).replace(/[&<>]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function inline(x) {
    return esc(x)
      .replace(/`([^`]+)`/g, (m, c) => '<code>' + c + '</code>')
      .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, '<img alt="$1" src="$2">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>');
  }

  function renderMarkdown(md) {
    const out = [];
    const lines = md.split('\n');
    let i = 0;
    let para = [];
    const flush = () => {
      if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; }
    };
    while (i < lines.length) {
      const line = lines[i];

      // 코드 펜스 — 안쪽은 손대지 않는다
      const fence = line.match(/^\s*```+\s*([\w-]*)\s*$/);
      if (fence) {
        flush();
        const lang = fence[1] || '';
        const buf = [];
        i++;
        while (i < lines.length && !/^\s*```+\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push('<pre><code' + (lang ? ' class="language-' + lang + '"' : '') + '>'
                 + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }

      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { flush(); out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>'); i++; continue; }

      if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line)) { flush(); out.push('<hr>'); i++; continue; }

      // 표 — 헤더 + 구분줄이 있어야 표로 본다
      if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
        flush();
        const cells = (r) => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => inline(c.trim()));
        const head = cells(line);
        i += 2;
        const body = [];
        while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) { body.push(cells(lines[i])); i++; }
        out.push('<table><thead><tr>' + head.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>'
                 + body.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('')
                 + '</tbody></table>');
        continue;
      }

      if (/^\s*>/.test(line)) {
        flush();
        const buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        out.push('<blockquote>' + renderMarkdown(buf.join('\n')) + '</blockquote>');
        continue;
      }

      const li = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
      if (li) {
        flush();
        const ordered = /\d/.test(li[1]);
        const items = [];
        while (i < lines.length) {
          const m2 = lines[i].match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
          if (!m2) break;
          items.push('<li>' + inline(m2[2]) + '</li>');
          i++;
        }
        out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>'));
        continue;
      }

      if (!line.trim()) { flush(); i++; continue; }
      para.push(line.trim());
      i++;
    }
    flush();
    return out.join('\n');
  }

  // 라이브러리가 막히면 «조용히» 멈추지 않는다. onload 만 달아두면 CSP 가 스크립트를
  // 차단했을 때 콜백이 영영 안 불려, 사용자에게는 아무 일도 안 일어난 것처럼 보인다.
  function loadScript(src, callback, onFail) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => { if (onFail) onFail(src); };
    document.head.appendChild(script);
  }

  // 라이브러리를 못 받아도 «읽을 수는 있게» 한다. 무엇이 빠졌는지는 알려준다 —
  // 조용히 축소되면 mermaid 다이어그램이 코드블록으로 보이는 이유를 알 수 없다.
  let degraded = null;
  function noteDegraded(what) {
    if (!degraded) {
      degraded = document.createElement('div');
      degraded.id = '__md_degraded';
      degraded.style.cssText = 'margin:48px auto 8px;max-width:960px;padding:8px 12px;'
        + 'border-radius:6px;background:rgba(180,83,9,.15);border:1px solid rgba(180,83,9,.5);'
        + 'font:12px/1.6 sans-serif';
    }
    degraded.textContent = '이 페이지의 CSP 가 외부 스크립트를 막아 ' + what
      + ' 없이 그렸습니다. 본문과 복사 기능은 그대로 씁니다.';
  }

  // 둘 다 «있으면 쓰고 없으면 넘어간다». 예전에는 onload 만 달려 있어 차단되면
  // 콜백이 영영 안 불렸다 — 사용자에게는 아무 일도 안 일어난 것처럼 보였다.
  function tryLoad(src, label) {
    return new Promise((resolve) => {
      const sc = document.createElement('script');
      sc.src = src;
      sc.onload = () => resolve(true);
      sc.onerror = () => { noteDegraded(label); resolve(false); };
      document.head.appendChild(sc);
      // CSP 가 막으면 onerror 가 안 오는 브라우저도 있어 시한을 둔다
      setTimeout(() => resolve(false), 6000);
    });
  }

  (async () => {
    await tryLoad('https://cdn.jsdelivr.net/npm/marked/marked.min.js', 'marked');
    await tryLoad('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js', 'mermaid');
    await (async () => {
      rawText = await resolveSource();

      let isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      // 1. 공통 CSS 스타일 정의
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; transition: background-color 0.2s, color 0.2s; }
        /* 고정 툴바가 첫 문단을 덮지 않도록 그 높이만큼 비워 둔다 */
          .viewer-container { max-width: 960px; margin: 0 auto; padding-top: 44px; padding-bottom: 60px; }
        
        /* 상단 툴바 */
        /* 스크롤해도 따라오게 고정하고, 본문을 가리지 않도록 작게 */
          .top-toolbar {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            display: flex; justify-content: space-between; align-items: center;
            gap: 8px; padding: 5px 12px; backdrop-filter: blur(8px);
          }
        .btn-group { display: flex; gap: 4px; }
        .tool-btn {
            padding: 3px 8px; font-size: 11px; font-weight: 600; line-height: 1.5;
            border-radius: 5px; cursor: pointer; white-space: nowrap; transition: all 0.15s;
          }
          /* 좁은 화면에서는 글자를 숨기고 아이콘만 남긴다 */
          @media (max-width: 640px) {
            .tool-btn .lbl { display: none; }
            .tool-btn { padding: 3px 6px; }
          }

        /* 본문 마크다운 */
        .markdown-body { padding: 40px; border-radius: 12px; line-height: 1.75; font-size: 16px; }

        /* 라이트/다크 테마 */
        body.light-mode { background-color: #f8fafc !important; color: #0f172a !important; }
        body.light-mode .markdown-body { background-color: #ffffff !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        body.light-mode .top-toolbar { background-color: rgba(248,250,252,0.88); border-bottom: 1px solid #cbd5e1; }
          body.light-mode .tool-btn { background-color: #ffffff; color: #0f172a; border: 1px solid #94a3b8; }
        body.light-mode .tool-btn:hover { background-color: #f1f5f9; }

        body.dark-mode { background-color: #0b0f19 !important; color: #f8fafc !important; }
        body.dark-mode .markdown-body { background-color: #111827 !important; color: #f9fafb !important; border: 1px solid #374151 !important; box-shadow: 0 4px 16px rgba(0,0,0,0.6); }
        body.dark-mode .top-toolbar { background-color: rgba(11,15,25,0.88); border-bottom: 1px solid #374151; }
          body.dark-mode .tool-btn { background-color: #1f2937; color: #f9fafb; border: 1px solid #4b5563; }
        body.dark-mode .tool-btn:hover { background-color: #374151; }

        /* 소스 코드 블록 개선 */
        /* 우하단 모서리를 끌어 크기를 바꾼다. resize 는 overflow 가 visible 이 아닐 때만
             먹으므로 auto 를 함께 준다. 긴 코드는 세로로 늘려서 본다. */
          .markdown-body pre {
            position: relative; padding: 44px 16px 16px 16px !important;
            border-radius: 8px !important;
            resize: both; overflow: auto; min-width: 240px; min-height: 90px;
          }
          /* 크기를 바꿀 수 있다는 것을 보이게 한다 */
          .markdown-body pre::after, .mermaid-wrap::after {
            content: '⤡'; position: absolute; right: 3px; bottom: 1px;
            font-size: 11px; opacity: 0.45; pointer-events: none;
          }
        .markdown-body pre code { border: none !important; background: transparent !important; padding: 0 !important; font-family: ui-monospace, SFMono-Regular, Consolas, monospace !important; }
        .markdown-body pre code * { border: none !important; }

        /* frontmatter — 접어 두고, 펼쳐도 본문 코드블록처럼 보이지 않게 */
          .front-matter { margin-bottom: 20px; font-size: 12px; opacity: 0.75; }
          .front-matter > summary { cursor: pointer; font-weight: 600; padding: 4px 0; }
          .front-matter > pre {
            padding: 10px 12px !important; margin-top: 6px; font-size: 11px !important;
            white-space: pre-wrap; resize: none !important; min-height: 0 !important;
          }
          .front-matter > pre::after { content: none !important; }

        /* 인라인 코드 */
        .markdown-body :not(pre) > code { padding: 0.2em 0.4em !important; border-radius: 6px !important; font-size: 85% !important; }
        body.light-mode .markdown-body :not(pre) > code { background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; }
        body.dark-mode .markdown-body :not(pre) > code { background-color: #1f2937 !important; border: 1px solid #374151 !important; }

        /* 블록 액션바 (복사/다운로드/이미지) */
        .action-bar { position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; z-index: 10; }
        .action-btn { padding: 4px 8px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        body.light-mode .action-btn { color: #334155; background: #ffffff; border: 1px solid #cbd5e1; }
        body.light-mode .action-btn:hover { background: #e2e8f0; }
        body.dark-mode .action-btn { color: #e2e8f0; background: #1f2937; border: 1px solid #4b5563; }
        body.dark-mode .action-btn:hover { background: #374151; }

        /* Mermaid Wrapper */
        .mermaid-wrap {
            position: relative; display: flex; flex-direction: column; align-items: center;
            padding: 48px 16px 16px 16px; margin: 16px 0;
            border: 1px solid #cbd5e1; border-radius: 8px;
            resize: both; overflow: auto; min-width: 240px; min-height: 160px;
          }
          .mermaid-wrap > .mermaid { width: 100%; }
          /* mermaid 는 svg 에 max-width 를 인라인으로 박아 두어, 그대로 두면
             칸을 넓혀도 도형이 커지지 않는다 */
          .mermaid-wrap svg { width: 100% !important; height: auto !important; max-width: none !important; }
        body.dark-mode .mermaid-wrap { border-color: #374151; }
        body.dark-mode .mermaid { filter: invert(0.92) hue-rotate(180deg) contrast(1.15); }
      `;
      document.head.appendChild(styleEl);

      // 2. 전체 페이지 레이아웃 생성
      document.body.innerHTML = `
        <div class="viewer-container">
          <div class="top-toolbar">
            <div class="btn-group">
              <button id="copyMdBtn" class="tool-btn" title="${t('mdT')}">📝<span class="lbl"> ${t('md')}</span></button>
                <button id="copyHtmlBtn" class="tool-btn" title="${t('htmlT')}">📄<span class="lbl"> ${t('html')}</span></button>
              <button id="copyImgBtn" class="tool-btn" title="${t('imgT')}">📷<span class="lbl"> ${t('img')}</span></button>
                <button id="saveMdBtn" class="tool-btn" title="${t('saveT')}">💾<span class="lbl"> ${t('save')}</span></button>
            </div>
            <div class="btn-group">
              <button id="scrollTopBtn" class="tool-btn" title="${t('top')}">⬆️</button>
              <button id="scrollBottomBtn" class="tool-btn" title="${t('bottom')}">⬇️</button>
              <button id="tmBtn" class="tool-btn"></button>
            </div>
          </div>
          <div id="mdC" class="markdown-body"></div>
        </div>
      `;

      const contentEl = document.getElementById('mdC');
      const themeBtn = document.getElementById('tmBtn');

      function applyTheme(dark) {
        document.body.className = dark ? 'dark-mode' : 'light-mode';
        themeBtn.textContent = dark ? '☀️' : '🌙';
          themeBtn.title = dark ? t('toLight') : t('toDark');
      }
      applyTheme(isDark);

      // 마크다운 변환
      // frontmatter 를 본문에서 떼어낸다.
      // marked 는 여는 --- 를 <hr> 로, 그 아래 YAML 을 그냥 문단으로 렌더한다.
      // handbook 문서는 전부 frontmatter 를 갖고 있어 그대로 두면 첫 화면이
      // 메타데이터 덩어리가 된다. 버리지 않고 접어 둔다 — id·version·updated 는
      // 볼 일이 있고, MD 복사는 어차피 rawText(원본)를 주므로 손실이 없다.
      let frontMatter = '';
      let mdBody = rawText;
      const fmMatch = rawText.match(/^\uFEFF?\s*---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      if (fmMatch) {
        frontMatter = fmMatch[1];
        mdBody = rawText.slice(fmMatch[0].length);
      }

      // marked 가 있으면 그쪽이 낫다. 없으면 내장 렌더러로 «읽을 수는 있게» 그린다.
      contentEl.innerHTML = (typeof marked !== 'undefined' && marked.parse)
        ? marked.parse(mdBody)
        : renderMarkdown(mdBody);
      if (degraded) contentEl.parentNode.insertBefore(degraded, contentEl);

      if (frontMatter) {
        const det = document.createElement('details');
        det.className = 'front-matter';
        const sum = document.createElement('summary');
        const tm = frontMatter.match(/^title:\s*(.+)$/m);
        sum.textContent = tm ? tm[1].trim() : t('docInfo');
        const fmPre = document.createElement('pre');
        fmPre.textContent = frontMatter;
        det.appendChild(sum);
        det.appendChild(fmPre);
        contentEl.insertBefore(det, contentEl.firstChild);
      }

      // 제목 ID(Slug) 자동 생성
      contentEl.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h, idx) => {
        const slug = h.textContent.trim().toLowerCase().replace(/[^\w\s\u3131-\u318e\uac00-\ud7a3-]/g, '').replace(/\s+/g, '-');
        h.id = slug || `h-${idx}`;
      });

      // 3. 코드 블록을 Canvas 이미지로 렌더링하는 헬퍼 함수
      // preEl 을 받는 이유: 사용자가 모서리를 끌어 키운 «지금 크기» 로 저장해야
      // 한다. 글자 길이만 재면 화면에서 아무리 키워도 늘 같은 그림이 나온다.
      // 글꼴 크기·줄높이도 고정값이 아니라 실제 계산값을 읽는다 — 테마나 브라우저
      // 설정으로 달라지면 그림과 화면이 어긋난다.
      function codeToCanvas(preEl, isDarkMode, callback) {
        const codeEl = preEl.querySelector('code') || preEl;
        const lines = codeEl.innerText.split('\n');
        const cs = getComputedStyle(codeEl);
        const fontSize = parseFloat(cs.fontSize) || 14;
        let lineHeight = parseFloat(cs.lineHeight);
        if (!lineHeight) lineHeight = Math.round(fontSize * 1.55);
        const padding = 24;
        const headerHeight = 36;
        const box = preEl.getBoundingClientRect();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontStack = cs.fontFamily || 'Consolas, Monaco, monospace';
        ctx.font = `${fontSize}px ${fontStack}`;

        let maxLineWidth = 0;
        lines.forEach(line => {
          const width = ctx.measureText(line).width;
          if (width > maxLineWidth) maxLineWidth = width;
        });

        // 내용이 필요로 하는 크기와 «지금 보이는» 크기 중 큰 쪽을 쓴다.
        // 키우면 그만큼 커지고, 줄여도 내용이 잘리지 않는다.
        const width = Math.max(maxLineWidth + padding * 2, box.width || 0, 420);
        const height = Math.max(
          lines.length * lineHeight + padding * 2 + headerHeight,
          box.height || 0);

        const scale = 2; // High DPI
        canvas.width = width * scale;
        canvas.height = height * scale;
        ctx.scale(scale, scale);

        // 배경 처리
        ctx.fillStyle = isDarkMode ? '#111827' : '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 상단 헤더 (Mac 스타일 버튼)
        ctx.fillStyle = isDarkMode ? '#1f2937' : '#f1f5f9';
        ctx.fillRect(0, 0, width, headerHeight);
        
        const dots = ['#ff5f56', '#ffbd2e', '#27c93f'];
        dots.forEach((color, i) => {
          ctx.beginPath();
          ctx.arc(16 + i * 18, headerHeight / 2, 5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });

        // 코드 텍스트
        ctx.font = `${fontSize}px ${fontStack}`;
        ctx.fillStyle = isDarkMode ? '#f3f4f6' : '#0f172a';
        lines.forEach((line, index) => {
          ctx.fillText(line, padding, headerHeight + padding + index * lineHeight);
        });

        callback(canvas);
      }

      // 4. Mermaid SVG를 Canvas로 안전 변환하는 헬퍼 함수
      function mermaidToCanvas(wrapEl, isDarkMode, callback) {
        const svgEl = wrapEl.querySelector('svg');
        if (!svgEl) return;

        const bbox = svgEl.getBoundingClientRect();
        const w = bbox.width || 800;
        const h = bbox.height || 600;

        const clone = svgEl.cloneNode(true);
        clone.setAttribute('width', w);
        clone.setAttribute('height', h);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        // mermaid 는 svg 에 max-width 를 인라인으로 박아 둔다. 그대로 두면 위에서
        // 지정한 width 를 그것이 눌러, 끌어서 키운 크기가 그림에 반영되지 않는다.
        clone.style.maxWidth = 'none';
        clone.style.width = w + 'px';
        clone.style.height = h + 'px';

        // 투명 배경 방지용 Rect 삽입
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', isDarkMode ? '#111827' : '#ffffff');
        clone.insertBefore(rect, clone.firstChild);

        const svgData = new XMLSerializer().serializeToString(clone);
        const svg64 = btoa(unescape(encodeURIComponent(svgData)));
        const image64 = 'data:image/svg+xml;base64,' + svg64;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2;
          canvas.width = w * scale;
          canvas.height = h * scale;
          const ctx = canvas.getContext('2d');
          ctx.scale(scale, scale);

          if (isDarkMode) {
            ctx.filter = 'invert(0.92) hue-rotate(180deg) contrast(1.15)';
          }
          ctx.drawImage(img, 0, 0, w, h);
          callback(canvas);
        };
        img.src = image64;
      }

      // 끌어서 크기를 바꾸면 인라인 width/height 가 남아 원래대로 돌아갈 방법이
      // 없어진다. 그 인라인 값만 지워 CSS 기본값으로 되돌린다.
      function makeResetBtn(el) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = '↔️ ' + t('reset');
        btn.title = t('resetT');
        btn.onclick = () => { el.style.width = ''; el.style.height = ''; };
        return btn;
      }

      // 5. 소스 코드 블록 액션바 (복사 / 다운로드 / 이미지 저장)
      contentEl.querySelectorAll('pre').forEach((pre) => {
        const codeEl = pre.querySelector('code');
        if (!codeEl || codeEl.classList.contains('language-mermaid')) return;

        const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'txt';

        const actionBar = document.createElement('div');
        actionBar.className = 'action-bar';

        // 📋 복사
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn';
        copyBtn.textContent = '📋 ' + t('copy');
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(codeEl.innerText).then(() => {
            copyBtn.textContent = '✅ ' + t('done');
            setTimeout(() => copyBtn.textContent = '📋 ' + t('copy'), 1500);
          });
        };

        // 💾 다운로드
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn';
        downloadBtn.textContent = '💾 ' + t('down');
        downloadBtn.onclick = () => {
          const extMap = { javascript: 'js', python: 'py', typescript: 'ts', markdown: 'md', html: 'html', css: 'css', json: 'json', cpp: 'cpp', java: 'java' };
          const ext = extMap[lang] || lang || 'txt';
          const blob = new Blob([codeEl.innerText], { type: 'text/plain;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `code-snippet.${ext}`;
          a.click();
          URL.revokeObjectURL(a.href);
        };

        // 🖼️ 이미지 저장
        const imgBtn = document.createElement('button');
        imgBtn.className = 'action-btn';
        imgBtn.textContent = '🖼️ ' + t('saveImg');
        imgBtn.onclick = () => {
          codeToCanvas(pre, document.body.classList.contains('dark-mode'), (canvas) => {
            const a = document.createElement('a');
            a.download = 'code-snippet.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
          });
        };

        actionBar.appendChild(copyBtn);
        actionBar.appendChild(downloadBtn);
        actionBar.appendChild(imgBtn);
        actionBar.appendChild(makeResetBtn(pre));
        pre.appendChild(actionBar);
      });

      // 6. Mermaid 다이어그램 변환 및 액션바 (코드복사 / 다운로드 / 이미지저장)
      const mermaidBlocks = contentEl.querySelectorAll('pre code.language-mermaid');
      mermaidBlocks.forEach((block) => {
        const rawMermaidCode = block.textContent;
        const wrap = document.createElement('div');
        wrap.className = 'mermaid-wrap';

        const actionBar = document.createElement('div');
        actionBar.className = 'action-bar';

        // 📋 코드 복사
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn';
        copyBtn.textContent = '📋 ' + t('copyCode');
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(rawMermaidCode).then(() => {
            copyBtn.textContent = '✅ ' + t('done');
            setTimeout(() => copyBtn.textContent = '📋 ' + t('copyCode'), 1500);
          });
        };

        // 💾 소스 다운로드
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn';
        downloadBtn.textContent = '💾 ' + t('downSrc');
        downloadBtn.onclick = () => {
          const blob = new Blob([rawMermaidCode], { type: 'text/plain;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'diagram.mmd';
          a.click();
          URL.revokeObjectURL(a.href);
        };

        // 🖼️ 이미지 저장 (보정 완료)
        const imgBtn = document.createElement('button');
        imgBtn.className = 'action-btn';
        imgBtn.textContent = '🖼️ ' + t('saveImg');
        imgBtn.onclick = () => {
          mermaidToCanvas(wrap, document.body.classList.contains('dark-mode'), (canvas) => {
            const a = document.createElement('a');
            a.download = 'mermaid-diagram.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
          });
        };

        actionBar.appendChild(copyBtn);
        actionBar.appendChild(downloadBtn);
        actionBar.appendChild(imgBtn);
        actionBar.appendChild(makeResetBtn(wrap));
        wrap.appendChild(actionBar);

        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = rawMermaidCode;
        wrap.appendChild(div);

        block.parentElement.replaceWith(wrap);
      });

      if (mermaidBlocks.length > 0 && typeof mermaid !== 'undefined') {
        try {
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
          mermaid.run({ querySelector: '.mermaid' });
        } catch (e) {
          console.error(e);
        }
      }

      // 7. 상단 툴바 기능 리스너

      // 복사물에는 조작 버튼이 들어가면 안 된다. HTML 복사와 이미지 복사는
      // contentEl 을 통째로 뜨는데, 거기에 블록마다 붙인 액션바(복사·다운로드·
      // 이미지 저장·크기 초기화)가 그대로 딸려 간다.
      //
      // 감추는 것으로는 부족하다 — display:none 은 화면과 innerText 에서는 빼주지만
      // innerHTML 에는 마크업이 그대로 남는다(실측: 액션바 50개·버튼 200개가 복사본에
      // 들어갔다). 붙여넣는 쪽이 스타일을 벗기면 버튼이 되살아난다. 그래서 잠깐
      // «떼어냈다가» 제자리에 돌려놓는다.
      //
      // 떼고 붙이는 것은 동기라 화면이 깜빡이지 않고, 사이에 예외가 나도 finally 가
      // 되돌린다. 위치는 부모의 마지막이 아닐 수 있어(머메이드는 액션바 뒤에 도형이
      // 온다) nextSibling 을 기억한다.
      function readWithoutChrome(fn) {
        const spots = [];
        contentEl.querySelectorAll('.action-bar').forEach((el) => {
          spots.push({ el: el, parent: el.parentNode, next: el.nextSibling });
          el.remove();
        });
        try {
          return fn();
        } finally {
          spots.forEach((s) => { s.parent.insertBefore(s.el, s.next); });
        }
      }

      // 라벨을 잠깐 바꿨다 되돌린다. textContent 가 아니라 innerHTML 을 쓰는 이유는
      // 라벨 안에 <span class="lbl"> 이 들어 있어서다 — textContent 로 갈아끼우면
      // 그 span 이 사라져 좁은 화면에서 글자를 숨기는 규칙이 죽는다.
      function flash(btn, msg) {
        const keep = btn.innerHTML;
        btn.innerHTML = msg;
        setTimeout(() => { btn.innerHTML = keep; }, 1500);
      }

      // 📝 MD 복사 — 렌더 결과가 아니라 «원본» 을 준다.
      // rawText 는 document.body.innerHTML 을 갈아엎기 전에 잡아둔 값이다.
      // 이 시점 이후로는 원본을 어디서도 다시 구할 수 없다.
      document.getElementById('copyMdBtn').onclick = (e) => {
        const btn = e.currentTarget;
        navigator.clipboard.writeText(rawText).then(
          () => flash(btn, '✅'),
          () => flash(btn, '❌'));
      };

      // 💾 .md 저장 — 파일명은 첫 h1 에서 딴다
      document.getElementById('saveMdBtn').onclick = (e) => {
        const btn = e.currentTarget;
        const h1 = contentEl.querySelector('h1');
        const base = h1 ? h1.textContent.trim() : (document.title || 'document');
        const name = base.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80) || 'document';
        const blob = new Blob([rawText], { type: 'text/markdown;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + '.md';
        a.click();
        URL.revokeObjectURL(a.href);
        flash(btn, '✅');
      };

      // 📄 HTML 복사
      document.getElementById('copyHtmlBtn').onclick = () => {
        const snap = readWithoutChrome(() => ({
          html: contentEl.innerHTML,
          text: contentEl.innerText,
        }));
        const html = snap.html;
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([snap.text], { type: 'text/plain' });
        
        if (navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([
            new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })
          ]).then(() => {
            flash(document.getElementById('copyHtmlBtn'), '✅');
          });
        } else {
          navigator.clipboard.writeText(html);
        }
      };

      // 📷 이미지 복사
      document.getElementById('copyImgBtn').onclick = () => {
        const btn = document.getElementById('copyImgBtn');
        const keepImg = btn.innerHTML;
        btn.innerHTML = '⏳';

        const bbox = contentEl.getBoundingClientRect();
        const w = bbox.width;
        const h = bbox.height;

        const isDarkNow = document.body.classList.contains('dark-mode');
        // 버튼을 뺀 채로 본문을 뜬다 — 그림에 복사·다운로드 버튼이 찍히면 안 된다
        const bodyHtml = readWithoutChrome(() => contentEl.innerHTML);
        const svgContainer = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
          <style>
            .markdown-body { padding: 40px; font-family: sans-serif; line-height: 1.75; }
            ${isDarkNow ? 'body, div { background: #111827; color: #f9fafb; }' : 'body, div { background: #ffffff; color: #0f172a; }'}
          </style>
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" class="markdown-body">
              ${bodyHtml}
            </div>
          </foreignObject>
        </svg>`;

        const svg64 = btoa(unescape(encodeURIComponent(svgContainer)));
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = w * 1.5;
          canvas.height = h * 1.5;
          const ctx = canvas.getContext('2d');
          ctx.scale(1.5, 1.5);
          ctx.fillStyle = isDarkNow ? '#111827' : '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (navigator.clipboard && window.ClipboardItem) {
              navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
                btn.innerHTML = '✅';
                setTimeout(() => { btn.innerHTML = keepImg; }, 1500);
              });
            }
          });
        };
        img.src = 'data:image/svg+xml;base64,' + svg64;
      };

      // ⬆️ 맨 위로 / ⬇️ 맨 아래로
      document.getElementById('scrollTopBtn').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById('scrollBottomBtn').onclick = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

      // 앵커 스크롤
      if (location.hash) {
        const targetEl = document.getElementById(decodeURIComponent(location.hash.substring(1)));
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      }

      themeBtn.onclick = () => {
        isDark = !isDark;
        applyTheme(isDark);
      };
    })();
  })();
})();
