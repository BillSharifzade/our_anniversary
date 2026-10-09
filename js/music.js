/* Музыка: наша песня (media/music.m4a); если она не загрузится — играет музыкальная шкатулка */
const Music = (() => {
  const el = document.getElementById('bgm');
  let fileOk = false, fileFailed = false;
  el.addEventListener('canplaythrough', () => { fileOk = true; }, { once: true });
  el.addEventListener('error', () => { fileFailed = true; }, { once: true });

  let ctx, master, reverb, dry, timer = null, nextTime = 0, step = 0;
  let using = null, on = false, ducked = false;
  const VOL = .5;

  const BPM = 66, EIGHTH = 60 / BPM / 2;
  // D — A — Bm — G, самая «влюблённая» последовательность
  const CHORDS = [
    { bass: 38, arp: [62, 66, 69, 74, 69, 66, 69, 74] },
    { bass: 45, arp: [61, 64, 69, 73, 69, 64, 69, 73] },
    { bass: 47, arp: [59, 62, 66, 71, 66, 62, 66, 71] },
    { bass: 43, arp: [59, 62, 67, 71, 67, 62, 67, 71] },
  ];
  // мелодия: [нота на 1-ю долю, нота на 3-ю долю] для 8 тактов
  const MELODY = [
    [78, 81], [76, 73], [74, 78], [74, 71],
    [81, 78], [76, 81], [78, 74], [79, 76],
  ];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function makeReverb(seconds) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const c = ctx.createConvolver();
    c.buffer = buf;
    return c;
  }

  function bell(midi, t, vel, decay) {
    const f = hz(midi);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vel, t + .006);
    env.gain.exponentialRampToValueAtTime(.0001, t + decay);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 4200;
    env.connect(lp); lp.connect(dry); lp.connect(reverb);
    [[1, 1], [2.003, .22], [3.01, .06], [4.2, .025]].forEach(([mul, g]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * mul;
      og.gain.value = g;
      o.connect(og); og.connect(env);
      o.start(t); o.stop(t + decay + .05);
    });
  }
  function bass(midi, t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.13, t + .08);
    g.gain.exponentialRampToValueAtTime(.0001, t + EIGHTH * 8);
    o.connect(g); g.connect(dry); g.connect(reverb);
    o.start(t); o.stop(t + EIGHTH * 8 + .1);
  }
  function pad(notes, t) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    const g = ctx.createGain();
    const len = EIGHTH * 8;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.022, t + 1.2);
    g.gain.linearRampToValueAtTime(.016, t + len);
    g.gain.linearRampToValueAtTime(0, t + len + 1.2);
    lp.connect(g); g.connect(reverb); g.connect(dry);
    notes.forEach(n => [-6, 6].forEach(det => {
      const o = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = hz(n); o.detune.value = det;
      o.connect(lp); o.start(t); o.stop(t + len + 1.3);
    }));
  }

  function tick() {
    while (nextTime < ctx.currentTime + .25) {
      const bar = Math.floor(step / 8) % 8, pos = step % 8;
      const ch = CHORDS[bar % 4];
      const human = (Math.random() - .5) * .012;
      const t = nextTime + human;
      bell(ch.arp[pos] - 12 * (pos % 4 === 0 && Math.random() < .3 ? 1 : 0), t, (pos === 0 ? .1 : .07) * (.85 + Math.random() * .3), 1.9);
      if (pos === 0) { bass(ch.bass, nextTime); pad([ch.arp[0], ch.arp[1], ch.arp[2]], nextTime); }
      if (pos === 0) bell(MELODY[bar][0], t + .01, .13, 2.8);
      if (pos === 4) bell(MELODY[bar][1], t + .01, .12, 2.8);
      if (pos === 7 && Math.random() < .25) bell(pick([81, 83, 86]), t, .05, 2.2);
      nextTime += EIGHTH;
      step++;
    }
  }
  const pick = a => a[(Math.random() * a.length) | 0];

  // контекст создаётся сразу в обработчике касания — иначе iPhone его не запустит
  function initCtx() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    dry = ctx.createGain(); dry.gain.value = .75; dry.connect(master);
    reverb = makeReverb(3.4);
    const wet = ctx.createGain(); wet.gain.value = .55;
    reverb.connect(wet); wet.connect(master);
    ctx.resume();
  }
  function startSynth() {
    if (!ctx || using === 'synth') return;
    el.pause();
    using = 'synth';
    nextTime = ctx.currentTime + .15;
    timer = setInterval(tick, 40);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(VOL * level(), ctx.currentTime + 3);
  }

  function fileVolume(target, ms) {
    const from = el.volume, t0 = performance.now();
    if (target > .05 && el.paused) el.play().catch(() => {});
    const go = now => {
      const k = Math.min(1, (now - t0) / ms);
      el.volume = from + (target - from) * k;
      if (k < 1) requestAnimationFrame(go);
      else if (target <= .05) el.pause(); // на iPhone громкость не меняется, поэтому просто пауза
    };
    requestAnimationFrame(go);
  }

  /* вызывается по нажатию на печать — браузеры разрешают звук только после касания */
  function start() {
    on = true;
    initCtx();
    if (fileFailed) return startSynth();
    el.volume = 0;
    const p = el.play();
    if (!p || !p.then) return startSynth();
    p.then(() => {
      if (using === 'synth') { el.pause(); return; }
      using = 'file';
      if (ctx) ctx.suspend();
      fileVolume(.8 * level(), 2500);
    }).catch(() => startSynth());
    // если файл долго грузится — не ждём, играет шкатулка
    setTimeout(() => { if (!using && !fileOk) startSynth(); }, 2500);
  }

  function level() { return !on ? 0 : ducked ? .06 : 1; }
  function apply() {
    if (using === 'synth' && ctx) {
      if (on && ctx.state === 'suspended') ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(VOL * level(), ctx.currentTime, .4);
      if (!on) setTimeout(() => { if (!on) ctx.suspend(); }, 1600);
    } else if (using === 'file') {
      fileVolume(.8 * level(), 700);
    }
  }
  function toggle() { on = !on; apply(); return on; }
  function duck(v) { ducked = v; apply(); }

  document.addEventListener('visibilitychange', () => {
    if (using !== 'synth' || !ctx) return;
    if (document.hidden) ctx.suspend();
    else if (on) { ctx.resume(); nextTime = Math.max(nextTime, ctx.currentTime + .1); }
  });

  return { start, toggle, duck, isOn: () => on };
})();
