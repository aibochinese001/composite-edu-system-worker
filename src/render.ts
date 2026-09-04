// Server-side HTML rendering for SEO + AI-crawlable pages
import { buildHomeRotate, HomeCard } from './home-rotate';

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SITE_URL = 'https://your-worker.workers.dev';

type SocialLinks = { bilibili: string; douyin: string; xiaohongshu: string; facebook: string; x: string; youtube: string; instagram: string };
type CsConfig = { chat_url: string; wechat_qr: string; whatsapp: string; telegram: string };
type NoticeItem = { type: string; id: number; title: string; href: string };
type NavMenuItem = { id: string; label: string; url: string; target?: string; children?: NavMenuItem[] };
type FriendLink = { name: string; url: string };

const SOCIAL_IMAGES: Record<string, string> = {
  bilibili: 'https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/bilibili.png',
  douyin: 'https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/douyin.png',
  xiaohongshu: 'https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/rednote.png',
  facebook: 'https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/icons8-facebook-96.png',
  x: 'https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/x-logo-30.jpeg',
  youtube: 'https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/youtube%20logo%2030.png',
  instagram: 'https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/icons8-instagram-48.png',
};

function socialLinksHtml(social: SocialLinks | undefined): string {
  if (!social) return '';
  const items: [string, string, string][] = [
    ['bilibili', social.bilibili, 'Bilibili'],
    ['douyin', social.douyin, 'Douyin'],
    ['xiaohongshu', social.xiaohongshu, 'Xiaohongshu'],
    ['facebook', social.facebook, 'Facebook'],
    ['x', social.x, 'X'],
    ['youtube', social.youtube, 'YouTube'],
    ['instagram', social.instagram, 'Instagram'],
  ];
  const links = items
    .filter(([, url]) => url)
    .map(([key, url, label]) => `<a class="social-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer" title="${esc(label)}" aria-label="${esc(label)}"><img src="${esc(SOCIAL_IMAGES[key])}" alt="${esc(label)}" loading="lazy"></a>`)
    .join('');
  return links ? `<div class="footer-social"><span class="footer-social-label">Follow us</span><div class="footer-social-icons">${links}</div></div>` : '';
}

function friendLinksHtml(links: FriendLink[] | undefined): string {
  if (!links || !links.length) return '';
  return links
    .filter((l) => l && l.name && l.url)
    .map((l) => `<a class="footer-friend-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.name)}</a>`)
    .join('');
}

function noticeTickerHtml(items: NoticeItem[] | undefined): string {
  if (!items || items.length === 0) return '';
  const item = (it: NoticeItem) => `<a class="notice-item" href="${esc(it.href)}" target="_blank" rel="noopener noreferrer">${esc(it.title)}</a>`;
  const first = items[0];
  return `<div class="notice-ticker">
  <div class="notice-ticker-inner">
    <span class="notice-speaker" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"></polygon>
        <path class="wave wave1" d="M15.5 8.5a5 5 0 0 1 0 7"></path>
        <path class="wave wave2" d="M18.5 5.5a9 9 0 0 1 0 13"></path>
      </svg>
    </span>
    <div class="notice-viewport">
      <div class="notice-list" id="noticeList">${items.map(item).join('')}${item(first)}</div>
    </div>
  </div>
</div>
<script>
(function () {
  var list = document.getElementById('noticeList');
  if (!list) return;
  var ticker = list.closest('.notice-ticker');
  var total = list.children.length;
  if (total < 2) return;
  var lineH = 40, idx = 0, timer = null;
  function tick() {
    idx++;
    list.classList.remove('no-transition');
    list.style.transform = 'translateY(-' + (idx * lineH) + 'px)';
    if (idx === total - 1) {
      setTimeout(function () {
        list.classList.add('no-transition');
        list.style.transform = 'translateY(0)';
        idx = 0;
      }, 620);
    }
  }
  function start() { if (!timer) timer = setInterval(tick, 5000); }
  function stop() { clearInterval(timer); timer = null; }
  ticker.addEventListener('mouseenter', stop);
  ticker.addEventListener('mouseleave', start);
  start();
})();
</script>`;
}

function csHtml(cs: CsConfig | undefined): string {
  if (!cs) return '';
  const hasCs = !!(cs.chat_url || cs.wechat_qr || cs.whatsapp || cs.telegram);
  if (!hasCs) return '';
  const chatItem = cs.chat_url ? `<button class="cs-item" data-cs-action="chat">💬 Live chat</button>` : '';
  const iconItems = [
    cs.wechat_qr ? `<button class="cs-icon" data-cs-action="wechat" title="WeChat" aria-label="WeChat"><img src="https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/wechaticon.png" alt="WeChat"></button>` : '',
    cs.whatsapp ? `<a class="cs-icon" href="${esc(cs.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp"><img src="https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/whatsapp-48.png" alt="WhatsApp"></a>` : '',
    cs.telegram ? `<a class="cs-icon" href="${esc(cs.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram"><img src="https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/social-media-ico/icons8-telegram-48.png" alt="Telegram"></a>` : '',
  ].filter(Boolean);
  const iconRow = iconItems.length ? `<div class="cs-icons">${iconItems.join('')}</div>` : '';
  const items = `${chatItem}${iconRow}`;
  return `<button class="cs-fab" id="csFab" aria-label="Live chat"><img src="https://your-cdn.example.com/%E7%B4%A0%E6%9D%90%E7%AB%99/202608/chat-icon.png" alt="Live chat"></button>
<div class="cs-panel" id="csPanel" hidden>
  <button class="cs-close" id="csClose" aria-label="Close">×</button>
  <div class="cs-panel-body" id="csBody">${items}</div>
  <div class="cs-chatbox" id="csChatbox" hidden><iframe id="csFrame" title="Live chat" src="" loading="lazy"></iframe></div>
  <div class="cs-qrbox" id="csQrbox" hidden><img id="csQrImg" alt="WeChat QR" src=""><p>Scan to add WeChat</p></div>
</div>
<script>
(function(){
  var fab=document.getElementById('csFab'); if(!fab) return;
  var panel=document.getElementById('csPanel');
  fab.addEventListener('click', function(){ panel.hidden = !panel.hidden; });
  var close=document.getElementById('csClose');
  close.addEventListener('click', function(){ panel.hidden = true; });
  var chatbox=document.getElementById('csChatbox'), qrbox=document.getElementById('csQrbox');
  var frame=document.getElementById('csFrame'), qr=document.getElementById('csQrImg');
  document.querySelectorAll('[data-cs-action]').forEach(function(el){
    el.addEventListener('click', function(){
      var action=el.getAttribute('data-cs-action');
      chatbox.hidden=true; qrbox.hidden=true;
      if(action==='chat'){ frame.src=${JSON.stringify(cs.chat_url || '')}; chatbox.hidden=false; }
      else if(action==='wechat'){ qr.src=${JSON.stringify(cs.wechat_qr || '')}; qrbox.hidden=false; }
    });
  });
})();
</script>`;
}

function searchHtml(): string {
  return `<button class="search-fab" id="searchFab" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
<div class="search-panel" id="searchPanel" hidden>
  <button class="search-close" id="searchClose" aria-label="Close">×</button>
  <div class="search-box">
    <input id="searchInput" type="text" placeholder="Search articles / products / courses / pay options" autocomplete="off">
    <button id="searchBtn" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>
  </div>
  <div class="search-tabs">
    <button class="search-tab active" data-tab="all">All</button>
    <button class="search-tab" data-tab="article">Articles</button>
    <button class="search-tab" data-tab="product">Products</button>
    <button class="search-tab" data-tab="course">Courses</button>
    <button class="search-tab" data-tab="library">Library</button>
    <button class="search-tab" data-tab="payoption">Pay Options</button>
  </div>
  <div class="search-results" id="searchResults"></div>
</div>
<script>
(function(){
  var fab=document.getElementById('searchFab'); if(!fab) return;
  var panel=document.getElementById('searchPanel');
  var input=document.getElementById('searchInput');
  var results=document.getElementById('searchResults');
  var currentTab='all', allResults=[];
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  fab.addEventListener('click', function(){ panel.hidden=!panel.hidden; if(!panel.hidden) input.focus(); });
  document.getElementById('searchClose').addEventListener('click', function(){ panel.hidden=true; });
  function doSearch(){
    var q=input.value.trim(); if(!q) return;
    fetch('/api/search?q='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(d){ allResults=d.results||[]; render(); });
  }
  function render(){
    var list=allResults.filter(function(r){ return currentTab==='all' || r.type===currentTab; });
    if(!list.length){ results.innerHTML='<p class="search-empty">No results</p>'; return; }
    results.innerHTML=list.map(function(r){
      return '<a class="search-item" href="'+r.url+'" target="_blank" rel="noopener noreferrer"><span class="search-type search-type-'+r.type+'">'+esc(r.label)+'</span>'+esc(r.title)+'</a>';
    }).join('');
  }
  input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); doSearch(); } });
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.querySelectorAll('.search-tab').forEach(function(t){
    t.addEventListener('click', function(){
      document.querySelectorAll('.search-tab').forEach(function(x){ x.classList.remove('active'); });
      t.classList.add('active'); currentTab=t.getAttribute('data-tab'); render();
    });
  });
})();
</script>`;
}

function aiChatHtml(): string {
  return `<button class="ai-fab" id="aiFab" aria-label="AI Assistant">🤖</button>
<div class="ai-panel" id="aiPanel" hidden>
  <button class="ai-close" id="aiClose" aria-label="Close">×</button>
  <div class="ai-head">AI Assistant</div>
  <div class="ai-body" id="aiBody">
    <div class="ai-msg ai">Hello, I'm the AI assistant. How can I help you??</div>
  </div>
  <div class="ai-input">
    <input id="aiInput" type="text" placeholder="Type a question and press Enter" autocomplete="off">
    <button id="aiSend" aria-label="Send">Send</button>
  </div>
</div>
<script>
(function(){
  var fab=document.getElementById('aiFab'); if(!fab) return;
  var panel=document.getElementById('aiPanel');
  var body=document.getElementById('aiBody');
  var input=document.getElementById('aiInput');
  var send=document.getElementById('aiSend');
  fab.addEventListener('click', function(){ panel.hidden=!panel.hidden; if(!panel.hidden) input.focus(); });
  document.getElementById('aiClose').addEventListener('click', function(){ panel.hidden=true; });
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function autoLink(t){ t=esc(t); var links=[]; t=t.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^)\\s]+)\\)/g, function(m,txt,url){ links.push('<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+txt+'</a>'); return 'ZZLINK'+(links.length-1)+'ZZ'; }); t=t.replace(/(https?:\\/\\/[^\\s<>\\[\\]()"']+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'); t=t.replace(/ZZLINK(\\d+)ZZ/g, function(m,i){ return links[parseInt(i,10)]; }); return t.replace(/\\n/g,'<br>'); }
  function addMsg(role, html){ var d=document.createElement('div'); d.className='ai-msg '+role; d.innerHTML=html; body.appendChild(d); body.scrollTop=body.scrollHeight; }
  function ask(){
    var q=input.value.trim(); if(!q) return;
    addMsg('user', esc(q)); input.value='';
    var thinking=document.createElement('div'); thinking.className='ai-msg ai'; thinking.textContent='Thinking...'; body.appendChild(thinking); body.scrollTop=body.scrollHeight;
    fetch('/api/chat', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({question:q}) })
      .then(function(r){return r.json();})
      .then(function(d){ thinking.remove(); if(d.error){ addMsg('ai', esc(d.error)); } else { addMsg('ai', autoLink(d.reply)); } })
      .catch(function(){ thinking.remove(); addMsg('ai', 'Network error, please try again'); });
  }
  send.addEventListener('click', ask);
  input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); ask(); } });
})();
</script>`;
}

export function layout(opts: {
  title: string;
  description?: string;
  content: string;
  siteName: string;
  tagline: string;
  slogan: string;
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
  favicon?: string;
  logo?: string;
  showHero?: boolean;
  noticeItems?: NoticeItem[];
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
}): string {
  const u = opts.user;
  const authBar = u
    ? `<div class="nav-user"><a href="/account">Account</a>${u.role === 'admin' ? ' · <a href="/admin/">Admin</a>' : ''} · <a href="/api/logout">Logout</a></div>`
    : `<div class="nav-user"><a href="/login">Log in</a> <a href="/register" class="btn-ghost">Sign up</a></div>`;
  const vipBadge = `<a href="/vip" class="vip-badge${u && u.isVip ? ' vip-active' : ''}" title="VIP" aria-label="VIP"><span class="vip-crown">👑</span><span class="vip-text">VIP</span></a>`;
  const navMenuHtml = (opts.navMenu || [])
    .map((m) => {
      const t = m.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
      if (m.children && m.children.length) {
        return `<div class="nav-item">
        <a href="${esc(m.url || '#')}"${t}>${esc(m.label)} <span class="nav-caret">▾</span></a>
        <div class="nav-dropdown">${m.children.map((ch) => `<a href="${esc(ch.url || '#')}"${ch.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(ch.label)}</a>`).join('')}</div>
      </div>`;
      }
      return `<a href="${esc(m.url || '#')}"${t}>${esc(m.label)}</a>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(opts.title)} · ${esc(opts.siteName)}</title>
<meta name="description" content="${esc(opts.description || opts.tagline)}">
<meta name="mcp-server" content="${SITE_URL}/mcp/">
<link rel="mcp-discovery" href="${SITE_URL}/.well-known/mcp/">
<link rel="stylesheet" href="/css/style.css">
${opts.favicon ? `<link rel="icon" href="${esc(opts.favicon)}">` : ''}
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#4ECDC4">
<link rel="apple-touch-icon" href="/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="logo">${opts.logo ? `<img src="${esc(opts.logo)}" alt="${esc(opts.siteName)}" class="logo-img">` : esc(opts.siteName)}</a>
    <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">☰</button>
    <nav class="main-nav" id="mainNav">
      <a href="/courses">Courses</a>
      <a href="/articles">Articles</a>
      <a href="/shop">1-on-1 Live</a>
      <a href="/library">Library</a>
      <a href="/pay-options">Pay Options</a>
      <a href="/about">About us</a>
      <a href="/helper">Help center</a>
      ${navMenuHtml}
    </nav>
    <a href="/cart" class="cart-icon" title="Cart" aria-label="Cart">🛒<span class="cart-count" id="cartCount" style="display:none;">0</span></a>
    ${vipBadge}
    ${authBar}
  </div>
</header>
${opts.showHero ? `<div class="hero">
  <div class="container hero-inner">
    ${noticeTickerHtml(opts.noticeItems)}
    <h1 class="hero-title">${esc(opts.tagline)}</h1>
    <p class="hero-slogan">${esc(opts.slogan)}</p>
    <div class="hero-divider"></div>
  </div>
</div>` : ''}
<main class="container main-content">${opts.content}</main>
<footer class="site-footer">
  <div class="container">
    ${socialLinksHtml(opts.social)}
    <p class="footer-brand">${esc(opts.siteName)} · ${esc(opts.tagline)}${friendLinksHtml(opts.friendLinks)}</p>
  </div>
</footer>
${aiChatHtml()}
${searchHtml()}
${csHtml(opts.cs)}
<script>
(function(){
  var t=document.getElementById('navToggle');
  if(!t) return;
  t.addEventListener('click', function(){
    var nav=document.getElementById('mainNav');
    var nu=document.querySelector('.nav-user');
    var open=nav.classList.toggle('open');
    if(nu) nu.classList.toggle('open', open);
    t.setAttribute('aria-expanded', open?'true':'false');
  });
})();
async function loadCartCount() {
  try {
    var r = await fetch('/api/cart/count');
    var d = await r.json();
    var el = document.getElementById('cartCount');
    if (el) {
      if (d.count > 0) { el.textContent = d.count > 99 ? '99+' : d.count; el.style.display = ''; }
      else el.style.display = 'none';
    }
  } catch (e) {}
}
loadCartCount();
function toggleCatTabs(btn) {
  var box = btn.parentElement;
  var expanded = box.classList.toggle('expanded');
  btn.textContent = expanded ? '‹' : '›';
  btn.setAttribute('aria-label', expanded ? 'Collapse' : 'More categories');
  btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}
function initCatTabs() {
  var boxes = document.querySelectorAll('.category-tabs-box');
  for (var i = 0; i < boxes.length; i++) {
    var box = boxes[i];
    var tabs = box.querySelector('.category-tabs');
    var btn = box.querySelector('.cat-toggle');
    if (!tabs || !btn) continue;
    if (tabs.scrollHeight > tabs.clientHeight + 2) {
      box.classList.add('has-more');
      btn.style.display = '';
    }
  }
}
initCatTabs();
function initAudioPlayers() {
  var players = document.querySelectorAll('.audio-player');
  for (var i = 0; i < players.length; i++) (function (ap) {
    if (ap.getAttribute('data-ap-init')) return;
    ap.setAttribute('data-ap-init', '1');
    ap.classList.add('ap-collapsed');
    var src = ap.getAttribute('data-src');
    if (!src) return;
    var audio = document.createElement('audio');
    audio.src = src;
    audio.preload = 'metadata';
    ap.appendChild(audio);
    var btn = ap.querySelector('.ap-play');
    var bar = ap.querySelector('.ap-bar-fill');
    var time = ap.querySelector('.ap-time');
    function fmt(t) {
      if (!isFinite(t) || t < 0) t = 0;
      var m = Math.floor(t / 60), s = Math.floor(t % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }
    function doPlay() {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    }
    btn.addEventListener('click', function () {
      if (audio.paused) {
        doPlay();
        ap.classList.remove('ap-collapsed');
        ap.classList.add('ap-playing');
        btn.setAttribute('aria-label', 'Pause');
        btn.setAttribute('title', 'Pause');
      } else {
        audio.pause();
        ap.classList.remove('ap-playing');
        btn.setAttribute('aria-label', 'Play');
        btn.setAttribute('title', 'Click to play');
      }
    });
    audio.addEventListener('timeupdate', function () {
      if (bar) bar.style.width = (audio.duration ? (audio.currentTime / audio.duration * 100) : 0) + '%';
      if (time) time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
    });
    audio.addEventListener('loadedmetadata', function () {
      if (time) time.textContent = '0:00 / ' + fmt(audio.duration);
    });
    audio.addEventListener('ended', function () {
      ap.classList.remove('ap-playing');
      if (bar) bar.style.width = '0%';
      if (time) time.textContent = '0:00 / ' + fmt(audio.duration);
      btn.setAttribute('aria-label', 'Play');
      btn.setAttribute('title', 'Click to play');
    });
  })(players[i]);
}
initAudioPlayers();
</script>

<script>if('serviceWorker' in navigator){ window.addEventListener('load', ()=>{ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }); }</script>
</body>
</html>`;
}

export function renderHome(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  featuredProducts: { id: number; name: string; cover: string; price: number; sale_price: number; type: string; is_featured: number }[];
  latestArticles: { id: number; title: string; excerpt: string; access_type: string; category_name: string | null; published_at: string | null; cover_image: string }[];
  courses: { id: number; title: string; cover_image: string; price: number; access_type: string; is_top: number }[];
  noticeItems: NoticeItem[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const productCards: HomeCard[] = opts.featuredProducts
    .map((p) => ({
      pinned: p.is_featured === 1,
      html: (() => {
        const cover = p.cover ? `<img src="${esc(p.cover)}" alt="${esc(p.name)}" class="grid-cover" loading="lazy">` : `<div class="grid-cover grid-cover-ph">🛍</div>`;
        const price = p.sale_price > 0 ? p.sale_price : p.price;
        const typeTag = `<span class="grid-type-tag ${p.type === 'virtual' ? 'vt-virtual' : 'vt-physical'}">${p.type === 'virtual' ? 'Virtual' : 'Physical'}</span>`;
        return `<a class="grid-card" href="/product/${p.id}">${cover}<div class="grid-body"><h3>${esc(p.name)}</h3><div class="grid-meta">${typeTag}</div><div class="grid-price">$${price.toFixed(2)}</div></div></a>`;
      })(),
    }));

  const articleCards: HomeCard[] = opts.latestArticles
    .map((a) => ({
      pinned: false,
      html: (() => {
        const lock = a.access_type !== 'public' ? ' 🔒' : '';
        const cover = a.cover_image ? `<img src="${esc(a.cover_image)}" alt="${esc(a.title)}" class="grid-cover" loading="lazy">` : `<div class="grid-cover grid-cover-ph">📄</div>`;
        return `<a class="grid-card" href="/article/${a.id}">
        ${cover}
        <div class="grid-body">
          <h3>${esc(a.title)}${lock}</h3>
          <div class="grid-meta">${esc(a.category_name || '')} · ${esc(formatDate(a.published_at))}</div>
          <p class="grid-excerpt">${esc(a.excerpt || '')}</p>
        </div>
      </a>`;
      })(),
    }));

  const courseCards: HomeCard[] = opts.courses
    .map((crs) => ({
      pinned: crs.is_top === 1,
      html: (() => {
        const lock = crs.access_type !== 'public' ? ' 🔒' : '';
        const cover = crs.cover_image ? `<img src="${esc(crs.cover_image)}" alt="${esc(crs.title)}" class="grid-cover" loading="lazy">` : `<div class="grid-cover grid-cover-ph">🎓</div>`;
        const price = crs.price > 0 ? `$${crs.price.toFixed(2)}` : 'Free';
        return `<a class="grid-card" href="/course/${crs.id}">
        ${cover}
        <div class="grid-body">
          <h3>${esc(crs.title)}${lock}</h3>
          <div class="grid-meta">Course</div>
          <div class="grid-price">${price}</div>
        </div>
      </a>`;
      })(),
    }));

  const homeRotate = buildHomeRotate(articleCards, productCards, courseCards);
  const shown = (cards: HomeCard[]) => cards.slice(0, 4).map((c) => c.html).join('');

  const section = (title: string, moreHref: string, key: string, cards: HomeCard[], empty: string) => `
    <section class="home-section" data-rotate="${key}">
      <div class="section-head"><h2>${title}</h2><a class="section-more" href="${moreHref}">View more →</a></div>
      <div class="grid grid-4">${shown(cards) || `<p class="empty">${empty}</p>`}</div>
    </section>`;

  const content = `
    ${section('Latest articles', '/articles', 'articles', articleCards, 'No articles')}
    ${section('Courses', '/courses', 'courses', courseCards, 'No courses')}
    ${section('1-on-1 Live Lesson', '/shop', 'products', productCards, 'No products')}
    ${homeRotate}`;

  return layout({
    title: opts.siteName,
    description: `${opts.tagline} — ${opts.slogan}`,
    content,
    siteName: opts.siteName,
    tagline: opts.tagline,
    slogan: opts.slogan,
    logo: opts.logo,
    favicon: opts.favicon,
    social: opts.social,
    friendLinks: opts.friendLinks,
    cs: opts.cs,
    user: opts.user,
    navMenu: opts.navMenu,
    showHero: true,
    noticeItems: opts.noticeItems,
  });
}

function adCarouselHtml(adsJson: string): string {
  return `<div class="ad-box" id="adBox">
    <span class="ad-badge">ads</span>
    <a class="ad-item" id="adItem" href="#" target="_blank" rel="noopener noreferrer sponsored">
      <img class="ad-img" id="adImg" alt="" style="display:none;">
      <span class="ad-text" id="adText"></span>
    </a>
  </div>
  <script>
  (function(){
    var ads = ${adsJson};
    if (!ads.length) return;
    var idx = Math.floor(Math.random() * ads.length);
    var link = document.getElementById('adItem');
    var img = document.getElementById('adImg');
    var text = document.getElementById('adText');
    function render(i) {
      var ad = ads[i];
      link.href = ad.url || '#';
      if (ad.image) { img.src = ad.image; img.style.display = ''; } else { img.style.display = 'none'; }
      text.textContent = ad.title || '';
    }
    render(idx);
    setInterval(function () {
      if (ads.length <= 1) return;
      var next;
      do { next = Math.floor(Math.random() * ads.length); } while (next === idx);
      idx = next;
      render(idx);
    }, 15000);
  })();
  </script>`;
}

function articleSidebarHtml(links: Record<string, any[]> | undefined, ads: any[] | undefined): string {
  const hasLinks = !!(links && ((links.article || []).length || (links.course || []).length || (links.product || []).length));
  const hasAds = !!(ads && ads.length);
  if (!hasLinks && !hasAds) return '';
  const sideItem = (it: any, phEmoji: string) => {
    const cover = it.cover
      ? `<img class="side-cover" src="${esc(it.cover)}" alt="${esc(it.title)}" loading="lazy">`
      : `<span class="side-cover side-cover-ph">${phEmoji}</span>`;
    return `<a class="side-item" href="${esc(it.url)}"><span class="side-cover-wrap">${cover}</span><span class="side-item-title">${esc(it.title)}</span></a>`;
  };
  const block = (title: string, items: any[] | undefined, phEmoji: string) =>
    items && items.length
      ? `<div class="side-block"><div class="side-title">${title}</div><div class="side-list">${items.map((it) => sideItem(it, phEmoji)).join('')}</div></div>`
      : '';
  let html = '';
  if (links) {
    html += block('Related articles', links.article, '📄');
    html += block('Related courses', links.course, '🎓');
    html += block('Popular products', links.product, '🛍');
  }
  if (hasAds) {
    const adsJson = JSON.stringify((ads || []).map((ad) => ({ title: ad.title, image: ad.image, url: ad.url })));
    html += `<div class="side-block"><div class="side-title">Popular</div>${adCarouselHtml(adsJson)}</div>`;
  }
  return html;
}

export function renderArticle(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  article: {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    access_type: string;
    category_name: string | null;
    published_at: string | null;
    view_count: number;
    type: string;
    price: number;
  };
  canRead: boolean;
  payMethods?: string[];
  links?: Record<string, any[]>;
  ads?: any[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const a = opts.article;
  const url = `${SITE_URL}/article/${a.id}`;

  let body: string;
  if (a.access_type === 'public' || opts.canRead) {
    body = `<div class="article-body">${a.content}</div>`;
  } else {
    const buyBtn =
      a.price > 0
        ? opts.user
          ? `<button class="btn-primary" onclick="openBuyModal(this, 'article', ${a.id}, ${a.price}, false)" data-title="${esc(a.title)}">Buy separately $${a.price.toFixed(2)}</button>`
          : `<a class="btn-primary" href="/login">Log in to buy $${a.price.toFixed(2)}</a>`
        : '';
    body = `<div class="paywall">
      <div class="paywall-box">
        <div class="paywall-icon">🔒</div>
        <h2>This article is paid content</h2>
        <p>${esc(a.excerpt || '')}</p>
        <div class="paywall-actions">
          <a class="btn-primary" href="/vip">👑 Subscribe to unlock all articles and courses</a>
          ${buyBtn}
        </div>
        ${opts.user ? '<p class="paywall-hint">Already a member? Check your status or buy this article separately</p>' : '<p class="paywall-hint">Please log in to buy</p>'}
      </div>
    </div>`;
  }

  const sidebar = articleSidebarHtml(opts.links, opts.ads);

  const content = `
    <div class="article-layout">
      <div class="article-main">
        <article class="article-full">
          <h1>${esc(a.title)}</h1>
          <div class="article-meta">
            ${esc(a.category_name || 'Uncategorized')} · ${esc(formatDate(a.published_at))} · ${a.view_count} read
            ${a.access_type !== 'public' ? ' · 🔒 Paid' : ''}
            ${a.price > 0 ? ` · 💰 $${a.price.toFixed(2)}` : ''}
          </div>
          ${body}
        </article>
        <div class="article-comments">
          <h2 class="article-comments-title">💬 Comments <span id="articleCommentCount" class="comment-count"></span></h2>
          <div id="articleCommentList"><p class="empty">Loading...</p></div>
          <div class="comment-form">
            <h3>Leave a comment</h3>
            ${opts.user
              ? `<textarea id="articleCommentContent" placeholder="Write your comment..." rows="3"></textarea>
            <button class="btn-primary" type="button" onclick="submitArticleComment(${a.id})">Post Comment</button>
            <div id="articleCommentMsg" style="margin-top:8px;font-size:.85rem;"></div>`
              : `<p class="comment-login-tip">💬 Please <a href="/login">log in</a> to join the discussion</p>`}
          </div>
        </div>
      </div>
      ${sidebar ? `<aside class="article-sidebar">${sidebar}</aside>` : ''}
    </div>
    ${buyScript(opts.payMethods || [])}
    <script>
    async function loadArticleComments(articleId) {
      var el = document.getElementById('articleCommentList');
      var countEl = document.getElementById('articleCommentCount');
      var r = await fetch('/api/articles/' + articleId + '/comments');
      var d = await r.json();
      var list = d.comments || [];
      if (countEl) countEl.textContent = list.length ? '(' + list.length + ')' : '';
      if (!list.length) { el.innerHTML = '<p class="empty">No comments yet. Be the first!</p>'; return; }
      el.innerHTML = list.map(function (cm) {
        var reply = cm.reply ? '<div class="comment-reply">Admin reply: ' + cm.reply.replace(/</g, '&lt;') + '</div>' : '';
        return '<div class="comment-item"><div class="comment-head"><span class="comment-name">' + (cm.user_name || 'Anonymous').replace(/</g, '&lt;') + '</span><span class="comment-date">' + (cm.created_at || '').slice(0, 10) + '</span></div><div class="comment-body">' + cm.content.replace(/</g, '&lt;') + '</div>' + reply + '</div>';
      }).join('');
    }
    async function submitArticleComment(articleId) {
      var content = document.getElementById('articleCommentContent').value.trim();
      var msg = document.getElementById('articleCommentMsg');
      if (!content) { msg.textContent = 'Please enter a comment'; msg.style.color = '#ff6b6b'; return; }
      var r = await fetch('/api/articles/' + articleId + '/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: content }) });
      var d = await r.json();
      if (d.error) { if (d.error.indexOf('log in') >= 0) location.href = '/login'; else { msg.textContent = d.error; msg.style.color = '#ff6b6b'; } return; }
      msg.textContent = 'Comment submitted. It will appear after review.'; msg.style.color = 'var(--teal)';
      document.getElementById('articleCommentContent').value = '';
    }
    loadArticleComments(${a.id});
    </script>`;

  return layout({
    title: a.title,
    description: a.excerpt,
    content,
    siteName: opts.siteName,
    tagline: opts.tagline,
    slogan: opts.slogan,
    logo: opts.logo,
    favicon: opts.favicon,
    social: opts.social,
    friendLinks: opts.friendLinks,
    cs: opts.cs,
    user: opts.user,
    navMenu: opts.navMenu,
  });
}

export function renderCategory(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  category: { name: string; description: string };
  articles: {
    id: number;
    title: string;
    excerpt: string;
    access_type: string;
    published_at: string | null;
  }[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const articleList = opts.articles
    .map((a) => {
      const lock = a.access_type !== 'public' ? ' 🔒' : '';
      return `<article class="card article-card">
        <h2><a href="/article/${a.id}">${esc(a.title)}</a>${lock}</h2>
        <div class="article-meta">${esc(formatDate(a.published_at))}</div>
        <p class="excerpt">${esc(a.excerpt || '')}</p>
      </article>`;
    })
    .join('');

  const content = `
    <h1>Category: ${esc(opts.category.name)}</h1>
    <p class="cat-desc">${esc(opts.category.description || '')}</p>
    <div class="home-articles">${articleList || '<p class="empty">No articles in this category</p>'}</div>`;

  return layout({
    title: opts.category.name,
    description: opts.category.description,
    content,
    siteName: opts.siteName,
    tagline: opts.tagline,
    slogan: opts.slogan,
    logo: opts.logo,
    favicon: opts.favicon,
    social: opts.social,
    friendLinks: opts.friendLinks,
    cs: opts.cs,
    user: opts.user,
    navMenu: opts.navMenu,
  });
}

function paginationHtml(page: number, totalPages: number, basePath: string): string {
  if (totalPages <= 1) return '';
  const prev = page > 1 ? `<a class="page-btn" href="${basePath}?page=${page - 1}">← Prev set</a>` : `<span class="page-btn disabled">← Prev set</span>`;
  const next = page < totalPages ? `<a class="page-btn" href="${basePath}?page=${page + 1}">Next set →</a>` : `<span class="page-btn disabled">Next set →</span>`;
  return `<div class="pagination">${prev}<span class="page-info">${page} / ${totalPages}</span>${next}</div>`;
}

function helperPagination(page: number, totalPages: number, basePath: string): string {
  if (totalPages <= 1) return '';
  let nums = '';
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) nums += `<a class="page-btn" href="${basePath}?page=1">1</a>${start > 2 ? '<span class="page-info">…</span>' : ''}`;
  for (let i = start; i <= end; i++) nums += `<a class="page-btn${i === page ? ' active' : ''}" href="${basePath}?page=${i}">${i}</a>`;
  if (end < totalPages) nums += `${end < totalPages - 1 ? '<span class="page-info">…</span>' : ''}<a class="page-btn" href="${basePath}?page=${totalPages}">${totalPages}</a>`;
  return `<div class="pagination">
    ${page > 1 ? `<a class="page-btn" href="${basePath}?page=${page - 1}">Prev</a>` : `<span class="page-btn disabled">Prev</span>`}
    ${nums}
    ${page < totalPages ? `<a class="page-btn" href="${basePath}?page=${page + 1}">Next</a>` : `<span class="page-btn disabled">Next</span>`}
  </div>`;
}

export function renderHelper(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  articles: { id: number; title: string }[];
  page: number;
  totalPages: number;
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const list = opts.articles.length
    ? opts.articles.map((a) => `<a class="helper-item" href="/article/${a.id}" target="_blank" rel="noopener noreferrer">${esc(a.title)}</a>`).join('')
    : '<p class="empty">No help content</p>';
  const content = `<h1 class="page-title">Help center</h1><div class="helper-list">${list}</div>${helperPagination(opts.page, opts.totalPages, '/helper')}`;
  return layout({ title: 'Help center', description: 'Help center', content, siteName: opts.siteName, tagline: opts.tagline, slogan: opts.slogan, logo: opts.logo, favicon: opts.favicon, social: opts.social, friendLinks: opts.friendLinks, cs: opts.cs, user: opts.user, navMenu: opts.navMenu });
}

export function renderGrid(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  title: string;
  subtitle: string;
  categories?: { id: number; name: string }[];
  currentCategory?: number;
  items: { id: number; title: string; cover_image: string; price: number; access_type: string; published_at: string | null; category_name: string; type: string; product_type?: string }[];
  page: number;
  totalPages: number;
  basePath: string;
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const grid = opts.items
    .map((it) => {
      const cover = it.cover_image
        ? `<img src="${esc(it.cover_image)}" alt="${esc(it.title)}" class="grid-cover" loading="lazy">`
        : `<div class="grid-cover grid-cover-ph">${it.type === 'course' ? '🎓' : '🛍'}</div>`;
      const price = it.price > 0 ? `$${it.price.toFixed(2)}` : 'Free';
      const lock = it.access_type !== 'public' ? ' 🔒' : '';
      const typeTag = it.product_type ? `<span class="grid-type-tag ${it.product_type === 'virtual' ? 'vt-virtual' : 'vt-physical'}">${it.product_type === 'virtual' ? 'Virtual' : 'Physical'}</span>` : '';
      const href = it.type === 'course' ? `/course/${it.id}` : it.type === 'product' ? `/product/${it.id}` : `/article/${it.id}`;
      return `<a class="grid-card" href="${href}">
        ${cover}
        <div class="grid-body">
          <h3>${esc(it.title)}${lock}</h3>
          <div class="grid-meta">${typeTag}${esc(it.category_name || '')}</div>
          <div class="grid-price">${price}</div>
        </div>
      </a>`;
    })
    .join('');
  const categoryTabs = `<div class="category-tabs-box"><div class="category-tabs"><a href="${esc(opts.basePath)}" class="tab${!opts.currentCategory ? ' active' : ''}">All</a>${(opts.categories || []).map((cat) => `<a href="${esc(opts.basePath)}?category=${cat.id}" class="tab${opts.currentCategory === cat.id ? ' active' : ''}">${esc(cat.name)}</a>`).join('')}</div><button type="button" class="cat-toggle" style="display:none;" onclick="toggleCatTabs(this)" aria-label="More categories">›</button></div>`;
  const content = `${categoryTabs}<div class="grid grid-4">${grid || '<p class="empty">No content</p>'}</div>${paginationHtml(opts.page, opts.totalPages, opts.basePath)}`;
  return layout({
    title: opts.title,
    content,
    siteName: opts.siteName,
    tagline: opts.tagline,
    slogan: opts.slogan,
    logo: opts.logo,
    favicon: opts.favicon,
    social: opts.social,
    friendLinks: opts.friendLinks,
    cs: opts.cs,
    user: opts.user,
    navMenu: opts.navMenu,
  });
}

export function renderArticles(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  categories?: { id: number; name: string }[];
  currentCategory?: number;
  articles: { id: number; title: string; excerpt: string; access_type: string; published_at: string | null; category_name: string; cover_image: string }[];
  page: number;
  totalPages: number;
  basePath: string;
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const list = opts.articles
    .map((a) => {
      const lock = a.access_type !== 'public' ? ' 🔒' : '';
      const cover = a.cover_image ? `<img src="${esc(a.cover_image)}" alt="${esc(a.title)}" class="grid-cover" loading="lazy">` : `<div class="grid-cover grid-cover-ph">📄</div>`;
      return `<a class="grid-card" href="/article/${a.id}">
        ${cover}
        <div class="grid-body">
          <h3>${esc(a.title)}${lock}</h3>
          <div class="grid-meta">${esc(a.category_name || 'Uncategorized')} · ${esc(formatDate(a.published_at))}</div>
          <p class="grid-excerpt">${esc(a.excerpt || '')}</p>
        </div>
      </a>`;
    })
    .join('');
  const categoryTabs = `<div class="category-tabs-box"><div class="category-tabs"><a href="${esc(opts.basePath)}" class="tab${!opts.currentCategory ? ' active' : ''}">All</a>${(opts.categories || []).map((cat) => `<a href="${esc(opts.basePath)}?category=${cat.id}" class="tab${opts.currentCategory === cat.id ? ' active' : ''}">${esc(cat.name)}</a>`).join('')}</div><button type="button" class="cat-toggle" style="display:none;" onclick="toggleCatTabs(this)" aria-label="More categories">›</button></div>`;
  const content = `${categoryTabs}<div class="grid grid-4">${list || '<p class="empty">No articles</p>'}</div>${paginationHtml(opts.page, opts.totalPages, opts.basePath)}`;
  return layout({
    title: 'Articles',
    description: 'All articles',
    content,
    siteName: opts.siteName,
    tagline: opts.tagline,
    slogan: opts.slogan,
    logo: opts.logo,
    favicon: opts.favicon,
    social: opts.social,
    friendLinks: opts.friendLinks,
    cs: opts.cs,
    user: opts.user,
    navMenu: opts.navMenu,
  });
}

function buildEmbedUrl(video: { video_type: string; video_url: string }): string {
  const type = video.video_type || 'direct';
  const url = (video.video_url || '').trim();
  if (!url) return '';
  if (type === 'bilibili') {
    const m = url.match(/BV[\w]+/i);
    return m ? `https://player.bilibili.com/player.html?bvid=${m[0]}&high_quality=1&autoplay=0` : url;
  }
  if (type === 'youtube') {
    const m = url.match(/(?:v=|youtu\.be\/)([\w-]+)/i);
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : url;
  }
  return url;
}

const PAY_METHOD_LABELS: Record<string, string> = { alipay: 'Alipay', wxpay: 'WeChat', usdt: 'USDT', stripe: 'Stripe' };
const PAY_METHOD_ICONS: Record<string, string> = {
  alipay: '/media/pay-icons/alipay.png',
  wxpay: '/media/pay-icons/wechat.png',
  usdt: '/media/pay-icons/usdt.png',
  stripe: '/media/uploads/1787524517598-a5c64d366bca.jpeg',
};
function buyScript(payMethods: string[]): string {
  const methods = payMethods && payMethods.length ? payMethods : ['usdt', 'wxpay', 'alipay', 'stripe'];
  const radios = methods.map((m, i) => {
    const label = PAY_METHOD_LABELS[m] || m;
    const icon = PAY_METHOD_ICONS[m];
    return `<label class="bm-method${i === 0 ? ' checked' : ''}"><input type="radio" name="bm_method" value="${m}"${i === 0 ? ' checked' : ''}>${icon ? `<img src="${icon}" alt="${label}" title="${label}">` : `<span>${label}</span>`}</label>`;
  }).join('');
  const firstMethod = methods[0] || 'usdt';
  return `<script>
function escHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function submitOrder(url, body) {
  fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    .then(function(r){ return r.json(); }).then(function(d) {
      if (d.error) { alert(d.error); return; }
      var form = document.createElement('form'); form.method='post'; form.action=d.submit_url;
      for (var k in d.params) { var inp=document.createElement('input'); inp.type='hidden'; inp.name=k; inp.value=d.params[k]; form.appendChild(inp); }
      document.body.appendChild(form); form.submit();
    }).catch(function(){ alert('Order creation failed, try again'); });
}
var _buyCtx = null;
function ensureBuyModal() {
  if (document.getElementById('buyModalOverlay')) return;
  var html = '<div class="buy-modal-overlay" id="buyModalOverlay" style="display:none;"><div class="buy-modal">' +
    '<div class="bm-head"><span id="bm_title" style="font-weight:700;"></span><a href="javascript:;" onclick="closeBuyModal()" style="color:var(--text-muted);text-decoration:none;">✕</a></div>' +
    '<div class="bm-body">' +
    '<div class="bm-row"><label>Amount</label><span class="bm-price" id="bm_price"></span></div>' +
    '<div id="bm_addr" style="display:none;">' +
      '<div class="bm-row"><label>Shipping address</label></div><div id="bm_addr_list"></div>' +
      '<a href="javascript:;" onclick="toggleNewAddr()" style="font-size:.85rem;color:var(--gold);">+ Add address</a>' +
      '<div id="bm_new_addr" style="display:none;margin-top:8px;">' +
        '<input id="bm_name" placeholder="Recipient name"><input id="bm_phone" placeholder="Phone"><input id="bm_detail" placeholder="Detailed address">' +
        '<input id="bm_province" placeholder="State/Province (optional)"><input id="bm_city" placeholder="City (optional)"><input id="bm_country" placeholder="Country(optional)">' +
      '</div>' +
      '<div class="bm-row"><label>Qty</label><input id="bm_qty" type="number" min="1" value="1" style="width:70px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg-soft);color:var(--text);"></div>' +
    '</div>' +
    '<div class="bm-row"><label>Payment method</label></div>' +
    '<div class="bm-methods">${radios}</div>' +
    '</div>' +
    '<div class="bm-foot"><button class="btn-primary" onclick="submitBuy()" style="width:100%;">Place order</button></div>' +
    '</div></div>';
  var div = document.createElement('div'); div.innerHTML = html; document.body.appendChild(div.firstChild);
  document.querySelectorAll('.bm-method input').forEach(function (inp) {
    inp.addEventListener('change', function () {
      document.querySelectorAll('.bm-method').forEach(function (l) { l.classList.remove('checked'); });
      if (inp.closest) inp.closest('.bm-method').classList.add('checked');
    });
  });
}
function hideMediaUnderModal() {
  document.querySelectorAll('iframe, video').forEach(function (m) {
    if (m.closest && !m.closest('#buyModalOverlay')) {
      m.classList.add('bm-under-modal');
      if (m.tagName === 'VIDEO' && typeof m.pause === 'function') m.pause();
    }
  });
}
function showMediaUnderModal() {
  document.querySelectorAll('iframe.bm-under-modal, video.bm-under-modal').forEach(function (m) {
    m.classList.remove('bm-under-modal');
  });
}
function openBuyModal(el, type, id, price, isPhysical) {
  ensureBuyModal();
  _buyCtx = { type: type, id: id, isPhysical: isPhysical };
  document.getElementById('bm_title').textContent = el.getAttribute('data-title') || '';
  document.getElementById('bm_price').textContent = '$' + Number(price).toFixed(2);
  document.getElementById('bm_addr').style.display = isPhysical ? '' : 'none';
  document.getElementById('bm_new_addr').style.display = 'none';
  document.getElementById('bm_qty').value = '1';
  document.getElementById('buyModalOverlay').style.display = 'flex';
  hideMediaUnderModal();
  if (isPhysical) loadBuyAddresses();
}
function closeBuyModal() {
  showMediaUnderModal();
  document.getElementById('buyModalOverlay').style.display = 'none';
}
function toggleNewAddr() { var el = document.getElementById('bm_new_addr'); el.style.display = el.style.display === 'none' ? '' : 'none'; }
async function loadBuyAddresses() {
  var r = await fetch('/api/account/addresses'); var d = await r.json();
  var list = d.addresses || []; var el = document.getElementById('bm_addr_list');
  if (!list.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:.85rem;">No shipping address yet</div>'; return; }
  el.innerHTML = list.map(function(a) {
    return '<label style="display:flex;gap:6px;align-items:center;padding:4px 0;font-size:.9rem;"><input type="radio" name="bm_addr_id" value="' + a.id + '"' + (a.is_default ? ' checked' : '') + '> ' + escHtml(a.name) + ' ' + escHtml(a.phone) + '<span style="color:var(--text-muted);font-size:.8rem;">' + escHtml(a.detail) + (a.is_default ? ' (default)' : '') + '</span></label>';
  }).join('');
}
async function submitBuy() {
  if (!_buyCtx) return;
  var m = document.querySelector('input[name="bm_method"]:checked');
  var method = m ? m.value : '${firstMethod}';
  var body = { method: method };
  if (_buyCtx.type === 'course') {
    body.course_id = _buyCtx.id;
    submitOrder('/api/course/order', body);
    return;
  }
  if (_buyCtx.type === 'article') {
    body.article_id = _buyCtx.id;
    submitOrder('/api/article/order', body);
    return;
  }
  body.product_id = _buyCtx.id;
  if (_buyCtx.isPhysical) {
    var sel = document.querySelector('input[name="bm_addr_id"]:checked');
    if (sel) {
      body.address_id = Number(sel.value);
    } else {
      var name = document.getElementById('bm_name').value.trim();
      var phone = document.getElementById('bm_phone').value.trim();
      var detail = document.getElementById('bm_detail').value.trim();
      if (!name || !phone || !detail) { alert('Please fill in recipient, phone and address'); return; }
      var ar = await fetch('/api/account/addresses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: name, phone: phone, detail: detail, province: document.getElementById('bm_province').value.trim(), city: document.getElementById('bm_city').value.trim(), country: document.getElementById('bm_country').value.trim() }) });
      var ad = await ar.json();
      if (ad.error) { alert(ad.error); return; }
      body.address_id = ad.id;
    }
    body.quantity = Number(document.getElementById('bm_qty').value) || 1;
  }
  submitOrder('/api/product/order', body);
}
</script>`;
}

export function renderCourse(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  course: { id: number; title: string; cover_image: string; intro: string; price: number; access_type: string; is_top: number; sticky_order: number; created_at: string };
  chapters: { id: number; title: string; videos: { id: number; title: string; video_type: string; video_url: string; is_free: number; article_id: number; article_title: string }[] }[];
  canAccess: boolean;
  purchased: boolean;
  payMethods?: string[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const a = opts.course;
  const allVideos: any[] = [];
  for (const ch of opts.chapters) for (const v of ch.videos) allVideos.push(v);
  const firstPlayable = allVideos.find((v) => opts.canAccess || v.is_free);
  const firstEmbed = firstPlayable ? buildEmbedUrl(firstPlayable) : '';

  const player = firstEmbed
    ? `<div class="course-player"><iframe src="${firstEmbed}" allowfullscreen frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`
    : `<div class="course-player course-player-empty"><div>📼 No video content</div></div>`;

  let purchaseBar = '';
  if (a.access_type === 'paid' && !opts.canAccess) {
    purchaseBar = `<div class="course-buy"><span class="course-price">$${a.price.toFixed(2)}</span>${opts.user ? `<button class="btn-primary" onclick="openBuyModal(this, 'course', ${a.id}, ${a.price}, false)" data-title="${esc(a.title)}">Buy now</button>` : `<a class="btn-primary" href="/login">Log in to buy</a>`}</div>`;
  } else if (opts.purchased) {
    purchaseBar = `<div class="course-buy"><span class="badge badge-public">✅ Purchased</span></div>`;
  } else if (opts.canAccess && a.access_type === 'paid') {
    purchaseBar = `<div class="course-buy"><span class="badge badge-public">👑 Member view</span></div>`;
  }

  const chapterHtml = opts.chapters
    .map((ch) => {
      const videos = ch.videos
        .map((v) => {
          const playable = opts.canAccess || !!v.is_free;
          const lock = playable ? '' : ' 🔒';
          const articleLink = v.article_id
            ? `<a class="course-video-article" href="/article/${v.article_id}" target="_blank" rel="noopener noreferrer" title="Open related article in a new tab">📄 Related article: ${esc(v.article_title || 'Article #' + v.article_id)}</a>`
            : '';
          return `<div class="course-video-item"><a href="javascript:;" class="course-video-link${playable ? '' : ' locked'}" data-embed="${playable ? esc(buildEmbedUrl(v)) : ''}" data-title="${esc(v.title)}" onclick="playVideo(this)">${esc(v.title)}${lock}</a>${articleLink}</div>`;
        })
        .join('');
      return `<div class="course-chapter"><div class="course-chapter-title">${esc(ch.title)}</div>${videos}</div>`;
    })
    .join('');

  const content = `
    <article class="course-full">
      <div class="course-head">
        <h1>${esc(a.title)}</h1>
        <div class="course-head-meta">
          <div class="article-meta">${esc(formatDate(a.created_at))}${a.access_type === 'paid' ? ' · 🔒 Paid' : ' · Free'}</div>
          ${purchaseBar}
        </div>
      </div>
      <div class="course-layout">
        <div class="course-main">
          ${player}
          <div class="course-intro">${a.intro || ''}</div>
        </div>
        <aside class="course-sidebar"><h2>Course outline</h2>${chapterHtml || '<p class="empty">No chapters</p>'}</aside>
      </div>
    </article>
    <script>
    window._courseBuy = { id: ${a.id}, price: ${a.price}, title: ${JSON.stringify(a.title).replace(/</g, '\\u003c')} };
    function playVideo(el) {
      if (el.classList.contains('locked')) {
        var buyBtn = document.querySelector('.course-head-meta .btn-primary[onclick], .course-buy .btn-primary[onclick]');
        if (buyBtn && typeof openBuyModal === 'function') {
          openBuyModal(buyBtn, 'course', window._courseBuy.id, window._courseBuy.price, false);
        } else {
          var loginLink = document.querySelector('.course-head-meta .btn-primary[href="/login"], .course-buy .btn-primary[href="/login"]');
          if (loginLink) { location.href = '/login'; return; }
          alert('This video is locked. Please log in and purchase the course to watch.');
        }
        return;
      }
      var embed = el.getAttribute('data-embed');
      var iframe = document.querySelector('.course-player iframe');
      if (iframe && embed) iframe.src = embed;
      document.querySelectorAll('.course-video-link').forEach(function(x){ x.classList.remove('active'); });
      el.classList.add('active');
    }
    </script>
    ${buyScript(opts.payMethods || [])}`;
  return layout({ title: a.title, description: a.intro, content, siteName: opts.siteName, tagline: opts.tagline, slogan: opts.slogan, logo: opts.logo, favicon: opts.favicon, social: opts.social, friendLinks: opts.friendLinks, cs: opts.cs, user: opts.user, navMenu: opts.navMenu });
}

export function renderProduct(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  product: { id: number; name: string; cover: string; images: string; short_description: string; price: number; sale_price: number; type: string; description: string; stock: number; file_url: string; file_name: string; file_size: number; hidden_content: string; is_featured: number; is_hot: number; sort_order: number; created_at: string };
  canAccess: boolean;
  purchased: boolean;
  purchaseHistory?: { order_no: string; total_amount: number; status: string; payment_method: string; created_at: string }[];
  vipDiscount?: number;
  payMethods?: string[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const a = opts.product;
  const isVirtual = a.type === 'virtual';
  const price = a.sale_price > 0 ? a.sale_price : a.price;
  const vipDiscount = opts.vipDiscount ?? 100;
  const isVipDiscount = !!(opts.user?.isVip) && vipDiscount < 100 && vipDiscount > 0 && price > 0;
  const finalPrice = isVipDiscount ? Math.round(price * vipDiscount) / 100 : price;
  const priceText = price > 0 ? `$${price.toFixed(2)}` : 'Free';
  const finalPriceText = finalPrice > 0 ? `$${finalPrice.toFixed(2)}` : 'Free';
  const priceShow = isVipDiscount ? `<span style="text-decoration:line-through;opacity:.6;margin-right:8px;">${priceText}</span><span class="vip-discount">${finalPriceText}</span><span class="badge badge-public" style="margin-left:8px;">👑 VIP ${vipDiscount}% off</span>` : priceText;

  // Gallery: cover + images JSON array
  let images: string[] = [];
  try { images = JSON.parse(a.images || '[]'); } catch { images = []; }
  if (!Array.isArray(images)) images = [];
  const gallery = a.cover ? [a.cover, ...images.filter((i) => i && i !== a.cover)] : images.filter(Boolean);
  const galleryJson = JSON.stringify(gallery);

  const shortDesc = a.short_description ? `<div class="product-short-desc">${esc(a.short_description)}</div>` : '';
  const stockText = isVirtual ? '' : (a.stock > 0 ? `<span class="product-stock-in">📦 In stock: ${a.stock} pcs</span>` : `<span class="product-stock-out">📦 Temporarily out of stock</span>`);

  let purchaseBar = '';
  const buyBtn = (finalPrice > 0 || a.type === 'physical')
    ? `<div class="product-actions">
        ${opts.user ? `<button class="btn-primary" onclick="openBuyModal(this, 'product', ${a.id}, ${finalPrice}, ${isVirtual ? 'false' : 'true'})" data-title="${esc(a.name)}">Buy now</button>` : `<a class="btn-primary" href="/login">Log in to buy</a>`}
        ${isVirtual ? '' : '<button class="btn-ghost add-cart-btn" onclick="addToCart(' + a.id + ')">🛒 Add to cart</button>'}
      </div>`
    : (price > 0 && !opts.canAccess ? `<div class="product-actions">${opts.user ? `<button class="btn-primary" onclick="openBuyModal(this, 'product', ${a.id}, ${finalPrice}, ${isVirtual ? 'false' : 'true'})" data-title="${esc(a.name)}">Buy now</button>` : `<a class="btn-primary" href="/login">Log in to buy</a>`}</div>` : '');
  if (isVirtual) {
    // 虚拟商品（如 1-on-1 Live lesson）：可重复购买，始终保留 Buy now；已购/会员显示徽章
    const badges: string[] = [];
    if (opts.purchased) badges.push('<span class="badge badge-public">✅ Purchased</span>');
    else if (opts.canAccess && price > 0) badges.push('<span class="badge badge-public">👑 Member view</span>');
    const buy = finalPrice > 0 ? buyBtn : '';
    purchaseBar = (badges.length ? `<div class="course-buy">${badges.join('')}</div>` : '') + buy;
  } else {
    purchaseBar = buyBtn;
  }

  // Product description (public part)
  const descHtml = `<div class="article-body">${a.description || '<p>No description</p>'}</div>`;

  // Virtual product: download + hidden content (visible after purchase)
  // 若既无下载文件也无隐藏内容，则不显示下载/付费墙区块
  let virtualBlock = '';
  if (isVirtual && (a.file_url || a.hidden_content)) {
    if (opts.canAccess) {
      const downloadBtn = a.file_url ? `<a class="btn-primary" href="/api/product/${a.id}/download" style="display:inline-flex;align-items:center;gap:6px;">⬇️ Download file${a.file_name ? ` (${esc(a.file_name)})` : ''}</a>` : '';
      const hidden = a.hidden_content ? `<div class="hidden-content-box"><div class="hc-title">🔐 Content visible after purchase</div><div class="article-body">${a.hidden_content}</div></div>` : '';
      virtualBlock = `<div class="virtual-access">${downloadBtn}${hidden}</div>`;
    } else {
      virtualBlock = `<div class="paywall"><div class="paywall-box"><div class="paywall-icon">🔒</div><h2>Download after purchase</h2><p>Download file after purchase${a.hidden_content ? 'and view hidden content' : ''}</p></div></div>`;
    }
  }

  const purchaseHistoryHtml = isVirtual && opts.purchaseHistory && opts.purchaseHistory.length
    ? `<div class="purchase-history">
        <h3>🕘 Purchase history</h3>
        <table class="ph-table">
          <thead><tr><th>Order No.</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            ${opts.purchaseHistory.map((o) => `<tr><td>${esc(o.order_no)}</td><td>$${Number(o.total_amount).toFixed(2)}</td><td>${esc(o.status)}</td><td>${esc(formatDate(o.created_at))}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`
    : '';

  const galleryHtml = `<div class="gallery">
      <div class="gallery-main-wrap">
        <div class="gallery-main" id="galleryMain"></div>
        <button class="gallery-btn gallery-prev" type="button" onclick="galleryPrev()" aria-label="Prev">‹</button>
        <button class="gallery-btn gallery-next" type="button" onclick="galleryNext()" aria-label="Next">›</button>
        <button class="gallery-zoom" type="button" onclick="galleryZoom()" title="Zoom in">🔍</button>
        <div class="gallery-count" id="galleryCount"></div>
      </div>
      <div class="gallery-thumbs" id="galleryThumbs"></div>
    </div>`;

  const content = `
    <article class="product-full">
      <div class="product-layout">
        <div class="product-gallery-col">${galleryHtml}</div>
        <div class="product-info-col">
          <h1 class="product-title">${esc(a.name)}</h1>
          ${shortDesc}
          <div class="product-meta">${isVirtual ? '🛒 Virtual product' : '📦 Physical product'} · ${esc(formatDate(a.created_at))}</div>
          <div class="product-price-row">${priceShow}</div>
          <div class="product-stock-row">${stockText}</div>
          ${purchaseBar}
          ${purchaseHistoryHtml}
        </div>
      </div>
      <div class="product-tabs">
        <button class="tab-btn active" type="button" onclick="switchTab('desc', this)">Product description</button>
        <button class="tab-btn" type="button" onclick="switchTab('reviews', this)">Review</button>
      </div>
      <div class="tab-panel" id="tab-desc">${descHtml}${virtualBlock}</div>
      <div class="tab-panel" id="tab-reviews" style="display:none;">
        <div id="commentList"><p class="empty">Loading...</p></div>
        <div class="comment-form">
          <h3>Write a review</h3>
          <div class="rating-input" id="ratingInput">
            ${[1, 2, 3, 4, 5].map((n) => `<span class="star" data-star="${n}" onclick="setRating(${n})">☆</span>`).join('')}
          </div>
          <textarea id="commentContent" placeholder="Share your experience..." rows="3"></textarea>
          <button class="btn-primary" type="button" onclick="submitComment(${a.id})">Submit review</button>
          <div id="commentMsg" style="margin-top:8px;font-size:.85rem;"></div>
        </div>
      </div>
    </article>
    <div id="lightbox" class="lightbox" style="display:none;" onclick="closeLightbox()"><img id="lightboxImg" alt="Product image enlarged"></div>
    ${buyScript(opts.payMethods || [])}
    <script>
    var _gallery = ${galleryJson};
    var _gi = 0;
    function renderGallery() {
      var main = document.getElementById('galleryMain');
      var thumbs = document.getElementById('galleryThumbs');
      var count = document.getElementById('galleryCount');
      if (!main || !thumbs) return;
      if (!_gallery.length) { main.innerHTML = '<div class="gallery-ph">🛍</div>'; thumbs.innerHTML = ''; if (count) count.textContent = ''; return; }
      main.innerHTML = '<img src="' + _gallery[_gi] + '" alt="Product image" onclick="galleryZoom()">';
      if (count) count.textContent = (_gi + 1) + ' / ' + _gallery.length;
      thumbs.innerHTML = _gallery.map(function (src, i) {
        return '<img src="' + src + '" class="thumb' + (i === _gi ? ' active' : '') + '" onclick="_gi=' + i + ';renderGallery();" alt="Thumbnail">';
      }).join('');
    }
    function galleryPrev() { if (_gallery.length) { _gi = (_gi - 1 + _gallery.length) % _gallery.length; renderGallery(); } }
    function galleryNext() { if (_gallery.length) { _gi = (_gi + 1) % _gallery.length; renderGallery(); } }
    function galleryZoom() { if (!_gallery.length) return; document.getElementById('lightboxImg').src = _gallery[_gi]; document.getElementById('lightbox').style.display = 'flex'; }
    function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }
    function switchTab(tab, btn) {
      document.getElementById('tab-desc').style.display = tab === 'desc' ? '' : 'none';
      document.getElementById('tab-reviews').style.display = tab === 'reviews' ? '' : 'none';
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
      if (tab === 'reviews') loadComments(${a.id});
    }
    async function addToCart(productId) {
      var r = await fetch('/api/cart', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product_id: productId, quantity: 1 }) });
      var d = await r.json();
      if (d.error) { if (d.error.indexOf('Log in') >= 0) location.href = '/login'; else alert(d.error); return; }
      alert('Added to cart 🛒');
      if (typeof loadCartCount === 'function') loadCartCount();
    }
    var _rating = 5;
    function setRating(n) {
      _rating = n;
      document.querySelectorAll('#ratingInput .star').forEach(function (s) { s.textContent = parseInt(s.getAttribute('data-star')) <= n ? '★' : '☆'; });
    }
    setRating(5);
    async function loadComments(productId) {
      var el = document.getElementById('commentList');
      var r = await fetch('/api/products/' + productId + '/comments');
      var d = await r.json();
      var list = d.comments || [];
      if (!list.length) { el.innerHTML = '<p class="empty">No reviews yet, be the first!～</p>'; return; }
      el.innerHTML = list.map(function (cm) {
        var stars = ''; for (var i = 1; i <= 5; i++) stars += i <= cm.rating ? '★' : '☆';
        var reply = cm.reply ? '<div class="comment-reply">Merchant reply: ' + cm.reply.replace(/</g, '&lt;') + '</div>' : '';
        return '<div class="comment-item"><div class="comment-head"><span class="comment-name">' + (cm.user_name || 'Anonymous').replace(/</g, '&lt;') + '</span><span class="comment-stars">' + stars + '</span><span class="comment-date">' + (cm.created_at || '').slice(0, 10) + '</span></div><div class="comment-body">' + cm.content.replace(/</g, '&lt;') + '</div>' + reply + '</div>';
      }).join('');
    }
    async function submitComment(productId) {
      var content = document.getElementById('commentContent').value.trim();
      var msg = document.getElementById('commentMsg');
      if (!content) { msg.textContent = 'Please enter review content'; msg.style.color = '#ff6b6b'; return; }
      var r = await fetch('/api/products/' + productId + '/comments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rating: _rating, content: content }) });
      var d = await r.json();
      if (d.error) { if (d.error.indexOf('Log in') >= 0) location.href = '/login'; else { msg.textContent = d.error; msg.style.color = '#ff6b6b'; } return; }
      msg.textContent = 'Review submitted, visible after approval'; msg.style.color = 'var(--teal)';
      document.getElementById('commentContent').value = '';
      loadComments(productId);
    }
    renderGallery();
    </script>`;
  return layout({ title: a.name, description: a.short_description || '', content, siteName: opts.siteName, tagline: opts.tagline, slogan: opts.slogan, logo: opts.logo, favicon: opts.favicon, social: opts.social, friendLinks: opts.friendLinks, cs: opts.cs, user: opts.user, navMenu: opts.navMenu });
}

export function renderCart(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  payMethods?: string[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const methods = (opts.payMethods && opts.payMethods.length) ? opts.payMethods : ['usdt', 'alipay', 'wxpay', 'stripe'];
  const methodOptions = methods.map((m) => `<option value="${m}">${PAY_METHOD_LABELS[m] || m}</option>`).join('');
  const content = `
    <div class="cart-page">
      <h1 class="account-title">Cart</h1>
      <div id="cartList"><p class="empty">Loading...</p></div>
    </div>
    <div id="checkoutModal" class="checkout-modal" style="display:none;">
      <div class="checkout-box">
        <h3>🛒 Combined checkout</h3>
        <div id="checkoutAddress" style="display:none;">
          <div class="form-group" id="addrSelectGroup" style="display:none;">
            <label>Shipping address</label>
            <select id="co_address_id"></select>
          </div>
          <div id="addrManualGroup">
            <div class="form-group"><label>Recipient</label><input id="co_name" placeholder="Name"></div>
            <div class="form-group"><label>Phone</label><input id="co_phone" placeholder="Phone"></div>
            <div class="form-group"><label>Detailed address</label><input id="co_address" placeholder="Province/City + Detailed address"></div>
          </div>
        </div>
        <div class="form-group"><label>Payment method</label>
          <select id="co_method">${methodOptions}</select>
        </div>
        <div class="form-error" id="co_err"></div>
        <div style="display:flex;gap:10px;margin-top:12px;">
          <button class="btn-primary" type="button" onclick="submitCheckout()">Confirm order</button>
          <button class="btn-ghost" type="button" onclick="closeCheckout()">Cancel</button>
        </div>
      </div>
    </div>
    <script>
    var _cartHasPhysical = false;
    var _addresses = [];
    async function loadCart() {
      var el = document.getElementById('cartList');
      var r = await fetch('/api/cart');
      var d = await r.json();
      if (d.error) {
        el.innerHTML = '<div class="paywall"><div class="paywall-box"><div class="paywall-icon">🛒</div><h2>Please log in</h2><p>Log in to use the cart</p><a class="btn-primary" href="/login">Log in</a></div></div>';
        return;
      }
      var items = d.items || [];
      if (!items.length) { el.innerHTML = '<p class="empty">Your cart is empty, browse the shop!～</p>'; return; }
      _cartHasPhysical = items.some(function (it) { return it.type === 'physical'; });
      if (_cartHasPhysical) loadAddresses();
      var total = 0;
      el.innerHTML = '<div class="cart-list">' + items.map(function (it) {
        var price = it.sale_price > 0 ? it.sale_price : it.price;
        var sub = price * it.quantity;
        total += sub;
        return '<div class="cart-item">' +
          '<a class="cart-item-cover" href="/product/' + it.product_id + '">' + (it.cover ? '<img src="' + it.cover + '" alt="">' : '<div class="grid-cover-ph">🛍</div>') + '</a>' +
          '<div class="cart-item-info">' +
            '<a class="cart-item-name" href="/product/' + it.product_id + '">' + it.name.replace(/</g, '&lt;') + '</a>' +
            '<div class="cart-item-price">$' + price.toFixed(2) + '</div>' +
            '<div class="cart-item-qty">' +
              '<button type="button" onclick="changeQty(' + it.id + ',' + (it.quantity - 1) + ')">−</button>' +
              '<span>' + it.quantity + '</span>' +
              '<button type="button" onclick="changeQty(' + it.id + ',' + (it.quantity + 1) + ')">＋</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item-actions">' +
            '<div class="cart-item-sub">$' + sub.toFixed(2) + '</div>' +
            '<a class="btn-ghost" style="font-size:.8rem;" href="/product/' + it.product_id + '">Buy now</a>' +
            '<button class="cart-item-del" type="button" onclick="delCart(' + it.id + ')">Delete</button>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="cart-summary"><span>Total ' + items.length + ' item(s), total: </span><span class="cart-total">$' + total.toFixed(2) + '</span></div>' +
      '<button class="btn-primary" style="width:100%;margin-top:14px;" type="button" onclick="openCheckout()">Combined checkout</button>';
    }
    async function loadAddresses() {
      try {
        var r = await fetch('/api/account/addresses');
        var d = await r.json();
        _addresses = d.addresses || [];
      } catch (e) { _addresses = []; }
    }
    function openCheckout() {
      var addrBox = document.getElementById('checkoutAddress');
      document.getElementById('co_err').textContent = '';
      if (_cartHasPhysical) {
        addrBox.style.display = '';
        var selGroup = document.getElementById('addrSelectGroup');
        var manualGroup = document.getElementById('addrManualGroup');
        if (_addresses.length) {
          selGroup.style.display = '';
          manualGroup.style.display = 'none';
          var sel = document.getElementById('co_address_id');
          sel.innerHTML = _addresses.map(function (a) {
            var label = a.name + ' ' + a.phone + ' ' + (a.province || '') + (a.city || '') + (a.detail || '');
            return '<option value="' + a.id + '">' + label.replace(/</g, '&lt;') + (a.is_default ? ' (default)' : '') + '</option>';
          }).join('');
          var def = _addresses.find(function (a) { return a.is_default; }) || _addresses[0];
          if (def) sel.value = def.id;
        } else {
          selGroup.style.display = 'none';
          manualGroup.style.display = '';
        }
      } else {
        addrBox.style.display = 'none';
      }
      document.getElementById('checkoutModal').style.display = 'flex';
    }
    function closeCheckout() { document.getElementById('checkoutModal').style.display = 'none'; }
    async function submitCheckout() {
      var err = document.getElementById('co_err');
      var body = { method: document.getElementById('co_method').value };
      if (_cartHasPhysical) {
        var usingSaved = _addresses.length > 0 && document.getElementById('addrSelectGroup').style.display !== 'none';
        if (usingSaved) {
          body.address_id = document.getElementById('co_address_id').value;
        } else {
          body.name = document.getElementById('co_name').value.trim();
          body.phone = document.getElementById('co_phone').value.trim();
          body.address = document.getElementById('co_address').value.trim();
          if (!body.name || !body.phone || !body.address) { err.textContent = 'Please fill in recipient, phone and address'; return; }
        }
      }
      var r = await fetch('/api/cart/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      var d = await r.json();
      if (d.error) { err.textContent = d.error; return; }
      if (d.free) { alert('Order placed successfully!'); location.reload(); return; }
      var form = document.createElement('form');
      form.method = 'POST'; form.action = d.submit_url;
      Object.keys(d.params || {}).forEach(function (k) {
        var input = document.createElement('input');
        input.type = 'hidden'; input.name = k; input.value = d.params[k];
        form.appendChild(input);
      });
      document.body.appendChild(form); form.submit();
    }
    async function changeQty(id, qty) {
      if (qty < 1) return;
      await fetch('/api/cart/' + id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quantity: qty }) });
      if (typeof loadCartCount === 'function') loadCartCount();
      loadCart();
    }
    async function delCart(id) {
      if (!confirm('Remove this product??')) return;
      await fetch('/api/cart/' + id, { method: 'DELETE' });
      if (typeof loadCartCount === 'function') loadCartCount();
      loadCart();
    }
    loadCart();
    </script>`;
  return layout({ title: 'Cart', description: 'Cart', content, siteName: opts.siteName, tagline: opts.tagline, slogan: opts.slogan, logo: opts.logo, favicon: opts.favicon, social: opts.social, friendLinks: opts.friendLinks, cs: opts.cs, user: opts.user, navMenu: opts.navMenu });
}

interface AccountUser {
  name: string;
  email: string;
  role: string;
  invite_code: string;
  membership_tier: string;
  membership_expires_at: string | null;
  email_verified: number;
  active: boolean;
  withdraw_name: string;
  withdraw_wechat: string;
  withdraw_alipay: string;
  withdraw_usdt: string;
  avatar: string;
}

const PLAN_LABEL: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' };

function accountShell(u: AccountUser, active: string, inner: string): string {
  const nav = [
    { key: 'overview', href: '/account', label: 'Overview', icon: '📊' },
    { key: 'purchased', href: '/account/purchased', label: 'Purchased orders', icon: '🔓' },
    { key: 'addresses', href: '/account/addresses', label: 'Shipping address', icon: '📍' },
    { key: 'invite', href: '/account/invite', label: 'Referral program', icon: '🎁' },
    { key: 'password', href: '/account/password', label: 'Change password', icon: '🔒' },
  ];
  const avatarHtml = u.avatar
    ? `<img class="avatar-img" src="${esc(u.avatar)}" alt="Avatar">`
    : `<div class="avatar">${esc((u.name || u.email || '?').slice(0, 1).toUpperCase())}</div>`;
  return `
    <div class="account-shell">
      <aside class="account-sidebar">
        <div class="account-user">
          <div class="avatar-wrap">
            ${avatarHtml}
            <button class="avatar-upload" type="button" title="Change avatar" onclick="document.getElementById('avatarFileInput').click()">📷</button>
          </div>
          <div class="u-name">${esc(u.name || '')}</div>
          <div class="u-email">${esc(u.email)}</div>
          ${u.email_verified
            ? ''
            : '<div class="u-verify"><span class="u-verify-tag">Unverified</span><button class="u-resend-btn" type="button" onclick="resendVerify()">Resend email</button></div>'}
        </div>
        <nav class="account-nav">
          ${nav.map((n) => `<a href="${n.href}" class="${n.key === active ? 'active' : ''}">${n.icon} ${n.label}</a>`).join('')}
          <a href="/api/logout" class="nav-logout">🚪 Log out</a>
        </nav>
      </aside>
      <div class="account-main">${inner}</div>
    </div>
    <input type="file" id="avatarFileInput" accept="image/*" style="display:none;" onchange="uploadAvatar(this)">
    <script>
    async function uploadAvatar(input) {
      const file = input.files && input.files[0]; if (!file) return;
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch('/api/account/avatar', { method: 'POST', body: fd });
      const d = await r.json();
      if (d.error) { alert(d.error); return; }
      location.reload();
    }
    function toggleMore(id, btn) {
      const el = document.getElementById(id);
      if (!el) return;
      const hidden = el.style.display === 'none';
      el.style.display = hidden ? '' : 'none';
      btn.textContent = hidden ? 'Collapse' : (btn.getAttribute('data-label') || 'View more');
    }
    async function resendVerify() {
      const btn = document.querySelector('.u-resend-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      try {
        const r = await fetch('/api/account/resend-verification', { method: 'POST' });
        const d = await r.json();
        if (d.error) { alert(d.error || 'Failed to send'); }
        else if (d.already_verified) { alert('Email already verified.'); location.reload(); }
        else { alert('Verification email resent. Please check your inbox (and spam folder).'); }
      } catch (e) {
        alert('Failed to send. Please try again later.');
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Resend email'; }
    }
    </script>`;
}

export function renderAccountOverview(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  user: AccountUser;
  planLabels?: Record<string, string>;
  orders: {
    order_no: string;
    plan: string;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
    created_at: string;
    paid_at: string | null;
  }[];
}): string {
  const u = opts.user;
  const planLabels = opts.planLabels || PLAN_LABEL;
  const tierLabel = planLabels[u.membership_tier] || u.membership_tier || 'Not subscribed';
  const membershipCard = u.active
    ? `<div class="stat-card"><div class="label">Current plan</div><div class="num" style="font-size:1.3rem;">${esc(tierLabel)}</div><div class="label">Expires: ${esc(u.membership_expires_at ? formatDate(u.membership_expires_at) : 'Never')}</div></div>`
    : `<div class="stat-card"><div class="label">Current plan</div><div class="num" style="font-size:1.3rem;">Not subscribed</div><a class="btn-primary" href="/vip" style="margin-top:8px;">Subscribe →</a></div>`;

  const orderRowArray = opts.orders.map(
    (o) => `<tr>
      <td>${esc(o.order_no)}</td>
      <td>${esc(planLabels[o.plan] || o.plan)}</td>
      <td>${o.amount} ${esc(o.currency)}</td>
      <td>${esc(o.payment_method || '-')}</td>
      <td>${o.status === 'paid' ? '✅ Paid' : esc(o.status)}</td>
      <td>${(o.created_at || '').slice(0, 16)}</td>
    </tr>`
  );
  const firstOrderRows = orderRowArray.slice(0, 5).join('');
  const restOrderRows = orderRowArray.slice(5).join('');
  const hasMoreOrders = opts.orders.length > 5;
  const orderTable = opts.orders.length
    ? `<div class="table-scroll"><table class="table"><thead><tr><th>Order no.</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead>
        <tbody>${firstOrderRows}</tbody>
        ${restOrderRows ? `<tbody id="more-orders" style="display:none;">${restOrderRows}</tbody>` : ''}
      </table></div>`
    : '<div class="table-scroll"><table class="table"><thead><tr><th>Order no.</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead><tbody><tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No orders</td></tr></tbody></table></div>';

  const inner = `
    <h1 class="account-title">Overview</h1>
    <div class="stat-grid">
      ${membershipCard}
      <div class="stat-card"><div class="label">Account</div><div class="num" style="font-size:1rem;">${esc(u.email)}</div><div class="label">${u.email_verified ? '✅ Email verified' : '❌ Unverified'}</div></div>
      <div class="stat-card"><div class="label">My orders</div><div class="num">${opts.orders.length}</div></div>
    </div>
    <div class="section-title-row">
      <h2 class="section-title">My orders</h2>
      ${hasMoreOrders ? `<button class="btn-ghost load-more-inline" type="button" data-label="View more (${opts.orders.length - 5})" onclick="toggleMore('more-orders', this)">View more</button>` : ''}
    </div>
    ${orderTable}`;

  return accountShell(u, 'overview', inner);
}

function gridWithMore(title: string, renderedItems: string[], total: number, emptyText: string, moreId: string, limit = 3): string {
  if (!total) return `<h2 class="section-title">${title}</h2><p class="empty">${emptyText}</p>`;
  const first = renderedItems.slice(0, limit).join('');
  const rest = renderedItems.slice(limit).join('');
  const moreBtn = total > limit
    ? `<button class="btn-ghost load-more" type="button" data-label="View more (${total - limit})" onclick="toggleMore('${moreId}', this)">View more (${total - limit})</button>`
    : '';
  return `<h2 class="section-title">${title}</h2>
    <div class="grid">${first}</div>
    ${rest ? `<div class="grid" id="${moreId}" style="display:none;">${rest}</div>` : ''}
    ${moreBtn}`;
}

export function renderAccountPurchased(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  user: AccountUser;
  purchasedCourses: { course_id: number; amount: number; created_at: string; title: string; cover_image: string }[];
  purchasedProducts: { product_id: number; total_amount: number; created_at: string; status: string; tracking_no: string; tracking_company: string; name: string; cover: string; type: string }[];
  purchasedArticles: { article_id: number; amount: number; created_at: string; title: string }[];
}): string {
  const u = opts.user;
  const courseItems = opts.purchasedCourses.map((c) => {
    const cover = c.cover_image ? `<img src="${esc(c.cover_image)}" class="grid-cover">` : `<div class="grid-cover grid-cover-ph">🎓</div>`;
    return `<a class="grid-card" href="/course/${c.course_id}">${cover}<div class="grid-body"><h3>${esc(c.title)}</h3><div class="grid-meta">Courses · ${(c.created_at || '').slice(0, 10)}</div><div class="grid-price">✅ Purchased</div></div></a>`;
  });
  const courseSection = gridWithMore('Purchased courses', courseItems, opts.purchasedCourses.length, 'No purchased courses', 'more-courses');

  const statusLabel: Record<string, string> = { paid: '✅ Paid', shipped: '🚚 Shipped', completed: '📦 Completed' };
  const productItems = opts.purchasedProducts.map((p) => {
    const cover = p.cover ? `<img src="${esc(p.cover)}" class="grid-cover">` : `<div class="grid-cover grid-cover-ph">🛍</div>`;
    const download = p.type === 'virtual' ? `<a class="btn-primary" style="margin-top:6px;font-size:.85rem;" href="/api/product/${p.product_id}/download">⬇️ Download</a>` : '';
    const tracking = p.tracking_no ? `<div class="grid-meta">Tracking: ${esc(p.tracking_company || '')} ${esc(p.tracking_no)}</div>` : '';
    return `<div class="grid-card"><div>${cover}</div><div class="grid-body"><h3>${esc(p.name)}</h3><div class="grid-meta">${p.type === 'virtual' ? 'Virtual' : 'Physical'} · ${statusLabel[p.status] || p.status} · ${(p.created_at || '').slice(0, 10)}</div>${tracking}${download}</div></div>`;
  });
  const productSection = gridWithMore('Purchased products', productItems, opts.purchasedProducts.length, 'No purchased products', 'more-products');

  const articleItems = opts.purchasedArticles.map((a) => `<a class="grid-card" href="/article/${a.article_id}"><div class="grid-cover grid-cover-ph">📄</div><div class="grid-body"><h3>${esc(a.title)}</h3><div class="grid-meta">Articles · ${(a.created_at || '').slice(0, 10)}</div><div class="grid-price">✅ Purchased</div></div></a>`);
  const articleSection = gridWithMore('Purchased articles', articleItems, opts.purchasedArticles.length, 'No purchased articles', 'more-articles');

  const inner = `
    <h1 class="account-title">Purchased orders</h1>
    ${courseSection}
    ${productSection}
    ${articleSection}
    <div class="vip-upsell">
      <div class="vip-upsell-left">
        <div class="vip-upsell-icon">👑</div>
        <div>
          <h2>Subscribe to unlock all video courses, articles and virtual products</h2>
          <p>One subscription — access and download all paid content</p>
        </div>
      </div>
      <a class="btn-primary" href="/vip" target="_blank" rel="noopener noreferrer">Subscribe now →</a>
    </div>`;

  return accountShell(u, 'purchased', inner);
}

export function renderAccountAddresses(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  user: AccountUser;
  addresses: { id: number; name: string; phone: string; country: string; province: string; city: string; detail: string; zip: string; is_default: number }[];
}): string {
  const u = opts.user;
  const list = opts.addresses.length
    ? opts.addresses
        .map(
          (a) => `<div class="addr-card">
            <div class="addr-main">
              <div class="addr-line1"><strong>${esc(a.name)}</strong> ${esc(a.phone)} ${a.is_default ? '<span class="badge badge-public">Default</span>' : ''}</div>
              <div class="addr-line2">${esc([a.country, a.province, a.city, a.detail].filter(Boolean).join(' '))}${a.zip ? ' · ' + esc(a.zip) : ''}</div>
            </div>
            <div class="addr-actions">
              ${!a.is_default ? `<a href="#" onclick="setDefaultAddr(${a.id});return false;">Default</a> · ` : ''}<a href="#" onclick="editAddr(${a.id});return false;">Edit</a> · <a href="#" style="color:var(--danger);" onclick="delAddr(${a.id});return false;">Delete</a>
            </div>
          </div>`
        )
        .join('')
    : '<p class="empty">No shipping address yet, add one for fast checkout</p>';

  const inner = `
    <h1 class="account-title">Shipping address</h1>
    <div class="addr-list">${list}</div>
    <h2 class="section-title">${opts.addresses.length ? 'Add address' : 'Add address'}</h2>
    <div class="addr-form">
      <input id="af_name" placeholder="Recipient name"><input id="af_phone" placeholder="Phone"><input id="af_detail" placeholder="Detailed address">
      <input id="af_province" placeholder="State/Province (optional)"><input id="af_city" placeholder="City (optional)"><input id="af_country" placeholder="Country(optional)"><input id="af_zip" placeholder="Postal code(optional)">
      <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="af_default"> Set as default</label>
      <button class="btn-primary" onclick="saveAddr()">Save address</button>
      <span id="af_editId" style="color:var(--text-muted);font-size:.85rem;"></span>
    </div>
    <script>
    var $ = function(id){ return document.getElementById(id); };
    var _editAddrId = null;
    function setDefaultAddr(id) { fetch('/api/account/addresses/' + id + '/default', { method: 'PUT' }).then(function(){ location.reload(); }); }
    function editAddr(id) {
      _editAddrId = id;
      fetch('/api/account/addresses').then(function(r){ return r.json(); }).then(function(d){
        var a = (d.addresses || []).find(function(x){ return x.id === id; });
        if (!a) return;
        $('af_name').value = a.name; $('af_phone').value = a.phone; $('af_detail').value = a.detail;
        $('af_province').value = a.province; $('af_city').value = a.city; $('af_country').value = a.country; $('af_zip').value = a.zip;
        $('af_default').checked = !!a.is_default;
        $('af_editId').textContent = 'Edit address #' + id;
      });
    }
    async function saveAddr() {
      var body = {
        name: $('af_name').value.trim(), phone: $('af_phone').value.trim(), detail: $('af_detail').value.trim(),
        province: $('af_province').value.trim(), city: $('af_city').value.trim(), country: $('af_country').value.trim(), zip: $('af_zip').value.trim(),
        is_default: $('af_default').checked ? 1 : 0,
      };
      if (!body.name || !body.phone || !body.detail) { alert('Please fill in recipient, phone and address'); return; }
      var r;
      if (_editAddrId) r = await fetch('/api/account/addresses/' + _editAddrId, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      else r = await fetch('/api/account/addresses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      var d = await r.json();
      if (d.error) { alert(d.error); return; }
      location.reload();
    }
    async function delAddr(id) {
      if (!confirm('Delete this address??')) return;
      await fetch('/api/account/addresses/' + id, { method: 'DELETE' });
      location.reload();
    }
    </script>`;

  return accountShell(u, 'addresses', inner);
}

export function renderAccountInvite(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  user: AccountUser;
  commissionRate: string;
  earned: string;
  paid: string;
  pending: string;
  available: string;
  invited: { email: string; name: string; created_at: string }[];
  withdrawals: { id: number; amount: string; method: string; account: string; status: string; reject_reason: string; created_at: string }[];
}): string {
  const u = opts.user;
  const inviteUrl = `${SITE_URL}/?ref=${u.invite_code}`;
  const methodLabel: Record<string, string> = { wechat: 'WeChat', alipay: 'Alipay', usdt: 'USDT (BSC)' };

  const invitedRows = opts.invited.map((i) => `<tr><td>${esc(i.email)}</td><td>${(i.created_at || '').slice(0, 16)}</td></tr>`);
  const invitedBlock = opts.invited.length
    ? `<table class="table"><thead><tr><th>Invitee</th><th>Registered</th></tr></thead>
        <tbody>${invitedRows.slice(0, 3).join('')}</tbody>
        ${invitedRows.length > 3 ? `<tbody id="more-invited" style="display:none;">${invitedRows.slice(3).join('')}</tbody>` : ''}
      </table>
      ${invitedRows.length > 3 ? `<button class="btn-ghost load-more" type="button" data-label="View more (${invitedRows.length - 3})" onclick="toggleMore('more-invited', this)">View more (${invitedRows.length - 3})</button>` : ''}`
    : '<p class="empty">No invites yet — share your link!</p>';

  const withdrawalRows = opts.withdrawals.length
    ? opts.withdrawals
        .map((w) => {
          const statusBadge =
            w.status === 'pending'
              ? '<span class="badge" style="background:rgba(232,185,35,.15);color:var(--gold);">Pending</span>'
              : w.status === 'paid'
                ? '<span class="badge" style="background:rgba(78,205,196,.15);color:var(--teal);">Processed</span>'
                : '<span class="badge" style="background:rgba(255,107,107,.15);color:#ff6b6b;">Rejected</span>';
          const reason = w.status === 'rejected' && w.reject_reason ? `<div style="font-size:.8rem;color:#ff6b6b;">Reason: ${esc(w.reject_reason)}</div>` : '';
          return `<tr>
            <td>${w.amount}</td>
            <td>${esc(methodLabel[w.method] || w.method)}</td>
            <td>${esc(w.account)}</td>
            <td>${statusBadge}${reason}</td>
            <td>${(w.created_at || '').slice(0, 16)}</td>
          </tr>`;
        })
        .join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No withdrawal records</td></tr>';

  const inner = `
    <h1 class="account-title">Referral program</h1>

    <div class="card invite-hero">
      <h2>🎁 Invite friends, earn ${esc(opts.commissionRate)}% Commission</h2>
      <p>Share your unique invite link. When a friend registers and buys a membership, you earn <strong>${esc(opts.commissionRate)}%</strong> as commission.</p>
      <p class="invite-cookie-note">🔍 <strong>Cookie tracking: </strong>When a friend clicks your invite link, the system records the referral via a Cookie (valid for 30 days).<strong>Even if they don't register immediately, as long as they complete registration in the same browser within 30 days, it will still count toward your invitation.</strong></p>
    </div>

    <div class="stat-grid" style="margin-top:16px;">
      <div class="stat-card"><div class="label">Total commission</div><div class="num">${esc(opts.earned)}</div><div class="label">USD</div></div>
      <div class="stat-card"><div class="label">Withdrawable balance</div><div class="num" style="color:var(--gold);">${esc(opts.available)}</div><div class="label">USD</div></div>
      <div class="stat-card"><div class="label">Pending</div><div class="num">${esc(opts.pending)}</div><div class="label">USD</div></div>
      <div class="stat-card"><div class="label">Withdrawn</div><div class="num">${esc(opts.paid)}</div><div class="label">USD</div></div>
    </div>

    <h2 class="section-title">My invites</h2>
    <div class="card invite-box">
      <p>My invite code: <strong class="invite-code">${esc(u.invite_code)}</strong> · invited <strong>${opts.invited.length}</strong> people</p>
      <p>Invite link: </p>
      <div class="invite-row">
        <input type="text" value="${esc(inviteUrl)}" readonly onclick="this.select()" class="invite-input">
        <button class="btn-ghost" onclick="copyInvite(this)">Copy link</button>
      </div>
    </div>
    ${invitedBlock}

    <h2 class="section-title">Payout account</h2>
    <div class="card">
      <p class="account-sub">Bind a payout account for withdrawals. Supports WeChat, Alipay & USDT (BSC).</p>
      <div class="form-grid">
        <div class="form-group"><label>Payee name</label><input id="w_name" value="${esc(u.withdraw_name || '')}" placeholder="Real name"></div>
        <div class="form-group"><label>WeChat account</label><input id="w_wechat" value="${esc(u.withdraw_wechat || '')}" placeholder="WeChat ID / WeChat account for the QR code"></div>
        <div class="form-group"><label>Alipay account</label><input id="w_alipay" value="${esc(u.withdraw_alipay || '')}" placeholder="Alipay account / Phone"></div>
        <div class="form-group"><label>USDT (BSC) address</label><input id="w_usdt" value="${esc(u.withdraw_usdt || '')}" placeholder="0x... BEP-20 wallet address"></div>
      </div>
      <button class="btn-primary" onclick="saveAccounts(this)">Save account</button>
    </div>

    <h2 class="section-title">Request withdrawal</h2>
    <div class="card">
      <p class="account-sub">Withdrawable balance: <strong style="color:var(--gold);">${esc(opts.available)} USD</strong></p>
      <div class="withdraw-row">
        <input id="wd_amount" type="number" min="1" step="0.01" placeholder="Withdrawal amount (USD)" style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);">
        <select id="wd_method" style="padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-soft);color:var(--text);">
          <option value="wechat">WeChat</option>
          <option value="alipay">Alipay</option>
          <option value="usdt">USDT (BSC)</option>
        </select>
        <button class="btn-primary" onclick="submitWithdraw(this)">Submit withdrawal</button>
      </div>
    </div>

    <h2 class="section-title">Withdrawal records</h2>
    <table class="table"><thead><tr><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Time</th></tr></thead><tbody>${withdrawalRows}</tbody></table>

    <script>
    function copyInvite(btn) {
      var input = btn.parentElement.querySelector('.invite-input');
      navigator.clipboard && navigator.clipboard.writeText(input.value).then(function() {
        btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = 'Copy link'; }, 1500);
      });
    }
    async function saveAccounts(btn) {
      btn.disabled = true;
      var body = { withdraw_name: $('w_name').value, withdraw_wechat: $('w_wechat').value, withdraw_alipay: $('w_alipay').value, withdraw_usdt: $('w_usdt').value };
      var r = await fetch('/api/account/withdraw-accounts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      var d = await r.json();
      btn.disabled = false;
      toastMsg(d.ok ? 'Account saved' : (d.error || 'Save failed'));
    }
    async function submitWithdraw(btn) {
      var amount = $('wd_amount').value;
      if (!amount || parseFloat(amount) <= 0) { toastMsg('Enter a valid withdrawal amount'); return; }
      btn.disabled = true;
      var r = await fetch('/api/withdraw', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ amount: amount, method: $('wd_method').value }) });
      var d = await r.json();
      btn.disabled = false;
      if (d.ok) { toastMsg('Withdrawal submitted'); setTimeout(function(){ location.reload(); }, 1200); }
      else toastMsg(d.error || 'Withdrawal failed');
    }
    function toastMsg(msg) { alert(msg); }
    </script>`;

  return accountShell(u, 'invite', inner);
}

export function renderAccountPassword(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  user: AccountUser;
}): string {
  const u = opts.user;
  const inner = `
    <h1 class="account-title">Change password</h1>
    <div class="card" style="max-width:480px;">
      <p class="account-sub">Password changes require email verification.</p>
      <div class="form-group"><label>Current password</label><input type="password" id="cp_old" placeholder="Enter current password"></div>
      <div class="form-group"><label>New password</label><input type="password" id="cp_new" placeholder="at least 6 characters"></div>
      <div class="form-group"><label>Confirm new password</label><input type="password" id="cp_new2" placeholder="Re-enter new password"></div>
      <div class="form-error" id="cp_err"></div>
      <button class="btn-primary" onclick="submitChangePassword()">Send verification email</button>
    </div>
    <script>
    async function submitChangePassword() {
      var oldP = document.getElementById('cp_old').value;
      var newP = document.getElementById('cp_new').value;
      var newP2 = document.getElementById('cp_new2').value;
      var err = document.getElementById('cp_err');
      err.textContent = ''; err.style.color = '';
      if (!oldP || !newP) { err.textContent = 'Enter current and new password'; return; }
      if (newP.length < 6) { err.textContent = 'New password at least 6 characters'; return; }
      if (newP !== newP2) { err.textContent = 'New passwords do not match'; return; }
      var r = await fetch('/api/change-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ old_password: oldP, new_password: newP }) });
      var d = await r.json();
      if (d.ok) { err.style.color = 'var(--teal)'; err.textContent = d.message || 'Verification email sent'; }
      else err.textContent = d.error || 'Update failed';
    }
    </script>`;
  return accountShell(u, 'password', inner);
}

export function renderResetPassword(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  token: string;
  valid: boolean;
  isConfirm: boolean;
  navMenu?: NavMenuItem[];
}): string {
  const body = opts.valid
    ? (opts.isConfirm
      ? `<p style="text-align:center;color:var(--text-muted);margin-bottom:16px;">Click below to confirm password change.</p>
         <button class="btn-primary" style="width:100%;" onclick="confirmReset()">Confirm password change</button>`
      : `<div class="form-group"><label>New password</label><input type="password" id="rp_password" placeholder="at least 6 characters"></div>
         <div class="form-group"><label>Confirm new password</label><input type="password" id="rp_password2" placeholder="Re-enter"></div>
         <button class="btn-primary" style="width:100%;" onclick="submitReset()">Reset password</button>`)
    : `<p style="text-align:center;color:var(--danger);margin-bottom:16px;">Link invalid or expired. Please start over.</p>
       <a class="btn-ghost" href="/login" style="display:block;text-align:center;">Back to login</a>`;
  const inner = `
    <div class="card form-card">
      <h1 style="margin-bottom:20px;text-align:center;">${opts.isConfirm ? 'Confirm password change' : 'Reset password'}</h1>
      ${body}
      <div class="form-error" id="rp_err"></div>
    </div>
    <script>
    var TOKEN = ${JSON.stringify(opts.token)};
    async function submitReset() {
      var p = document.getElementById('rp_password').value;
      var p2 = document.getElementById('rp_password2').value;
      var err = document.getElementById('rp_err');
      err.textContent = ''; err.style.color = '';
      if (p.length < 6) { err.textContent = 'New password at least 6 characters'; return; }
      if (p !== p2) { err.textContent = 'Entries do not match'; return; }
      var r = await fetch('/api/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: TOKEN, password: p }) });
      var d = await r.json();
      if (d.ok) { err.style.color = 'var(--teal)'; err.textContent = d.message + ', Redirecting...'; setTimeout(function(){ location.href = '/login'; }, 1500); }
      else err.textContent = d.error || 'Reset failed';
    }
    async function confirmReset() {
      var err = document.getElementById('rp_err');
      err.textContent = ''; err.style.color = '';
      var r = await fetch('/api/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: TOKEN, password: '' }) });
      var d = await r.json();
      if (d.ok) { err.style.color = 'var(--teal)'; err.textContent = d.message + ', Redirecting...'; setTimeout(function(){ location.href = '/login'; }, 1500); }
      else err.textContent = d.error || 'Operation failed';
    }
    </script>`;
  return layout({ ...opts, title: opts.isConfirm ? 'Confirm password change' : 'Reset password', content: inner, showHero: false });
}

export function renderLogin(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const inner = `
    <div class="card form-card">
      <h1 style="margin-bottom:20px;text-align:center;">Log in</h1>
      <div class="form-group"><label>Email</label><input type="email" id="email" placeholder="you@example.com"></div>
      <div class="form-group"><label>Password</label><input type="password" id="password" placeholder="Enter password"></div>
      <div class="form-error" id="err"></div>
      <button class="btn-primary" style="width:100%;" id="submit">Log in</button>
      <p style="margin-top:14px;text-align:center;font-size:.88rem;color:var(--text-muted);">
        <a href="#" id="forgotLink">Forgot password?</a>
        <span style="margin:0 8px;">·</span>
        No account yet?<a href="/register">Sign up</a>
      </p>
    </div>
    <script>
    const plan = new URLSearchParams(location.search).get('plan') || '';
    document.getElementById('submit').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const err = document.getElementById('err');
      err.textContent = '';
      if (!email || !password) { err.textContent = 'Enter email and password'; return; }
      const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await r.json();
      if (!r.ok) { err.textContent = d.error || 'Login failed'; return; }
      location.href = plan ? '/pricing?plan=' + plan : '/';
    });
    document.getElementById('forgotLink').addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const err = document.getElementById('err');
      if (!email) { err.textContent = 'Enter your email above first, then click「Forgot password」'; return; }
      err.textContent = ''; err.style.color = '';
      const r = await fetch('/api/forgot-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
      const d = await r.json();
      err.style.color = 'var(--teal)';
      err.textContent = d.message || 'Reset email sent';
    });
    </script>`;
  return layout({ ...opts, title: 'Log in', content: inner, showHero: false });
}

export function renderRegister(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const inner = `
    <div class="card form-card">
      <h1 style="margin-bottom:20px;text-align:center;">Sign up</h1>
      <div class="form-group"><label>Email</label><input type="email" id="email" placeholder="you@example.com"></div>
      <div class="form-group"><label>Nickname (optional)</label><input type="text" id="name" placeholder="Your nickname"></div>
      <div class="form-group"><label>Password (at least 8 characters)</label><input type="password" id="password" placeholder="Enter password"></div>
      <div class="form-error" id="err"></div>
      <button class="btn-primary" style="width:100%;" id="submit">Sign up</button>
      <p style="margin-top:14px;text-align:center;font-size:.88rem;color:var(--text-muted);">Already have an account?<a href="/login">Log in</a></p>
    </div>
    <script>
    function escHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    document.getElementById('submit').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim();
      const name = document.getElementById('name').value.trim();
      const password = document.getElementById('password').value;
      const err = document.getElementById('err');
      err.textContent = '';
      if (!email || password.length < 8) { err.textContent = 'Enter a valid email, password at least 8 characters'; return; }
      const r = await fetch('/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, name, password }) });
      const d = await r.json();
      if (!r.ok) { err.textContent = d.error || 'Registration failed'; return; }
      var card = document.querySelector('.card.form-card');
      if (card) {
        card.innerHTML = '<div style="text-align:center;padding:18px 6px;">'
          + '<div style="font-size:2.4rem;margin-bottom:10px;">📬</div>'
          + '<h2 style="margin:0 0 12px;">Registration successful!</h2>'
          + '<p style="color:var(--text-muted);line-height:1.7;margin:0 0 6px;">Please check your inbox to verify your email address:</p>'
          + '<p style="font-weight:600;margin:0 0 14px;">' + escHtml(email) + '</p>'
          + '<p style="color:var(--text-muted);font-size:.85rem;line-height:1.6;">We\'ve sent a verification email. Click the link in the email to complete verification.<br>If you don\'t see it, check your spam folder.</p>'
          + '<button class="btn-primary" style="margin-top:16px;width:100%;" onclick="location.href=\'/\'">Back to home</button>'
          + '</div>';
      } else {
        location.href = '/?welcome=1';
      }
    });
    </script>`;
  return layout({ ...opts, title: 'Sign up', content: inner, showHero: false });
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

const LIB_ICON_MAP: Record<string, string> = {
  pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗', ppt: '📙', pptx: '📙',
  zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦', bz2: '📦',
  mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', m4a: '🎵', ogg: '🎵',
  mp4: '🎬', webm: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬',
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️', ico: '🖼️', bmp: '🖼️',
  txt: '📄', md: '📄', json: '📄', csv: '📊', apk: '📱', exe: '💿', dmg: '💿', default: '📁',
};

function libExtIcon(ext: string): string {
  const e = (ext || '').toLowerCase();
  return LIB_ICON_MAP[e] || LIB_ICON_MAP.default;
}

function libFormatBytes(n: number): string {
  if (!n || n <= 0) return '';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
}

function renderLibPager(page: number, totalPages: number): string {
  if (totalPages <= 1) return '';
  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  return `<button class="page-btn" data-page="prev"${page <= 1 ? ' disabled' : ''}>‹ Prev</button>` +
    pages.map((p) => (p === '...' ? '<span class="page-dots">…</span>' : `<button class="page-btn${p === page ? ' active' : ''}" data-page="${p}">${p}</button>`)).join('') +
    `<button class="page-btn" data-page="next"${page >= totalPages ? ' disabled' : ''}>Next ›</button>`;
}

export function renderLibrary(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  categories: { id: number; name: string }[];
  files: any[];
  total: number;
  page: number;
  totalPages: number;
  activeCategory: number | null;
  q: string;
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const catButtons =
    `<button class="lib-cat${opts.activeCategory === null ? ' active' : ''}" data-cat="">All</button>` +
    opts.categories
      .map((c) => `<button class="lib-cat${opts.activeCategory === c.id ? ' active' : ''}" data-cat="${c.id}">${esc(c.name)}</button>`)
      .join('');
  const cards = opts.files
    .map((f) => {
      const icon = f.icon || libExtIcon(f.ext);
      const meta = [f.ext ? esc(String(f.ext).toUpperCase()) : '', libFormatBytes(f.file_size)].filter(Boolean).join(' · ');
      const iconHtml = icon.startsWith('http') || icon.startsWith('/') ? `<img src="${esc(icon)}" alt="" loading="lazy">` : `<span>${esc(icon)}</span>`;
      return `<a class="library-card" href="${esc(f.file_url)}" target="_blank" rel="noopener noreferrer" title="${esc(f.filename)}">
      <div class="lib-icon">${iconHtml}</div>
      <div class="lib-name">${esc(f.filename)}</div>
      <div class="lib-meta">${meta}</div>
    </a>`;
    })
    .join('');
  const gridHtml = cards || '<p class="empty">No files yet</p>';
  return `
    <h1 class="page-title">Library</h1>
    <div class="lib-toolbar">
      <div class="lib-cats-box" id="libCatsBox">
        <div class="lib-cats" id="libCats">${catButtons}</div>
        <button type="button" class="lib-cat-toggle" id="libCatToggle" style="display:none;" onclick="toggleLibCatTabs(this)" aria-label="More categories">›</button>
      </div>
      <div class="lib-search">
        <input id="libSearchInput" type="text" placeholder="Search files..." value="${esc(opts.q)}" autocomplete="off">
        <button id="libSearchBtn" class="btn-primary">Search</button>
      </div>
    </div>
    <div class="library-grid" id="libraryGrid">${gridHtml}</div>
    <div class="pagination" id="libraryPager">${renderLibPager(opts.page, opts.totalPages)}</div>
    <script>
    function toggleLibCatTabs(btn) {
      var box = btn.parentElement;
      var expanded = box.classList.toggle('expanded');
      btn.textContent = expanded ? '‹' : '›';
      btn.setAttribute('aria-label', expanded ? 'Collapse' : 'More categories');
    }
    function initLibCatTabs() {
      var box = document.getElementById('libCatsBox');
      var cats = document.getElementById('libCats');
      var btn = document.getElementById('libCatToggle');
      if (!box || !cats || !btn) return;
      if (cats.scrollWidth > cats.clientWidth + 2) {
        box.classList.add('has-more');
        btn.style.display = '';
      }
    }
    (function(){
      var curCat = ${opts.activeCategory === null ? 'null' : opts.activeCategory};
      var curQ = ${JSON.stringify(opts.q || '')};
      var curPage = ${opts.page || 1};
      var totalPages = ${opts.totalPages || 1};
      var grid = document.getElementById('libraryGrid');
      var pager = document.getElementById('libraryPager');
      var ICONS = ${JSON.stringify(LIB_ICON_MAP)};
      function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
      function fmt(n){ if(!n||n<=0) return ''; if(n<1024) return n+' B'; if(n<1048576) return (n/1024).toFixed(1)+' KB'; if(n<1073741824) return (n/1048576).toFixed(1)+' MB'; return (n/1073741824).toFixed(1)+' GB'; }
      function iconHtml(icon, ext){ if(icon && (icon.indexOf('http')===0 || icon.indexOf('/')===0)) return '<img src="'+esc(icon)+'" alt="" loading="lazy">'; var i = icon || ICONS[(ext||'').toLowerCase()] || ICONS.default || '📁'; return '<span>'+esc(i)+'</span>'; }
      function load(){
        var params = new URLSearchParams({ page: String(curPage), page_size: '20' });
        if (curCat) params.set('category', String(curCat));
        if (curQ) params.set('q', curQ);
        fetch('/api/library/files?' + params.toString()).then(function(r){ return r.json(); }).then(function(d){
          renderCards(d.files || []);
          renderPager(d.total_pages || 1);
        }).catch(function(){ grid.innerHTML = '<p class="empty">Failed to load</p>'; });
      }
      function renderCards(files){
        if (!files.length) { grid.innerHTML = '<p class="empty">No files found</p>'; return; }
        grid.innerHTML = files.map(function(f){
          var meta = [f.ext ? esc(String(f.ext).toUpperCase()) : '', fmt(f.file_size)].filter(Boolean).join(' · ');
          return '<a class="library-card" href="'+esc(f.file_url)+'" target="_blank" rel="noopener noreferrer" title="'+esc(f.filename)+'">' +
            '<div class="lib-icon">'+iconHtml(f.icon, f.ext)+'</div>' +
            '<div class="lib-name">'+esc(f.filename)+'</div>' +
            '<div class="lib-meta">'+meta+'</div></a>';
        }).join('');
      }
      function renderPager(tp){
        totalPages = tp;
        if (tp <= 1) { pager.innerHTML = ''; return; }
        var pages = [];
        for (var i = 1; i <= tp; i++) {
          if (i === 1 || i === tp || Math.abs(i - curPage) <= 1) pages.push(i);
          else if (pages[pages.length - 1] !== '...') pages.push('...');
        }
        pager.innerHTML = '<button class="page-btn" data-page="prev"' + (curPage <= 1 ? ' disabled' : '') + '>‹ Prev</button>' +
          pages.map(function(p){ return p === '...' ? '<span class="page-dots">…</span>' : '<button class="page-btn' + (p === curPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>'; }).join('') +
          '<button class="page-btn" data-page="next"' + (curPage >= tp ? ' disabled' : '') + '>Next ›</button>';
      }
      pager.addEventListener('click', function(e){
        var btn = e.target.closest ? e.target.closest('button[data-page]') : null;
        if (!btn || btn.disabled) return;
        var p = btn.getAttribute('data-page');
        if (p === 'prev') { if (curPage > 1) curPage--; }
        else if (p === 'next') { if (curPage < totalPages) curPage++; }
        else { curPage = parseInt(p, 10) || 1; }
        load();
        var top = grid.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
      document.querySelectorAll('.lib-cat').forEach(function(b){
        b.addEventListener('click', function(){
          var v = b.getAttribute('data-cat');
          curCat = v ? parseInt(v, 10) : null;
          curPage = 1;
          document.querySelectorAll('.lib-cat').forEach(function(x){ x.classList.remove('active'); });
          b.classList.add('active');
          load();
        });
      });
      var si = document.getElementById('libSearchInput');
      var sb = document.getElementById('libSearchBtn');
      function doSearch(){ curQ = si.value.trim(); curPage = 1; load(); }
      if (sb) sb.addEventListener('click', doSearch);
      if (si) si.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); doSearch(); } });
      initLibCatTabs();
    })();
    </script>`;
}

export function renderPayOptions(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  return `
    <h1 class="page-title">Pay Options</h1>
    <div class="lib-toolbar">
      <div class="lib-search">
        <input id="paySearchInput" type="text" placeholder="Search payment methods..." autocomplete="off">
        <button id="paySearchBtn" class="btn-primary">Search</button>
      </div>
    </div>
    <div class="pay-grid" id="payGrid"></div>
    <div class="pay-modal-overlay" id="payModal" style="display:none;" onclick="if(event.target===this)closePayModal()">
      <div class="pay-modal">
        <button class="pay-modal-close" onclick="closePayModal()" aria-label="Close">×</button>
        <div id="payModalBody"></div>
      </div>
    </div>
    <script>
    function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    var payAll = [];
    var __libCs = ${JSON.stringify(opts.cs || {})};
    function loadPayOptions(){
      fetch('/api/pay-options').then(function(r){ return r.json(); }).then(function(d){
        payAll = d.payOptions || [];
        renderPayGrid(payAll);
      }).catch(function(){ var g = document.getElementById('payGrid'); if (g) g.innerHTML = '<p class="empty">Failed to load</p>'; });
    }
    function renderPayGrid(list){
      var grid = document.getElementById('payGrid');
      if (!grid) return;
      if (!list.length) { grid.innerHTML = '<p class="empty">No payment methods yet</p>'; return; }
      grid.innerHTML = list.map(function(p){
        var iconHtml = p.icon ? '<img src="'+esc(p.icon)+'" alt="" loading="lazy">' : '<span class="pay-noicon">💳</span>';
        return '<button type="button" class="pay-card" onclick="openPayModal(' + p.id + ')">' +
          '<div class="pay-card-icon">'+iconHtml+'</div>' +
          '<div class="pay-card-name">'+esc(p.name)+'</div></button>';
      }).join('');
    }
    function openPayModal(id){
      var p = payAll.find(function(x){ return x.id === id; });
      if (!p) return;
      var body = document.getElementById('payModalBody');
      if (!body) return;
      var iconHtml = p.icon ? '<img class="pay-m-icon" src="'+esc(p.icon)+'" alt="">' : '<span class="pay-m-icon pay-noicon">💳</span>';
      var details = '';
      if (p.qr_code) details += '<div class="pay-detail-qr"><img src="'+esc(p.qr_code)+'" alt="QR code" loading="lazy"></div>';
      if (p.account_info) details += '<div class="pay-detail-account">'+String(p.account_info).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>')+'</div>';
      if (p.link_url) details += '<a class="pay-detail-link" href="'+esc(p.link_url)+'" target="_blank" rel="noopener noreferrer">Pay Now →</a>';
      var cs = __libCs || {};
      var csHtml = '';
      if (cs.chat_url) csHtml += '<a class="pay-cs-btn" href="'+esc(cs.chat_url)+'" target="_blank" rel="noopener noreferrer">💬 Contact Live Chat</a>';
      body.innerHTML =
        '<div class="pay-m-head">'+iconHtml+'<div class="pay-m-name">'+esc(p.name)+'</div></div>' +
        '<div class="pay-m-details">'+(details || '<p class="empty">Contact customer service for payment details</p>')+'</div>' +
        '<div class="pay-m-note">⚠️ After payment, please contact customer service to confirm your order.</div>' +
        csHtml;
      document.getElementById('payModal').style.display = 'flex';
    }
    function closePayModal(){ var m = document.getElementById('payModal'); if (m) m.style.display = 'none'; }
    function paySearch(){
      var q = document.getElementById('paySearchInput').value.trim().toLowerCase();
      renderPayGrid(q ? payAll.filter(function(p){ return (p.name||'').toLowerCase().indexOf(q) >= 0; }) : payAll);
    }
    (function(){
      loadPayOptions();
      var psi = document.getElementById('paySearchInput');
      var psb = document.getElementById('paySearchBtn');
      if (psb) psb.addEventListener('click', paySearch);
      if (psi) psi.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); paySearch(); } });
    })();
    </script>`;
}

export function renderAbout(opts: {
  siteName: string;
  tagline: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  social?: SocialLinks;
  cs?: CsConfig;
  friendLinks?: FriendLink[];
  about_content: string;
  user?: { name: string; email: string; role: string; isVip?: boolean } | null;
  navMenu?: NavMenuItem[];
}): string {
  const content = `<h1 class="page-title">About us</h1><div class="article-body about-body">${opts.about_content || '<p class="empty">No content</p>'}</div>`;
  return layout({
    title: 'About us',
    content,
    siteName: opts.siteName,
    tagline: opts.tagline,
    slogan: opts.slogan,
    logo: opts.logo,
    favicon: opts.favicon,
    social: opts.social,
    friendLinks: opts.friendLinks,
    cs: opts.cs,
    user: opts.user,
    navMenu: opts.navMenu,
  });
}
