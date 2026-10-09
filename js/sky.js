/* Небо за страницей: звёзды, листья, снег, лепестки, светлячки, сердечки, гипсофила */
const Sky = (() => {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, parts = [], mode = 'night', last = performance.now(), running = true;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];

  /* ── спрайты рисуются один раз, потом только копируются ── */
  function sprite(size, draw) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    g.translate(size / 2, size / 2);
    draw(g, size);
    return c;
  }
  const glowDot = (color, size = 64) => sprite(size, (g, s) => {
    const r = g.createRadialGradient(0, 0, 0, 0, 0, s / 2);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(.18, color);
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.beginPath(); g.arc(0, 0, s / 2, 0, Math.PI * 2); g.fill();
  });
  const leaf = (fill, vein, maple) => sprite(96, (g, s) => {
    const R = s * .42;
    g.fillStyle = fill; g.strokeStyle = vein; g.lineWidth = 2;
    g.beginPath();
    if (maple) {
      const k = s / 110;
      g.save(); g.scale(k, k); g.translate(-50, -52);
      g.fill(new Path2D('M50 2 L56 18 L66 12 L63 34 L78 22 L82 30 L96 28 L88 44 L96 50 L72 64 L76 74 L54 70 L53 84 L47 84 L46 70 L24 74 L28 64 L4 50 L12 44 L4 28 L18 30 L22 22 L37 34 L34 12 L44 18 Z'));
      g.lineWidth = 2.2;
      g.stroke(new Path2D('M50 96 L50 20 M50 58 L22 34 M50 58 L78 34 M50 66 L20 54 M50 66 L80 54'));
      g.restore();
    } else {
      g.moveTo(0, -R);
      g.quadraticCurveTo(R * .8, -R * .2, 0, R);
      g.quadraticCurveTo(-R * .8, -R * .2, 0, -R);
      g.fill();
      g.beginPath(); g.moveTo(0, -R * .85); g.lineTo(0, R * 1.05); g.stroke();
    }
  });
  const petal = (a, b) => sprite(64, (g, s) => {
    const R = s * .44;
    const gr = g.createLinearGradient(0, -R, 0, R);
    gr.addColorStop(0, a); gr.addColorStop(1, b);
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(0, -R * .7);
    g.bezierCurveTo(R * .5, -R * 1.05, R * .75, R * .3, 0, R);
    g.bezierCurveTo(-R * .75, R * .3, -R * .5, -R * 1.05, 0, -R * .7);
    g.fill();
  });
  const heart = color => sprite(64, (g, s) => {
    const k = s / 36;
    g.scale(k, k); g.translate(-16, -16);
    g.shadowColor = color; g.shadowBlur = 8;
    g.fillStyle = color;
    g.fill(new Path2D('M16 28C7 21 2 16 2 10.5 2 6.4 5.2 3.5 9 3.5c2.9 0 5.2 1.7 7 4.3 1.8-2.6 4.1-4.3 7-4.3 3.8 0 7 2.9 7 7 0 5.5-5 10.5-14 17.5z'));
  });
  const floret = () => sprite(64, (g, s) => {
    const R = s * .3;
    g.shadowColor = 'rgba(255,255,255,.8)'; g.shadowBlur = 6;
    const n = 5 + ((Math.random() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * .4, d = R * rand(.45, .95);
      g.fillStyle = Math.random() < .3 ? '#fff4ea' : '#ffffff';
      g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, R * rand(.28, .4), 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#f3e4c8';
    g.beginPath(); g.arc(0, 0, R * .3, 0, Math.PI * 2); g.fill();
  });

  const S = {
    star: [glowDot('rgba(255,236,200,.9)'), glowDot('rgba(200,215,255,.9)')],
    leaf: [
      leaf('#c8642b', '#8a3d17', true), leaf('#e09a3e', '#9b5f1b', true), leaf('#a8432a', '#6b2414', false),
      leaf('#d7b25a', '#8f7027', false), leaf('#b55a26', '#7a3510', true), leaf('#8d8a3a', '#55531d', false),
    ],
    snow: [glowDot('rgba(255,255,255,.85)'), glowDot('rgba(220,236,255,.8)')],
    petal: [petal('#ffffff', '#ffd1dc'), petal('#ffe3ea', '#f6a8bc'), petal('#fff8f0', '#f9d7e0'), petal('#f2fff0', '#d9efcf')],
    fire: [glowDot('rgba(255,205,90,.9)'), glowDot('rgba(255,170,60,.85)'), glowDot('rgba(255,230,150,.9)')],
    heart: [heart('#ff8fab'), heart('#ff5c86'), heart('#ffc2d1')],
    floret: [floret(), floret(), floret(), floret()],
  };

  /* ── поведение частиц для каждого времени года ── */
  const MODES = {
    night:  { n: 90,  make: () => Math.random() < .82 ? star() : flower(.5) },
    autumn: { n: 34,  make: () => ({ img: pick(S.leaf), size: rand(16, 32), vx: rand(-.25, .25), vy: rand(.55, 1.25), sway: rand(.6, 1.6), spin: rand(-.02, .02), flip: rand(.01, .03), a: rand(.75, 1) }) },
    winter: { n: 110, make: () => { const z = Math.random(); return { img: pick(S.snow), size: 3 + z * 9, vx: rand(-.15, .15), vy: .3 + z * .9, sway: rand(.2, .7), spin: 0, flip: 0, a: .35 + z * .6 }; } },
    spring: { n: 38,  make: () => ({ img: pick(S.petal), size: rand(10, 20), vx: rand(.25, .7), vy: rand(.35, .8), sway: rand(.4, 1.1), spin: rand(-.025, .025), flip: rand(.02, .045), a: rand(.7, .95) }) },
    summer: { n: 55,  make: () => ({ img: pick(S.fire), size: rand(6, 20), vx: rand(-.12, .12), vy: rand(-.45, -.12), sway: rand(.3, .9), spin: 0, flip: 0, a: rand(.4, .9), flick: rand(.02, .06) }) },
    love:   { n: 30,  make: () => ({ img: pick(S.heart), size: rand(9, 20), vx: rand(-.15, .15), vy: rand(-.5, -.2), sway: rand(.3, .9), spin: rand(-.01, .01), flip: 0, a: rand(.35, .75) }) },
    gyps:   { n: 60,  make: () => Math.random() < .3 ? star() : flower(1) },
  };
  function star() {
    return { img: pick(S.star), size: rand(2, 7), vx: 0, vy: rand(-.06, -.015), sway: 0, spin: 0, flip: 0, a: rand(.35, 1), flick: rand(.01, .04) };
  }
  function flower(k) {
    return { img: pick(S.floret), size: rand(9, 18) * (k < 1 ? .8 : 1), vx: rand(-.12, .12), vy: rand(.12, .4) * k, sway: rand(.3, .8), spin: rand(-.01, .01), flip: 0, a: rand(.55, .95) };
  }

  function count() {
    const k = Math.min(1.25, Math.max(.42, (W * H) / (1440 * 900)));
    return Math.round(MODES[mode].n * k * (reduce ? .35 : 1));
  }
  function spawn(anywhere) {
    const p = MODES[mode].make();
    p.mode = mode;
    p.x = rand(-20, W + 20);
    p.y = anywhere ? rand(-20, H + 20) : (p.vy < 0 ? H + 30 : -30);
    if (p.vx > .2 && !anywhere) { p.x = rand(-W * .4, W); }
    p.rot = rand(0, Math.PI * 2);
    p.t = rand(0, 1000);
    p.life = 0; p.fade = 0; p.dying = false;
    parts.push(p);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setMode(m) {
    if (!MODES[m] || m === mode) return;
    mode = m;
    parts.forEach(p => { if (!p.burst) p.dying = true; });
    const n = count();
    for (let i = 0; i < n; i++) spawn(true);
  }

  /* взрыв цветов и сердечек из точки — для финала */
  function burst(x, y, n = 140) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(2, 11);
      const kind = Math.random();
      parts.push({
        img: kind < .5 ? pick(S.floret) : kind < .8 ? pick(S.heart) : pick(S.petal),
        size: rand(10, 26), x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, sway: 0,
        spin: rand(-.08, .08), flip: rand(0, .05), a: 1, rot: rand(0, 6), t: 0, life: 0, fade: 1, burst: true, mode,
      });
    }
  }

  function frame(now) {
    const dt = Math.min(3, (now - last) / 16.67);
    last = now;
    ctx.clearRect(0, 0, W, H);
    const want = count();
    let alive = 0;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt; p.life += dt;
      if (p.burst) {
        p.vx *= Math.pow(.97, dt); p.vy = p.vy * Math.pow(.97, dt) + .09 * dt;
        p.fade -= .0045 * dt;
        if (p.fade <= 0) { parts.splice(i, 1); continue; }
      } else if (p.dying) {
        p.fade -= .022 * dt;
        if (p.fade <= 0) { parts.splice(i, 1); continue; }
      } else {
        p.fade = Math.min(1, p.fade + .02 * dt);
        alive++;
      }
      p.x += (p.vx + Math.sin(p.t * .02) * p.sway * .5) * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      if (!p.burst && !p.dying) {
        if (p.y > H + 40 || p.y < -40 || p.x > W + 60 || p.x < -60) { parts.splice(i, 1); alive--; continue; }
      }
      let a = p.a * p.fade;
      if (p.flick) a *= .55 + .45 * Math.sin(p.t * p.flick * 6 + p.x);
      if (a <= .01) continue;
      const sx = p.flip ? Math.cos(p.t * p.flip * 3) : 1;
      ctx.globalAlpha = a;
      ctx.setTransform(dpr * sx * Math.cos(p.rot), dpr * sx * Math.sin(p.rot), -dpr * Math.sin(p.rot), dpr * Math.cos(p.rot), p.x * dpr, p.y * dpr);
      ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    for (let k = alive; k < want; k++) spawn(false);
    if (running) requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(frame); }
  });
  for (let i = 0; i < count(); i++) spawn(true);
  requestAnimationFrame(frame);

  return { setMode, burst };
})();
