/* Spud Bud Zagreb — interakcije i animacije */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- scroll loop (one rAF for everything) ---------- */
  const scrollFns = [];
  let ticking = false;
  const runScroll = () => { ticking = false; const y = scrollY; scrollFns.forEach(f => f(y)); };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  /* ---------- header ---------- */
  const header = $('#header');
  let lastY = 0;
  scrollFns.push(y => {
    header.classList.toggle('is-scrolled', y > 24);
    const hide = y > 600 && y > lastY + 4 && !document.body.classList.contains('menu-open');
    const show = y < lastY - 4 || y < 600;
    if (hide) header.classList.add('is-hidden');
    else if (show) header.classList.remove('is-hidden');
    lastY = y;
  });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const mnav = $('#mnav');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Otvori izbornik');
    mnav.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- active nav link ---------- */
  const navLinks = $$('.nav__link');
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['menu', 'prica', 'galerija', 'lokacije', 'mediji', 'faq'].forEach(id => { const s = document.getElementById(id); if (s) secObs.observe(s); });

  /* ---------- split headings into words ---------- */
  $$('[data-split]').forEach(h => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
    h.classList.add('rv-split');
  });

  /* ---------- reveal on scroll ---------- */
  const rvObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); rvObs.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.rv, .rv-pop, .rv-split, .tli').forEach(el => rvObs.observe(el));

  /* ---------- ribbons (scroll-driven marquee) ---------- */
  const tracks = $$('.ribbon__track');
  tracks.forEach(t => { t.innerHTML += t.innerHTML; });
  const ribbons = $('.ribbons');
  let ribOffset = 0, ribVisible = true;
  new IntersectionObserver(([en]) => { ribVisible = en.isIntersecting; }).observe(ribbons);
  const ribLoop = () => {
    if (ribVisible && !reduce) {
      ribOffset += 0.55;
      tracks.forEach(t => {
        const w = t.scrollWidth / 2;
        const sp = parseFloat(t.dataset.speed);
        let x = ((ribOffset + scrollY * 0.35) * sp) % w;
        if (x > 0) x -= w;
        t.style.transform = `translate3d(${x}px,0,0)`;
      });
    }
    requestAnimationFrame(ribLoop);
  };
  requestAnimationFrame(ribLoop);

  /* ---------- hero crumbs parallax ---------- */
  const crumbs = $$('.crumb');
  if (fine && !reduce) {
    const hero = $('.hero');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      crumbs.forEach((c, i) => {
        const k = 18 + (i % 4) * 10;
        c.style.setProperty('--px', `${-nx * k}px`);
        c.style.setProperty('--py', `${-ny * k}px`);
      });
    });
  }

  /* ---------- hero stage: rotating Spuds ---------- */
  const DISHES = [
    { name: 'Pulled chicken', desc: 'Trgana piletina, Spud Bud umak i prženi luk', tag: 'Najpopularniji', tc: 'r', disc: '#FFCC00' },
    { name: 'Pulled beef', desc: 'Trgana govedina, smokey BBQ i prženi luk', tag: '', tc: '', disc: '#C8141C' },
    { name: 'Chilli con carne', desc: 'Mljeveno meso, kukuruz, grah, chilli mayo i prženi luk', tag: 'Chilli mayo', tc: 'r', disc: '#FFCC00' },
    { name: 'Pulled pork', desc: 'Trgana svinjetina, BBQ umak i prženi luk', tag: 'Bez glutena*', tc: 'g', disc: '#BFAE8B' },
    { name: 'Creamy mushroom chicken', desc: 'Piletina, šampinjoni, vrhnje i Grana Padano', tag: '', tc: '', disc: '#FFE27A' },
    { name: 'Beans', desc: 'Slatki grah i prženi luk', tag: 'Vegetarijanski', tc: 'g', disc: '#C8141C' },
    { name: 'Brudet od lignji i kozica', desc: 'Brudet od lignji i kozica i Grana Padano', tag: 'Samo petkom', tc: 'r', disc: '#BFAE8B' },
  ];
  const stage = $('#stage');
  const bowls = $$('.stage__bowl', stage);
  const disc = $('#stageDisc');
  const txt = $('#stageTxt');
  const dotsWrap = $('#stageDots');
  let cur = 0, timer = null, stageVisible = true, paused = false;
  const pad = n => String(n).padStart(2, '0');
  DISHES.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', d.name);
    b.addEventListener('click', () => go(i, i > cur ? 1 : -1, true));
    dotsWrap.appendChild(b);
  });
  const dots = $$('button', dotsWrap);
  const paint = () => {
    const d = DISHES[cur];
    $('#stageName').textContent = d.name;
    $('#stageDesc').textContent = d.desc;
    $('#stageCount').textContent = `${pad(cur + 1)} / ${pad(DISHES.length)}`;
    const tag = $('#stageTag');
    tag.textContent = d.tag; tag.className = 'tag' + (d.tc ? ' tag--' + d.tc : '');
    dots.forEach((b, i) => { b.classList.toggle('is-on', i === cur); b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    disc.style.setProperty('--disc', d.disc);
  };
  const go = (n, dir = 1, user = false) => {
    n = (n + DISHES.length) % DISHES.length;
    if (n === cur) return;
    const old = bowls[cur], nxt = bowls[n];
    bowls.forEach(b => b.style.setProperty('--dir', dir));
    // put the incoming bowl on the correct side without animating
    nxt.style.transition = 'none';
    nxt.classList.remove('is-out', 'is-active');
    void nxt.offsetWidth;
    nxt.style.transition = '';
    old.classList.remove('is-active'); old.classList.add('is-out');
    nxt.classList.add('is-active');
    setTimeout(() => { if (!old.classList.contains('is-active')) old.classList.remove('is-out'); }, 1100);
    cur = n;
    txt.classList.add('is-swap');
    setTimeout(() => { paint(); txt.classList.remove('is-swap'); }, 320);
    if (user) restart();
  };
  const restart = () => {
    clearInterval(timer);
    if (reduce) return;
    timer = setInterval(() => { if (stageVisible && !paused && !document.hidden) go(cur + 1, 1); }, 4200);
  };
  paint(); restart();
  $('#stagePrev').addEventListener('click', () => go(cur - 1, -1, true));
  $('#stageNext').addEventListener('click', () => go(cur + 1, 1, true));
  stage.addEventListener('mouseenter', () => { paused = true; });
  stage.addEventListener('mouseleave', () => { paused = false; });
  new IntersectionObserver(([en]) => { stageVisible = en.isIntersecting; }).observe(stage);
  // swipe
  let sx = null, sy = null;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1, true);
    sx = null;
  });
  stage.addEventListener('pointercancel', () => { sx = null; });
  // preload the rest after first paint
  addEventListener('load', () => bowls.forEach(b => { b.loading = 'eager'; }));

  /* ---------- open / closed status (Europe/Zagreb) ---------- */
  const zagrebNow = () => {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const h = +p.find(x => x.type === 'hour').value % 24, m = +p.find(x => x.type === 'minute').value;
    return h + m / 60;
  };
  const status = (open, close) => {
    const t = zagrebNow();
    const isOpen = t >= open && t < close;
    const cl = close === 24 ? '00:00' : `${close}:00`;
    if (isOpen) {
      const left = close - t;
      return { open: true, text: left <= 1 ? `Zatvara uskoro · ${cl}` : `Otvoreno · do ${cl}` };
    }
    return { open: false, text: `Zatvoreno · otvara u ${open}:00` };
  };
  const paintStatus = () => {
    const hs = status(10, 24);
    const hl = $('#heroLive');
    hl.textContent = hs.open ? `Bogovićeva 4 · ${hs.text}` : `Bogovićeva 4 · ${hs.text}`;
    hl.classList.toggle('is-closed', !hs.open);
    $$('.loc').forEach(l => {
      const s = status(+l.dataset.open, +l.dataset.close);
      const el = $('[data-status]', l);
      el.textContent = s.open ? 'Otvoreno' : 'Zatvoreno';
      el.classList.toggle('is-closed', !s.open);
      el.title = s.text;
    });
  };
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- statement word fill (scroll-linked) ---------- */
  const statement = $('#statement');
  const words = $$('.sw', statement);
  scrollFns.push(() => {
    const r = statement.getBoundingClientRect();
    const vh = innerHeight;
    const p = clamp((vh * .82 - r.top) / (r.height + vh * .35), 0, 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  });

  /* ---------- stacking step cards ---------- */
  const scards = $$('.scard');
  if (!reduce) {
    scrollFns.push(() => {
      scards.forEach((c, i) => {
        const next = scards[i + 1];
        if (!next) { c.style.transform = ''; return; }
        const r = c.getBoundingClientRect(), nr = next.getBoundingClientRect();
        const overlap = clamp(1 - (nr.top - r.top) / r.height, 0, 1);
        c.style.transform = `scale(${1 - overlap * .06})`;
        c.style.filter = overlap > .02 ? `brightness(${1 - overlap * .25})` : '';
      });
    });
  }

  /* ---------- dishes carousel progress (mobile) ---------- */
  const dishes = $('#dishes'), bar = $('#dishesBar');
  const paintBar = () => {
    const max = dishes.scrollWidth - dishes.clientWidth;
    if (max <= 0) return;
    const vis = dishes.clientWidth / dishes.scrollWidth;
    bar.style.width = `${vis * 100}%`;
    bar.style.transform = `translateX(${(dishes.scrollLeft / max) * (1 / vis - 1) * 100}%)`;
  };
  dishes.addEventListener('scroll', () => requestAnimationFrame(paintBar), { passive: true });
  addEventListener('resize', paintBar); paintBar();

  /* ---------- counters ---------- */
  const months = (() => {
    const s = new Date(2025, 3, 11), n = new Date();
    return Math.max(1, (n.getFullYear() - s.getFullYear()) * 12 + n.getMonth() - s.getMonth() - (n.getDate() < s.getDate() ? 1 : 0));
  })();
  const mc = $('#monthsCount'); mc.dataset.count = months; mc.textContent = months;
  const fmt = n => n.toLocaleString('hr-HR').replace(/\s/g, '.');
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      cObs.unobserve(en.target);
      const el = en.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = fmt(to) + suf; return; }
      const t0 = performance.now(), dur = 1600;
      const step = t => {
        const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(Math.round(to * e)) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => cObs.observe(el));

  /* ---------- timeline progress ---------- */
  const tl = $('#timeline'), tlp = $('#tlProgress');
  scrollFns.push(() => {
    const r = tl.getBoundingClientRect();
    const p = clamp((innerHeight * .6 - r.top) / r.height, 0, 1);
    tlp.style.setProperty('--p', p.toFixed(4));
  });

  /* ---------- gallery parallax (desktop) ---------- */
  const gcols = $$('[data-par]');
  const gal = $('#gallery');
  if (!reduce) {
    scrollFns.push(() => {
      if (innerWidth < 900) { gcols.forEach(c => { c.style.transform = ''; }); return; }
      const r = gal.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const p = (innerHeight - r.top) / (innerHeight + r.height) - .5;
      gcols.forEach((c, i) => { c.style.transform = `translate3d(0,${p * [-50, 70, -30][i]}px,0)`; });
    });
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), items = $$('.gitem');
  let li = 0, lastFocus = null;
  const lbShow = i => {
    li = (i + items.length) % items.length;
    const it = items[li];
    lbImg.classList.add('is-swap');
    const src = it.dataset.full, alt = $('img', it).alt;
    const im = new Image();
    im.onload = im.onerror = () => { lbImg.src = src; lbImg.alt = alt; lbImg.classList.remove('is-swap'); };
    im.src = src;
    $('#lbCount').textContent = `${pad(li + 1)} / ${pad(items.length)}`;
  };
  const lbOpen = i => {
    lastFocus = document.activeElement;
    lbImg.src = $('img', items[i]).currentSrc || $('img', items[i]).src;
    lbShow(i);
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    $('#lbClose').focus();
  };
  const lbClose = () => {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  items.forEach((it, i) => it.addEventListener('click', () => lbOpen(i)));
  $('#lbClose').addEventListener('click', lbClose);
  $('#lbPrev').addEventListener('click', () => lbShow(li - 1));
  $('#lbNext').addEventListener('click', () => lbShow(li + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(li - 1);
    if (e.key === 'ArrowRight') lbShow(li + 1);
  });
  let lx = null;
  lb.addEventListener('pointerdown', e => { lx = e.clientX; });
  lb.addEventListener('pointerup', e => {
    if (lx === null) return;
    const dx = e.clientX - lx; lx = null;
    if (Math.abs(dx) > 50) lbShow(li + (dx < 0 ? 1 : -1));
  });

  /* ---------- locations + map ---------- */
  const map = $('#map'), locs = $$('.loc');
  let mapLoaded = false;
  const mapSrc = q => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&hl=hr&output=embed`;
  const setLoc = (loc, load = true) => {
    locs.forEach(l => { const on = l === loc; l.classList.toggle('is-on', on); $('.loc__sel', l).setAttribute('aria-pressed', String(on)); });
    $('#mapPin span').textContent = loc.dataset.addr;
    if (load && mapLoaded) $('iframe', map).src = mapSrc(loc.dataset.q);
    if (load && innerWidth < 1020) map.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  };
  locs.forEach(l => $('.loc__sel', l).addEventListener('click', () => setLoc(l)));
  new IntersectionObserver(([en], o) => {
    if (!en.isIntersecting) return;
    o.disconnect(); mapLoaded = true;
    const f = document.createElement('iframe');
    f.title = 'Karta – Spud Bud lokacija'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    f.src = mapSrc($('.loc.is-on').dataset.q);
    f.addEventListener('load', () => { const ph = $('.map__ph', map); if (ph) ph.remove(); });
    map.appendChild(f);
  }, { rootMargin: '400px 0px' }).observe(map);

  /* ---------- upcoming festival notice ---------- */
  const soon = $('#soon');
  if (soon && new Date() <= new Date(soon.dataset.until + 'T23:59:59+02:00')) soon.hidden = false;

  /* ---------- press row arrows ---------- */
  const prow = $('#prow');
  const pstep = () => ($('.pcard', prow).offsetWidth + 18) * (innerWidth > 1180 ? 2 : 1);
  $('#pressPrev').addEventListener('click', () => prow.scrollBy({ left: -pstep(), behavior: 'smooth' }));
  $('#pressNext').addEventListener('click', () => prow.scrollBy({ left: pstep(), behavior: 'smooth' }));
  // drag to scroll with mouse
  if (fine) {
    let down = false, px = 0, sl = 0, moved = false;
    prow.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; px = e.clientX; sl = prow.scrollLeft; prow.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - px; if (Math.abs(dx) > 5) moved = true; prow.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; prow.style.scrollSnapType = ''; });
    prow.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
    prow.addEventListener('dragstart', e => e.preventDefault());
  }

  /* ---------- review card stack ---------- */
  const rstack = $('#rstack');
  let rcards = $$('.rcard', rstack);
  const layout = () => rcards.forEach((c, k) => { c.style.setProperty('--k', k); c.setAttribute('aria-hidden', k ? 'true' : 'false'); });
  const cycle = (dir = 1) => {
    const top = rcards[0];
    if (dir > 0) {
      top.classList.add('is-fly');
      top.style.transform = `translate(${-120}%, 10%) rotate(-18deg)`;
      setTimeout(() => {
        top.style.transform = ''; top.classList.remove('is-fly');
        rcards.push(rcards.shift()); layout();
      }, 380);
    } else {
      rcards.unshift(rcards.pop()); layout();
    }
  };
  $('#revNext').addEventListener('click', () => cycle(1));
  $('#revPrev').addEventListener('click', () => cycle(-1));
  let rx = null, rdx = 0;
  rstack.addEventListener('pointerdown', e => { rx = e.clientX; rdx = 0; rcards[0].classList.add('is-drag'); });
  rstack.addEventListener('pointermove', e => {
    if (rx === null) return;
    rdx = e.clientX - rx;
    rcards[0].style.transform = `translate(${rdx}px, ${Math.abs(rdx) * .06}px) rotate(${rdx * .05}deg)`;
  });
  const rEnd = () => {
    if (rx === null) return;
    rx = null;
    const top = rcards[0]; top.classList.remove('is-drag');
    if (Math.abs(rdx) > 80) {
      top.classList.add('is-fly');
      top.style.transform = `translate(${rdx > 0 ? 130 : -130}%, 10%) rotate(${rdx > 0 ? 18 : -18}deg)`;
      setTimeout(() => { top.style.transform = ''; top.classList.remove('is-fly'); rcards.push(rcards.shift()); layout(); }, 380);
    } else top.style.transform = '';
  };
  rstack.addEventListener('pointerup', rEnd);
  rstack.addEventListener('pointercancel', rEnd);
  rstack.addEventListener('pointerleave', rEnd);

  /* ---------- FAQ: smooth open/close, one at a time ---------- */
  $$('#qa details').forEach(d => {
    const sum = $('summary', d), body = $('.qa__a', d);
    sum.addEventListener('click', e => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'ease-in' }).onfinish = () => { d.open = false; };
      } else {
        $$('#qa details[open]').forEach(o => { if (o !== d) o.open = false; });
        d.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });

  /* ---------- mobile order bar ---------- */
  const obar = $('#obar');
  const heroEl = $('.hero'), footer = $('.footer');
  scrollFns.push(y => {
    const past = y > heroEl.offsetHeight * .7;
    const nearEnd = footer.getBoundingClientRect().top < innerHeight - 40;
    obar.classList.toggle('is-on', past && !nearEnd);
  });

  /* ---------- magnetic buttons + tilt (desktop) ---------- */
  if (fine && !reduce) {
    $$('.hero__cta .btn, .cta__btns .btn').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    $$('.fact, .pcard').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  $('#year').textContent = new Date().getFullYear();
  runScroll();
})();
