(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const svg = (tag, attrs) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* ───────────────────────── Данные ───────────────────────── */

  const NAMES = [
    'моя звёздочка', 'моя любовь', 'моё солнышко', 'моё счастье', 'моё всё', 'моя жизнь', 'моя принцесса',
    'моя заечка', 'моя сладенькая', 'моя миледи', 'хонуми ман', 'ситораи ман', 'чону дили ман',
  ];
  const FINAL_NAME = 'моя будущая жёнушка :)';

  // 10 октября 2025, 00:00 по Душанбе (UTC+5)
  const START = Date.UTC(2025, 9, 9, 19, 0, 0);

  const ICONS = {
    cat: '<path d="M14 34 L15 13 L26 23 Q32 21 38 23 L49 13 L50 34 Q50 52 32 52 Q14 52 14 34Z"/><circle class="f" cx="25" cy="34" r="2.2"/><circle class="f" cx="39" cy="34" r="2.2"/><path d="M30 40 L32 42 L34 40 M32 42 Q30 46 27 45 M32 42 Q34 46 37 45"/><path d="M6 37 L20 39 M6 44 L20 42 M58 37 L44 39 M58 44 L44 42"/>',
    butterfly: '<path d="M32 20 L32 50"/><path d="M32 27 C 22 8, 4 12, 10 28 C 13 36, 26 34, 32 30"/><path d="M32 27 C 42 8, 60 12, 54 28 C 51 36, 38 34, 32 30"/><path d="M32 33 C 20 34, 12 46, 20 50 C 26 52, 31 42, 32 37"/><path d="M32 33 C 44 34, 52 46, 44 50 C 38 52, 33 42, 32 37"/><path d="M32 20 Q28 12 24 9 M32 20 Q36 12 40 9"/>',
    caterpillar: '<circle cx="12" cy="42" r="6"/><circle cx="23" cy="40" r="7"/><circle cx="35" cy="37" r="7.5"/><circle cx="48" cy="30" r="9"/><circle class="f" cx="45" cy="28" r="1.6"/><circle class="f" cx="52" cy="28" r="1.6"/><path d="M44.5 34 Q48.5 37.5 52.5 34"/><path d="M44 21.5 L40 12 M52 21.5 L56 12"/><path d="M11 48 L10 53 M22 47 L21 53 M34 44.5 L33 51"/>',
    bee: '<ellipse cx="30" cy="40" rx="17" ry="11"/><path d="M24 29.5 L24 50.5 M32 29 L32 51"/><path d="M27 30 C 19 13, 6 18, 14 27 C 18 30, 24 30, 27 30"/><path d="M33 29 C 39 11, 54 14, 46 25 C 42 29, 37 29, 33 29"/><circle class="f" cx="41" cy="37" r="1.7"/><path d="M40 44 Q43 46 45 43"/><path d="M13 40 L7 40"/>',
    spider: '<path d="M32 3 L32 21"/><circle cx="32" cy="26" r="5"/><ellipse cx="32" cy="40" rx="9" ry="10"/><path d="M24 33 Q14 26 9 33 M23.5 38 Q12 37 7 44 M24.5 43 Q14 46 12 54 M27 47 Q20 52 20 59"/><path d="M40 33 Q50 26 55 33 M40.5 38 Q52 37 57 44 M39.5 43 Q50 46 52 54 M37 47 Q44 52 44 59"/><circle class="f" cx="30" cy="25" r="1.2"/><circle class="f" cx="34" cy="25" r="1.2"/>',
    frog: '<path d="M9 41 C 9 27, 21 23, 32 23 C 43 23, 55 27, 55 41 C 55 51, 45 55, 32 55 C 19 55, 9 51, 9 41Z"/><circle cx="21" cy="21" r="7"/><circle cx="43" cy="21" r="7"/><circle class="f" cx="21" cy="21" r="2.6"/><circle class="f" cx="43" cy="21" r="2.6"/><path d="M18 41 Q32 51 46 41"/><circle class="f" cx="28" cy="33" r="1"/><circle class="f" cx="36" cy="33" r="1"/>',
  };

  const NOTES = [
    { icon: 'cat', title: 'Если бы я был котом,', text: 'я бы отрастил большие когти и зубы, чтобы защищать тебя, и спал бы у тебя на животике :)', orig: 'p51-note-cat' },
    { icon: 'butterfly', title: 'Если бы я был бабочкой,', text: 'я бы кружил над тобой и вокруг тебя, потому что нет ни одного цветка, который выглядел бы и пах лучше, чем ты :)', orig: 'p51-note-cat' },
    { icon: 'caterpillar', title: 'Если бы я был гусеницей,', text: 'я бы приносил тебе свежие фрукты и чистил их, чтобы тебе было легко их есть :)', orig: 'p49-note-caterpillar' },
    { icon: 'bee', title: 'Если бы я был пчёлкой,', text: 'я бы жил в твоих золотых волосах и каждый день приносил маленькие цветочки — и до конца моих дней у тебя был бы свой собственный сад :)', orig: 'p49-note-caterpillar' },
    { icon: 'spider', title: 'Если бы я был паучком,', text: 'я бы жил в твоей комнате, прогнал бы всех остальных насекомых и плёл бы красивые украшения из паутины в уголках твоих стен :)', orig: 'p50-note-spider' },
    { icon: 'frog', title: 'Если бы я был лягушкой,', text: 'я бы научился петь и пел бы тебе твои любимые песни, а ещё съедал бы каждого жучка, который тебя тревожит :)', orig: 'p50-note-spider' },
    { final: true, text: 'Ты самая красивая, милая, умная, смешная и добрая девушка во вселенной!!!! :)', orig: 'p52-note-heart' },
  ];

  const TABLE = [
    ['p01-cafe-bag', 'ограбление HB:)'], ['p13-drinks', 'буль буль ти:)'], ['p07-2000', 'богач :)'], ['p28-dinner', 'ужин в парке'],
    ['p10-upside', 'мы :)'], ['p11-funny', 'снято лучшим фотографом'], ['p04-selfie', 'совместная покупка', '72% 50%'], ['p08-hands', 'занят:)'],
    ['p09-cafe-table', 'ждем пиццу'],
  ];

  const LOVE = [
    { img: 'p29-stamps', cap: '…одинаковые печати на запястьях', c: '#ff8fab', r: -2 },
    { img: 'p30-milka', cap: '…приятно удивлять', c: '#f2b632', r: 2 },
    { vid: 'v10-bow', cap: '…одевать шикарный бантик из ее салфетки', c: '#a78bfa', r: -1.5 },
    { img: 'p36-knights', cap: '…вместе против всех чудовищ', c: '#5fb4f0', r: 2.5 },
    { img: 'p05-doodle', cap: '…совместное художество', c: '#4fc994', r: -2.5 },
    { vid: 'v06-fingers', cap: '…человечек из руки', c: '#ff9a5c', r: 1.5 },
    { img: 'p32-cheesecake', cap: '…праздновать день рождения принцессы после тяжелого рабочего дня', c: '#f5c400', r: -1 },
    { img: 'p18-blue2', cap: '…цветы просто так', c: '#3fa9f5', r: 2 },
  ];

  const CLIPS = [
    ['v02-bed', 'Мы', 5.8], ['v00-walk', 'Прогулка', 30.1], ['v03-store', 'Супермаркет', 15.4], ['v10-bow', 'Бантик', 56.8],
    ['v05-2000', 'Две тысячи', 6], ['v07-cafe', 'Кафе', 16.4], ['v01-dinner', 'Рамен и девушка 20 века', 13.1], ['v13-veranda', 'Покушать на природе', 5.4],
    ['v09-salad', 'Аристократ', 49.2], ['v06-fingers', 'Пальчики', 13.6], ['v04-doodles', 'Шедевр', 17.9], ['v08-car', 'Курутный поцелуй', 39.6],
    ['v11-laptop', 'Перфекционизм', 36.6], ['v12-park', 'Кошечка', 36.5], ['v14-bench', 'Блинчики не дам', 35.2], ['v15-lilies', 'Светошка со светошками:)', 11],
    ['v16-dusk', 'Стесняшка', 29.1], ['v17-umbrella', 'Марчона шпион', 8.8], ['v18-frog', 'Ляшгушка говорит факты', 17.4],
  ];
  const clipTitle = Object.fromEntries(CLIPS.map(([id, t]) => [id, t]));

  const PHOTOS = [
    'p41-leaves1', 'p14-sunflower', 'p02-cafe-bag2', 'p47-snowheart', 'p10-upside', 'p29-stamps', 'p34-lily', 'p20-loveis',
    'p07-2000', 'p43-puddle2', 'p17-blue', 'p37-bread', 'p52-note-heart', 'p24-street4', 'p05-doodle', 'p32-cheesecake',
    'p46-guitar', 'p11-funny', 'p13-drinks', 'p53-converse', 'p38-card', 'p01-cafe-bag', 'p36-knights', 'p15-sunflower2',
    'p48-leaves2', 'p30-milka', 'p21-street1', 'p42-baby', 'p28-dinner', 'p35-lily2', 'p08-hands', 'p19-blue3',
    'p54-peace', 'p49-note-caterpillar', 'p04-selfie', 'p22-street2', 'p40-puddle1', 'p27-laptop', 'p06-doodle2', 'p18-blue2',
    'p09-cafe-table', 'p33-desk', 'p45-puddle4', 'p26-street6', 'p31-milka2', 'p00-mirror', 'p51-note-cat', 'p23-street3',
    'p44-puddle3', 'p39-computer', 'p50-note-spider', 'p25-street5',
  ];

  const videoItem = id => ({ type: 'video', src: `media/video/${id}.mp4`, poster: `media/poster/${id}.jpg`, cap: clipTitle[id] || '' });
  const imgItem = (name, cap = '') => ({ type: 'img', src: `media/img/${name}.webp`, cap });

  /* ───────────────────────── Конверт ───────────────────────── */

  history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  const gate = $('#gate'), envCard = $('#envCard'), gateHint = $('#gateHint');
  let opened = false, envStage = 0; // 0 — лицевая сторона, 1 — обратная, 2 — открывается
  const later = (ms, fn) => setTimeout(fn, reduce ? Math.min(ms, 300) : ms);

  // первое касание: музыка и переворот конверта
  function flipEnvelope() {
    if (envStage !== 0) return;
    envStage = 1;
    Music.start();
    $('#soundBtn').hidden = false;
    envCard.classList.add('flipped');
    gateHint.style.opacity = 0;
    later(1050, () => {
      envCard.classList.add('flat');
      gateHint.textContent = 'нажми на печать';
      gateHint.style.opacity = '';
    });
  }
  // второе касание: печать трескается, клапан открывается, письмо выходит
  function openGate() {
    if (envStage !== 1 || !envCard.classList.contains('flat')) return;
    envStage = 2;
    opened = true;
    gate.classList.add('opening', 'cracking');
    if (navigator.vibrate) navigator.vibrate(18);
    later(330, () => gate.classList.add('flap-open'));
    later(330 + 425, () => gate.classList.add('flap-behind')); // ровно на 90° клапан уходит за письмо
    later(1150, () => gate.classList.add('letter-out'));
    later(3700, () => gate.classList.add('leaving'));
    later(4300, () => {
      gate.classList.add('gone');
      document.body.classList.remove('locked');
      startHeroNames();
    });
    later(5800, () => gate.remove());
  }
  $('#envelope').addEventListener('click', () => (envStage === 0 ? flipEnvelope() : openGate()));
  $('#envelope').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    envStage === 0 ? flipEnvelope() : openGate();
  });

  const soundBtn = $('#soundBtn');
  soundBtn.addEventListener('click', () => {
    const on = Music.toggle();
    soundBtn.classList.toggle('off', !on);
    soundBtn.setAttribute('aria-label', on ? 'Выключить музыку' : 'Включить музыку');
  });

  /* ───────────────────────── Первый экран ───────────────────────── */

  function startHeroNames() {
    const el = $('#heroName');
    let i = 0;
    setInterval(() => {
      el.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % NAMES.length;
        el.textContent = NAMES[i];
        el.classList.remove('out');
      }, 750);
    }, 3300);
  }

  const plural = (n, f) => {
    const a = n % 100, b = n % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    if (b === 1) return f[0];
    return f[2];
  };
  const FORMS = {
    D: ['день', 'дня', 'дней'], H: ['час', 'часа', 'часов'],
    M: ['минута', 'минуты', 'минут'], S: ['секунда', 'секунды', 'секунд'],
  };
  function tickCounter() {
    let t = Math.max(0, Math.floor((Date.now() - START) / 1000));
    const v = { D: Math.floor(t / 86400) };
    t -= v.D * 86400; v.H = Math.floor(t / 3600);
    t -= v.H * 3600; v.M = Math.floor(t / 60);
    v.S = t - v.M * 60;
    for (const k in v) {
      $('#c' + k).textContent = k === 'D' ? v[k] : String(v[k]).padStart(2, '0');
      $('#l' + k).textContent = plural(v[k], FORMS[k]);
    }
  }
  tickCounter();
  setInterval(tickCounter, 1000);

  /* ───────────────────────── Созвездие имён ───────────────────────── */

  const namesSec = $('#names');
  const STEPS = NAMES.length; // 13 звёзд + финальное имя
  const stars = [], lines = [], labels = [];
  (function buildConstellation() {
    const dense = [];
    for (let i = 0; i <= 720; i++) {
      const t = (i / 720) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      dense.push([50 + x * 2.65, 47 + y * 2.65]);
    }
    $('#cHeart').setAttribute('d', 'M' + dense.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z');

    const cum = [0];
    for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    const L = cum[cum.length - 1];
    const pts = [];
    for (let k = 0; k < STEPS; k++) {
      const target = (k / STEPS) * L;
      let j = 0;
      while (cum[j] < target) j++;
      pts.push(dense[j]);
    }
    const gL = $('#cLines'), gS = $('#cStars'), gT = $('#cLabels');
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % STEPS];
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const ln = svg('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: 'c-line' });
      ln.style.strokeDasharray = len; ln.style.strokeDashoffset = len; ln.dataset.len = len;
      gL.append(ln); lines.push(ln);

      const g = svg('g', { class: 'c-star' });
      g.append(svg('circle', { class: 'glow', cx: p[0], cy: p[1], r: 3.4, fill: 'url(#starGlow)' }));
      g.append(svg('circle', { class: 'core', cx: p[0], cy: p[1], r: .6 }));
      gS.append(g); stars.push(g);

      const dx = p[0] - 50, dy = p[1] - 52, d = Math.hypot(dx, dy) || 1;
      const tx = p[0] + (dx / d) * 4.8, ty = p[1] + (dy / d) * 4.8;
      const anchor = dx > 1 ? 'start' : dx < -1 ? 'end' : 'middle';
      const tl = svg('text', { x: tx, y: ty + 1, 'text-anchor': anchor, class: 'c-label' });
      tl.textContent = NAMES[i];
      gT.append(tl); labels.push(tl);
    });
  })();

  let namesIdx = -1;
  const nameNow = $('#nameNow');
  function updateNames(p) {
    const idx = Math.min(STEPS, Math.floor(p * (STEPS + 1.5)));
    if (idx === namesIdx) return;
    namesIdx = idx;
    stars.forEach((s, i) => { s.classList.toggle('on', i <= idx); s.classList.toggle('now', i === idx); });
    lines.forEach((l, i) => { l.style.strokeDashoffset = i < idx ? 0 : l.dataset.len; });
    labels.forEach((l, i) => l.classList.toggle('on', i <= idx));
    namesSec.classList.toggle('done', idx >= STEPS);
    $('#namesCount').textContent = idx < STEPS ? `${idx + 1} / ${STEPS + 1}` : '♡';
    nameNow.classList.add('swap');
    clearTimeout(updateNames.t);
    updateNames.t = setTimeout(() => {
      nameNow.textContent = idx < STEPS ? NAMES[idx] : FINAL_NAME;
      nameNow.classList.remove('swap');
    }, 260);
  }

  /* ───────────────────────── Блокнот ───────────────────────── */

  const deck = $('#deck');
  let deckCur = 0;
  const cards = NOTES.map((n, i) => {
    const c = document.createElement('div');
    c.className = 'card' + (n.final ? ' card-final' : '');
    if (n.final) {
      c.innerHTML = `<div class="heart-note"><svg viewBox="0 0 100 92" aria-hidden="true">
          <path d="M50 86 C 22 64, 4 48, 8 26 C 12 8, 38 4, 50 24 C 62 4, 88 8, 92 26 C 96 48, 78 64, 50 86 Z"/>
          <path d="M49 88 C 20 65, 2 47, 7 24 C 12 6, 39 3, 51 22 C 61 3, 90 6, 94 25 C 97 49, 76 66, 52 86" opacity=".5"/>
        </svg><p>${n.text}</p></div>
        <button class="card-orig" type="button">оригинал</button>`;
    } else {
      c.innerHTML = `<div class="card-head"><svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[n.icon]}</svg>
        <span class="card-title">${n.title}</span></div>
        <p class="card-text">${n.text}</p>
        <button class="card-orig" type="button">оригинал</button>`;
    }
    c.querySelector('.card-orig').addEventListener('click', e => {
      e.stopPropagation();
      openLB([imgItem(n.orig, 'Мой блокнот')], 0);
    });
    deck.append(c);
    return c;
  });
  function layoutDeck() {
    cards.forEach((c, i) => {
      const k = i - deckCur;
      c.classList.toggle('gone', k < 0);
      if (k >= 0) {
        const rot = k === 0 ? 0 : (k % 2 ? 2.2 : -1.8) * Math.min(k, 3);
        c.style.transform = `translate3d(${Math.min(k, 3) * 5}px, ${Math.min(k, 3) * 9}px, 0) rotate(${rot}deg)`;
        c.style.opacity = k > 3 ? 0 : 1;
      }
      c.style.zIndex = 100 - Math.abs(k);
    });
    $('#deckCount').textContent = `${deckCur + 1} / ${cards.length}`;
  }
  const deckNext = () => { deckCur = deckCur >= cards.length - 1 ? 0 : deckCur + 1; layoutDeck(); };
  const deckPrev = () => { deckCur = Math.max(0, deckCur - 1); layoutDeck(); };
  $('#deckNext').addEventListener('click', deckNext);
  $('#deckPrev').addEventListener('click', deckPrev);
  let swipeX = null;
  deck.addEventListener('pointerdown', e => { swipeX = e.target.closest('.card-orig') ? null : e.clientX; });
  deck.addEventListener('pointercancel', () => { swipeX = null; });
  deck.addEventListener('pointerup', e => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (dx > 50) deckPrev(); else deckNext();
  });
  layoutDeck();

  /* ───────────────────────── Стол с полароидами ───────────────────────── */

  const tableArea = $('#tableArea');
  if (!finePointer) $('#tableHint').textContent = 'Нажми на любую';
  let zTop = 10;
  const pols = TABLE.map(([name, cap, pos], i) => {
    const el = document.createElement('div');
    el.className = 'pol';
    el.innerHTML = `<img src="media/thumb/${name}.webp" alt="${cap}" loading="lazy"${pos ? ` style="object-position:${pos}"` : ''}><span>${cap}</span>`;
    el.style.transitionDelay = `${i * 0.08}s`;
    tableArea.append(el);
    let drag = null, moved = false;
    el.addEventListener('pointerdown', e => {
      el.style.zIndex = ++zTop;
      if (e.pointerType !== 'mouse') return;
      e.preventDefault();
      moved = false;
      drag = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop };
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
    });
    el.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
      el.style.left = drag.l + dx + 'px';
      el.style.top = drag.t + dy + 'px';
    });
    const end = () => { drag = null; el.classList.remove('dragging'); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', () => {
      if (moved) { moved = false; return; }
      openLB(TABLE.map(([n, c]) => imgItem(n, c)), i);
    });
    return el;
  });
  function seeded(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function layoutTable() {
    const rnd = seeded(7);
    const W = tableArea.clientWidth;
    const pw = pols[0].offsetWidth, ph = pols[0].offsetHeight || pw * 1.6;
    const cols = W < 640 ? 2 : W < 1000 ? 3 : 4;
    const rows = Math.ceil(pols.length / cols);
    const cw = W / cols, rh = ph + 22;
    // подписи важнее «кучи», поэтому ряды не перекрывают друг друга
    tableArea.style.height = rows * rh + 40 + 'px';
    pols.forEach((el, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const off = r % 2 ? cw * .18 : 0;
      const x = clamp(c * cw + (cw - pw) / 2 + off + (rnd() - .5) * cw * .22, 4, W - pw - 4);
      const y = r * rh + 16 + (rnd() - .5) * 18;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.rotate = `${(rnd() - .5) * 14}deg`;
    });
  }
  layoutTable();
  addEventListener('resize', layoutTable);

  /* ───────────────────────── Любовь — это… ───────────────────────── */

  const liGrid = $('#liGrid');
  const loveItems = LOVE.map(l => l.vid ? { ...videoItem(l.vid), cap: 'Любовь — это ' + l.cap } : imgItem(l.img, 'Любовь — это ' + l.cap));
  LOVE.forEach((l, i) => {
    const el = document.createElement('div');
    el.className = 'li';
    el.setAttribute('data-reveal', '');
    el.style.setProperty('--c', l.c);
    el.style.setProperty('--r', l.r + 'deg');
    el.style.setProperty('--d', (i % 4) * 0.12 + 's');
    const media = l.vid
      ? `<video class="loop" data-id="${l.vid}" muted loop playsinline preload="none" poster="media/poster/${l.vid}.jpg"></video>`
      : `<img src="media/thumb/${l.img}.webp" alt="" loading="lazy">`;
    el.innerHTML = `<p class="li-top">Любовь — это…</p><div class="li-media">${media}</div><p class="li-cap">${l.cap}</p>`;
    el.addEventListener('click', () => openLB(loveItems, i));
    liGrid.append(el);
  });

  /* ───────────────────────── Наше кино ───────────────────────── */

  const track = $('#filmTrack');
  const clipItems = CLIPS.map(([id]) => videoItem(id));
  CLIPS.forEach(([id, title, dur], i) => {
    const b = document.createElement('button');
    b.className = 'clip';
    b.type = 'button';
    const m = Math.floor(dur / 60), s = String(Math.round(dur % 60)).padStart(2, '0');
    b.innerHTML = `<div class="clip-media"><video class="loop" data-id="${id}" muted loop playsinline preload="none" poster="media/poster/${id}.jpg"></video>
      <span class="clip-no">${String(i + 1).padStart(2, '0')}</span></div>
      <div class="clip-meta"><b>${title}</b><i>${m}:${s}</i></div>`;
    b.addEventListener('click', () => openLB(clipItems, i));
    track.append(b);
  });
  const clipStep = () => (track.firstElementChild?.offsetWidth || 200) + 10;
  $('#filmPrev').addEventListener('click', () => track.scrollBy({ left: -clipStep() * 2, behavior: 'smooth' }));
  $('#filmNext').addEventListener('click', () => track.scrollBy({ left: clipStep() * 2, behavior: 'smooth' }));

  /* ───────────────────────── Мозаика-сердце ───────────────────────── */

  const mosaic = $('#mosaic');
  (function buildMosaic() {
    const items = [...PHOTOS.map(p => ({ thumb: `media/thumb/${p}.webp`, item: imgItem(p) })),
                   ...CLIPS.map(([id]) => ({ thumb: `media/poster/${id}.jpg`, item: videoItem(id) }))];
    // перемешиваем видео между фотографиями
    const mixed = [];
    const vids = items.slice(PHOTOS.length), photos = items.slice(0, PHOTOS.length);
    photos.forEach((p, i) => { mixed.push(p); if (i % 3 === 1 && vids.length) mixed.push(vids.shift()); });
    mixed.push(...vids);

    let n = 9, cells = [];
    const cellsFor = n => {
      const out = [];
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const x = ((c + .5) / n - .5) * 2.6, y = -((r + .5) / n - .5) * 2.6 + .2;
        if ((x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0) out.push([r, c]);
      }
      return out;
    };
    while ((cells = cellsFor(n)).length < mixed.length && n < 20) n++;
    mosaic.style.setProperty('--n', n);
    const group = mixed.map(m => m.item);
    cells.forEach(([r, c], i) => {
      const k = i % mixed.length;
      const b = document.createElement('button');
      b.className = 'tile';
      b.type = 'button';
      b.style.gridRow = r + 1;
      b.style.gridColumn = c + 1;
      b.style.setProperty('--d', (Math.hypot(r - n * .45, c - (n - 1) / 2) * 0.07).toFixed(2) + 's');
      b.innerHTML = `<img src="${mixed[k].thumb}" alt="" loading="lazy">`;
      b.addEventListener('click', () => openLB(group, k));
      mosaic.append(b);
    });
  })();

  /* ───────────────────────── Лайтбокс ───────────────────────── */

  const lb = $('#lb'), lbStage = $('#lbStage'), lbCap = $('#lbCap');
  let lbGroup = [], lbI = 0;
  function openLB(items, i) {
    lbGroup = items; lbI = i;
    lb.hidden = false;
    lb.classList.toggle('single', items.length < 2);
    document.documentElement.style.overflow = 'hidden';
    renderLB();
  }
  function renderLB() {
    const it = lbGroup[lbI];
    lbStage.innerHTML = '';
    if (it.type === 'video') {
      const v = document.createElement('video');
      v.src = it.src; v.poster = it.poster || '';
      v.controls = true; v.playsInline = true; v.autoplay = true;
      lbStage.append(v);
      v.play().catch(() => {});
      Music.duck(true);
    } else {
      const img = new Image();
      img.src = it.src; img.alt = it.cap || '';
      lbStage.append(img);
      Music.duck(false);
    }
    lbCap.textContent = it.cap || '';
  }
  function closeLB() {
    lbStage.innerHTML = '';
    lb.hidden = true;
    document.documentElement.style.overflow = '';
    Music.duck(false);
  }
  const lbMove = d => { if (lbGroup.length > 1) { lbI = (lbI + d + lbGroup.length) % lbGroup.length; renderLB(); } };
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', () => lbMove(-1));
  $('#lbNext').addEventListener('click', () => lbMove(1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target === lbStage) closeLB(); });
  addEventListener('keydown', e => {
    if (lb.hidden) {
      return;
    }
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') lbMove(-1);
    if (e.key === 'ArrowRight') lbMove(1);
  });
  let lbSwipe = null;
  lbStage.addEventListener('pointerdown', e => { lbSwipe = { x: e.clientX, y: e.clientY }; });
  lbStage.addEventListener('pointerup', e => {
    if (!lbSwipe) return;
    const dx = e.clientX - lbSwipe.x, dy = e.clientY - lbSwipe.y;
    lbSwipe = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) lbMove(dx < 0 ? 1 : -1);
  });

  // любое фото на странице с data-zoom открывается крупно
  $$('img[data-zoom]').forEach(img => {
    img.addEventListener('click', () => {
      const strip = img.closest('.puddle-strip');
      if (strip) {
        const all = $$('img', strip);
        openLB(all.map(x => ({ type: 'img', src: x.dataset.full, cap: x.alt })), all.indexOf(img));
        return;
      }
      const cap = img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt;
      openLB([{ type: 'img', src: img.dataset.full || img.src, cap }], 0);
    });
  });
  // видео в рамках открываются целиком и со звуком
  $$('.vframe, .cinema-frame').forEach(f => {
    const id = f.querySelector('video').dataset.id;
    f.addEventListener('click', () => openLB([videoItem(id)], 0));
  });

  /* ───────────────────────── Видео-петли ───────────────────────── */

  const loopIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.getAttribute('src')) v.src = `media/loop/${v.dataset.id}.mp4`;
        v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: '120px 0px' });
  $$('video.loop').forEach(v => loopIO.observe(v));

  /* ───────────────────────── Появление при прокрутке ───────────────────────── */

  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });
  $$('[data-reveal]').forEach(el => revealIO.observe(el));

  const once = (el, fn, threshold = .2) => {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { fn(); io.disconnect(); } }, { threshold });
    io.observe(el);
  };
  once(tableArea, () => tableArea.classList.add('in'), .15);
  once(mosaic, () => {
    mosaic.classList.add('in');
    setTimeout(() => mosaic.classList.add('beat'), 2600);
  }, .25);

  /* ───────────────────────── Сцены, времена года, параллакс ───────────────────────── */

  const seasonSecs = $$('main > section[data-season]');
  const paras = $$('[data-speed]');
  const flipSec = $('#flip'), finaleSec = $('#finale');
  const flipImgs = $$('#flipFrames img');
  const cardImg = $('#cardPhoto img');
  const fLines = $$('#finale .f');
  let season = 'night', flipIdx = 0, finaleStep = -1;

  const progressOf = el => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight), 0, 1);
  };
  const near = el => {
    const r = el.getBoundingClientRect();
    return r.bottom > -innerHeight && r.top < innerHeight * 2;
  };

  function update() {
    const vh = innerHeight, mid = vh * .5;

    for (const s of seasonSecs) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        const se = s.dataset.season;
        if (se !== season) {
          season = se;
          document.body.dataset.season = se;
          Sky.setMode(se);
        }
        break;
      }
    }

    if (near(namesSec)) updateNames(progressOf(namesSec));

    if (near(flipSec)) {
      const p = progressOf(flipSec);
      const i = Math.min(flipImgs.length - 1, Math.floor(p * (flipImgs.length + .6)));
      if (i !== flipIdx) {
        flipImgs[flipIdx].classList.remove('on');
        flipImgs[i].classList.add('on');
        flipIdx = i;
        $('#flipNum').textContent = i + 1;
      }
      $('#flipT1').classList.toggle('show', p > .25);
      $('#flipT2').classList.toggle('show', p > .6);
    }

    if (near(finaleSec)) {
      const p = progressOf(finaleSec);
      if (!reduce) cardImg.style.transform = `scale(${1 + clamp((p - .1) / .55, 0, 1) * .9})`;
      const step = p < .2 ? 0 : p < .47 ? 1 : p < .74 ? 2 : 3;
      if (step !== finaleStep) {
        finaleStep = step;
        fLines.forEach((f, i) => f.classList.toggle('show', i === step));
      }
    }

    if (!reduce) {
      for (const el of paras) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const c = r.top + r.height / 2 - mid;
        el.style.translate = `0 ${(-c * parseFloat(el.dataset.speed)).toFixed(1)}px`;
      }
    }

    const max = document.documentElement.scrollHeight - vh;
    $('#progressBar').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  }
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  /* ───────────────────────── Зажми сердечко ───────────────────────── */

  const holdBtn = $('#holdHeart'), holdFill = $('#holdFill');
  let fill = 0, holding = false, holdDone = false, looping = false, lastT = 0;
  function holdLoop(t) {
    const dt = lastT ? (t - lastT) / 1000 : 0;
    lastT = t;
    fill = clamp(fill + (holding ? dt / 2.2 : -dt / .9), 0, 1);
    holdFill.setAttribute('y', (92 - 92 * fill).toFixed(2));
    if (holding && navigator.vibrate && Math.random() < .06) navigator.vibrate(6);
    if (fill >= 1) { looping = false; return completeHold(); }
    if (holding || fill > 0) requestAnimationFrame(holdLoop);
    else { looping = false; lastT = 0; }
  }
  function startHold(e) {
    if (holdDone) return;
    if (e) { e.preventDefault(); try { holdBtn.setPointerCapture(e.pointerId); } catch (_) {} }
    holding = true;
    holdBtn.classList.add('holding');
    if (!looping) { looping = true; lastT = 0; requestAnimationFrame(holdLoop); }
  }
  function stopHold() { holding = false; holdBtn.classList.remove('holding'); }
  holdBtn.addEventListener('pointerdown', startHold);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => holdBtn.addEventListener(ev, stopHold));
  holdBtn.addEventListener('contextmenu', e => e.preventDefault());
  holdBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); startHold(); } });
  holdBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stopHold(); });

  function completeHold() {
    holdDone = true;
    stopHold();
    const r = holdBtn.getBoundingClientRect();
    Sky.burst(r.left + r.width / 2, r.top + r.height / 2, 200);
    if (navigator.vibrate) navigator.vibrate([40, 80, 40, 80, 160]);
    $('#hold').classList.add('done');
    setTimeout(() => {
      $('#final').classList.add('show');
      $('#ending').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }, 450);
    setTimeout(() => Sky.burst(innerWidth * .18, innerHeight * .35, 70), 1500);
    setTimeout(() => Sky.burst(innerWidth * .82, innerHeight * .3, 70), 2100);
    setTimeout(() => Sky.burst(innerWidth * .5, innerHeight * .15, 90), 3600);
  }
  $('#again').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ───────────────────────── Сердечки от касаний ───────────────────────── */

  const HEART = '<svg viewBox="0 0 32 32"><path d="M16 28C7 21 2 16 2 10.5 2 6.4 5.2 3.5 9 3.5c2.9 0 5.2 1.7 7 4.3 1.8-2.6 4.1-4.3 7-4.3 3.8 0 7 2.9 7 7 0 5.5-5 10.5-14 17.5z"/></svg>';
  let lastTap = 0;
  document.addEventListener('pointerdown', e => {
    if (!opened || !lb.hidden) return;
    if (e.target.closest('button, a, video, .card, .pol, .li, .tile, .vframe, .cinema-frame, img[data-zoom], .film')) return;
    const now = performance.now();
    if (now - lastTap < 220) return;
    lastTap = now;
    for (let i = 0; i < 6; i++) {
      const h = document.createElement('span');
      h.className = 'tap-heart';
      h.innerHTML = HEART;
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 60;
      h.style.left = e.clientX + 'px';
      h.style.top = e.clientY + 'px';
      h.style.setProperty('--x', Math.cos(a) * d + 'px');
      h.style.setProperty('--y', Math.sin(a) * d - 40 + 'px');
      h.style.setProperty('--r', (Math.random() * 80 - 40) + 'deg');
      h.style.setProperty('--s', (.7 + Math.random() * .9).toFixed(2));
      document.body.append(h);
      setTimeout(() => h.remove(), 1300);
    }
  });
})();
