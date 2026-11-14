/* Header, footer, login and cookie behaviour for /privacy and /terms.
   Keep APP_URL and GA_ID the same as in public/index.html. */
(function(){
  var APP_URL = 'https://app.conv-ai.co.uk';
  var GA_ID = '';
  var $ = function(s,r){ return (r||document).querySelector(s); }, $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  var nav = $('#mainNav'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function(){ menuBtn.setAttribute('aria-expanded', nav.classList.toggle('open')); });
  nav.addEventListener('click', function(e){ if(e.target.closest('a,button')){ nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); } });
  window.addEventListener('scroll', function(){
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    $('.navin').style.setProperty('--p', max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0);
  }, {passive:true});

  document.addEventListener('pointermove', function(e){
    var g = e.target.closest && e.target.closest('.glass');
    if(g){ var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
  }, {passive:true});

  (function(){
    if(!GA_ID) return;
    var KEY = 'convai-analytics', bar = $('#cookie'), open = $('#ckOpen'), choice = null, loaded = false;
    try { choice = localStorage.getItem(KEY); } catch(e){}
    function load(){
      if(loaded) return; loaded = true;
      window['ga-disable-' + GA_ID] = false;
      var sc = document.createElement('script'); sc.async = true; sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(sc);
      window.dataLayer = window.dataLayer || []; window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', GA_ID);
    }
    function set(v){ try { localStorage.setItem(KEY, v); } catch(e){} bar.hidden = true; if(v === 'yes') load(); else window['ga-disable-' + GA_ID] = true; }
    $('#ckYes').addEventListener('click', function(){ set('yes'); });
    $('#ckNo').addEventListener('click', function(){ set('no'); });
    open.hidden = false; open.addEventListener('click', function(){ bar.hidden = false; });
    if(choice === 'yes') load(); else if(choice !== 'no') bar.hidden = false;
  })();

  var veil = $('#veil'), lform = $('#loginForm'), lmsg = $('#loginMsg'), lastFocus = null;
  function say(el, t, kind){ el.textContent = t; el.className = el.className.replace(/ ?(show|ok|warn)/g,'') + ' show' + (kind ? ' ' + kind : ''); }
  var okEmail = function(v){ return /^\S+@\S+\.\S+$/.test(v); };
  function openLogin(){
    if(APP_URL){ location.href = APP_URL; return; }
    lastFocus = document.activeElement; veil.classList.add('open'); nav.classList.remove('open'); $('#l-email').focus();
  }
  function closeLogin(){ veil.classList.remove('open'); lmsg.className = 'msg'; if(lastFocus) lastFocus.focus(); }
  $$('[data-login]').forEach(function(b){ b.addEventListener('click', openLogin); });
  $$('[data-demo]').forEach(function(b){ b.addEventListener('click', function(){ try { sessionStorage.setItem('convai-demo', '1'); } catch(e){} }); });
  $('#loginClose').addEventListener('click', closeLogin);
  $('#loginJoin').addEventListener('click', closeLogin);
  veil.addEventListener('click', function(e){ if(e.target === veil) closeLogin(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && veil.classList.contains('open')) closeLogin(); });
  lform.addEventListener('submit', function(ev){
    ev.preventDefault();
    if(!okEmail($('#l-email').value.trim()) || !$('#l-pass').value){ say(lmsg, 'Enter your email address and password.', 'warn'); return; }
    say(lmsg, 'Platform sign-in is not connected to this site yet. Access opens with the pilot.');
  });
})();
