(() => {
  const hero = document.getElementById('accueil');
  const topo = document.getElementById('ih-topo');
  const glc = document.getElementById('ih-gl');
  const loader = document.getElementById('ih-loader');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hero) return;
  const nav = document.getElementById('nav');
  let seen = false;
  try { seen = sessionStorage.getItem('tm-intro') === '1'; sessionStorage.setItem('tm-intro', '1'); } catch (e) {}
  const quick = seen || reduce;
  if (quick) loader.classList.add('is-skip'); else document.body.classList.add('ih-loading');
  let codeText = '';

  const noise = (() => {
    const p = new Uint8Array(512);
    const perm = [...Array(256).keys()].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y) => ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
    return (x, y) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x); y -= Math.floor(y);
      const u = fade(x), v = fade(y), a = p[X] + Y, b = p[X + 1] + Y;
      const l1 = grad(p[a], x, y) + u * (grad(p[b], x - 1, y) - grad(p[a], x, y));
      const l2 = grad(p[a + 1], x, y - 1) + u * (grad(p[b + 1], x - 1, y - 1) - grad(p[a + 1], x, y - 1));
      return l1 + v * (l2 - l1);
    };
  })();

  const drawTopo = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = hero.clientWidth, H = hero.clientHeight;
    topo.width = W * dpr; topo.height = H * dpr;
    const ctx = topo.getContext('2d');
    ctx.scale(dpr, dpr);
    const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.7);
    g.addColorStop(0, '#05424d'); g.addColorStop(1, '#022830');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const step = 10, cols = Math.ceil(W / step) + 1, rows = Math.ceil(H / step) + 1;
    const f = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * step / 260, y = j * step / 260;
      f[j * cols + i] = noise(x, y) * 0.75 + noise(x * 2.1 + 7, y * 2.1 + 3) * 0.25;
    }
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const v = f[j * cols + i];
    }
    ctx.save(); ctx.filter = 'blur(40px)';
    for (let q = 0; q < 5; q++) { ctx.fillStyle = 'rgba(143,255,224,0.035)'; ctx.beginPath(); ctx.ellipse(W * (0.1 + q * 0.21), H * (0.25 + (q % 2) * 0.5), W * 0.12, H * 0.2, q, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.lineWidth = 1;
    for (let lv = -0.6; lv <= 0.6; lv += 0.075) {
      ctx.strokeStyle = Math.abs(lv) < 0.01 ? 'rgba(143,255,224,0.16)' : 'rgba(143,255,224,0.075)';
      ctx.beginPath();
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const a = f[j * cols + i], b = f[j * cols + i + 1], c = f[(j + 1) * cols + i + 1], d = f[(j + 1) * cols + i];
        const x = i * step, y = j * step;
        const pts = [];
        const edge = (p, q, x1, y1, x2, y2) => { if ((p < lv) !== (q < lv)) { const t = (lv - p) / (q - p); pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); } };
        edge(a, b, x, y, x + step, y); edge(b, c, x + step, y, x + step, y + step); edge(d, c, x, y + step, x + step, y + step); edge(a, d, x, y, x, y + step);
        if (pts.length >= 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); }
        if (pts.length === 4) { ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); }
      }
      ctx.stroke();
    }
  };

  const photo = document.getElementById('ih-photo');
  let progress = 0;
  const bar = document.getElementById('ih-bar'), pct = document.getElementById('ih-pct');
  const tick = setInterval(() => {
    progress = Math.min(progress + 0.07 + Math.random() * 0.08, photo.complete && document.fonts.status === 'loaded' ? 1 : 0.85);
    bar.style.setProperty('--p', progress);
    pct.textContent = Math.round(progress * 100) + '%';
  }, 90);

  const ready = Promise.all([fetch('assets/data/code.txt').then((r) => r.text()).then((t) => { codeText = t; }).catch(() => { codeText = 'const tristan = { formation: "BUT Informatique" };'; }), new Promise((r) => { if (photo.complete) r(); else photo.onload = r; }).then(() => photo.decode && photo.decode().catch(() => {})), document.fonts.ready, document.fonts.load('700 12px "JetBrains Mono"')]);

  const gl = glc.getContext('webgl', { premultipliedAlpha: true, antialias: false });
  if (!gl) document.documentElement.classList.add('no-webgl');

  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `precision highp float;
uniform sampler2D uCode;uniform vec2 uRes;uniform vec4 uRect;uniform vec3 uB[10];uniform float uDpr;uniform float uT;uniform vec2 uCell;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;
  vec2 uv=(p-uRect.xy)/uRect.zw;
  vec2 zuv=uv;
  bool inside=zuv.x>0.&&zuv.x<1.&&zuv.y>0.&&zuv.y<1.;
    vec2 id=floor(zuv/uCell);float h=hash(id);
  float ph=floor(uT*(.8+h*2.6)+h*9.);
  float pick=step(.55,hash(id+ph*1.37));
  vec4 cd=inside?texture2D(uCode,vec2(zuv.x,zuv.y*.5+pick*.5)):vec4(0.);
  float scan=exp(-pow((zuv.y-fract(uT*.18))*22.,2.));
  cd.rgb+=vec3(.561,1.,.878)*scan*.22*cd.a;
  float f=0.;
  for(int i=0;i<10;i++){vec2 d=p-uB[i].xy;f+=uB[i].z*uB[i].z/(dot(d,d)+1.);}
  float m=smoothstep(.95,1.05,f);
  float rim=(smoothstep(.93,.97,f)-smoothstep(.97,1.01,f));
  vec4 col=cd*m;
  vec3 mint=vec3(.561,1.,.878);
  col.rgb=col.rgb*(1.-rim)+mint*rim;col.a=max(col.a,rim);
  gl_FragColor=vec4(col.rgb,col.a);
}`;

  let prog, uni = {}, texPhoto, texCode, rect = [0, 0, 1, 1], dpr = 1;
  const makeTex = (src) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const setup = () => {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uCode', 'uRes', 'uRect', 'uB', 'uDpr', 'uT', 'uCell'].forEach((n) => { uni[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1i(uni.uCode, 1);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  };

  let cellUV = [1, 1];
  const buildCode = () => {
    const W = Math.round(rect[2] * dpr), H = Math.round(rect[3] * dpr);
    const c = document.createElement('canvas'); c.width = W; c.height = H * 2;
    const ctx = c.getContext('2d');
    const cell = Math.max(6, Math.round(rect[3] / 118)) * dpr;
    const cw = cell * 0.62;
    const cols = Math.ceil(W / cw), rows = Math.ceil(H / cell);
    cellUV = [cw / W, cell / H];
    const s = document.createElement('canvas'); s.width = cols; s.height = rows;
    const sx = s.getContext('2d', { willReadFrequently: true });
    sx.drawImage(photo, 0, 0, cols, rows);
    const px = sx.getImageData(0, 0, cols, rows).data;
    ctx.fillStyle = '#021a20'; ctx.fillRect(0, 0, W, H * 2);
    ctx.font = `700 ${cell}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';
    const code = codeText || 'TristanMuller';
    for (let v2 = 0; v2 < 2; v2++) {
      let k = v2 * 7919;
      const oy = v2 * H;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const o = (j * cols + i) * 4, a = px[o + 3] / 255;
        const lum = (0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2]) / 255;
        const ch = code[k++ % code.length];
        const x = i * cw, y = oy + j * cell;
        if (y + cell > oy + H) continue;
        if (a > 0.5) {
          const v = Math.min(1, Math.pow(lum, 1.35) * 1.35);
          ctx.fillStyle = `rgb(${Math.round(2 + v * 18)},${Math.round(26 + v * 70)},${Math.round(32 + v * 64)})`;
          ctx.fillRect(x, y, cw + 1, cell + 1);
          ctx.fillStyle = v > 0.72 ? `rgba(234,251,246,${(0.55 + v * 0.45).toFixed(3)})` : `rgba(143,255,224,${(0.18 + v * 0.95).toFixed(3)})`;
        } else ctx.fillStyle = 'rgba(143,255,224,0.12)';
        ctx.fillText(ch, x, y);
      }
    }
    if (texCode) gl.deleteTexture(texCode);
    gl.activeTexture(gl.TEXTURE1); texCode = makeTex(c); gl.activeTexture(gl.TEXTURE0);
  };

  const ghost = document.getElementById('ih-ghost');
  const stage = document.getElementById('ih-stage');
  const fades = [...document.querySelectorAll('.ih__card, .ih__side, .ih__hint')];
  let sp = -1;
  const onScroll = () => {
    if (nav && !document.getElementById('menu').classList.contains('is-open')) nav.classList.toggle('is-shown', scrollY > hero.clientHeight * 0.6);
    const p = Math.min(1, Math.max(0, scrollY / (hero.clientHeight * 0.65)));
    if (Math.abs(p - sp) < 0.001) return;
    sp = p;
    const e = 1 - Math.pow(1 - p, 2);
    stage.style.transform = reduce ? '' : `translateY(${-e * 7}%) scale(${1 - e * 0.2})`;
    stage.style.opacity = String(1 - e * 0.55);
    fades.forEach((el) => { el.style.opacity = String(Math.max(0, 1 - p * 2.2)); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  const menuBtn = document.getElementById('ih-menu');
  if (menuBtn && nav) menuBtn.addEventListener('click', () => {
    nav.classList.add('is-shown');
    const b = document.getElementById('burger');
    if (b && !document.getElementById('menu').classList.contains('is-open')) b.click();
    if (b) b.focus();
  });

  const layout = () => {
    drawTopo();
    if (!gl) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    const W = hero.clientWidth, H = hero.clientHeight;
    glc.width = W * dpr; glc.height = H * dpr;
    gl.viewport(0, 0, glc.width, glc.height);
    const narrow = W < 820;
    let h = H * (narrow ? 0.7 : 0.93), w = h * (photo.naturalWidth / photo.naturalHeight);
    if (w > W * 1.05) { w = W * 1.05; h = w * (photo.naturalHeight / photo.naturalWidth); }
    rect = [(W - w) / 2, H - h - (narrow ? H * 0.17 : 0), w, h];
    photo.style.height = h + 'px';
    photo.style.bottom = (narrow ? H * 0.17 : 0) + 'px';
    buildCode();
  };

  const N = 10;
  const ptr = { x: 0, y: 0, active: false, last: 0 };
  hero.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const k = r.width / hero.clientWidth || 1;
    ptr.x = (e.clientX - r.left) / k; ptr.y = (e.clientY - r.top) / k; ptr.active = true; ptr.last = performance.now();
    document.getElementById('ih-hint').classList.add('is-off');
  });
  hero.addEventListener('pointerleave', () => { ptr.active = false; });

  let t0 = 0, intro = 0, vel = 0, curSize = 0;
  const hist = [];
  const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;
    const s = rect[3] / 900 * (hero.clientWidth < 820 ? 1.3 : 1);
    const fx = rect[0] + rect[2] * 0.5, fy = rect[1] + rect[3] * 0.33;
    let tx, ty, size;
    const user = ptr.active && now - ptr.last < 5000;
    let demo = false;
    if (reduce) { tx = fx; ty = fy; size = 0; }
    else if (user) { tx = ptr.x; ty = ptr.y; size = 1; }
    else {
      const since = Math.max(0, t - (ptr.last ? (ptr.last - t0) / 1000 + 5 : 0.3));
      const cyc = since % 6.5;
      const u = Math.min(cyc / 3.4, 1);
      const e = easeIO(u);
      const a = e * Math.PI * 2 - 0.6;
      tx = fx + Math.sin(a) * rect[2] * 0.19; ty = fy + Math.sin(a * 2) * rect[3] * 0.07;
      size = cyc < 3.4 ? Math.min(1, Math.sin(u * Math.PI) * 1.6) : 0;
      demo = cyc < 3.7;
      if (cyc >= 3.4) { const k = Math.min((cyc - 3.4) / 3.1, 1); tx = fx + Math.sin(-0.6) * rect[2] * 0.19 * k + (tx - fx) * (1 - k); }
    }
    ghost.classList.toggle('is-on', demo);
    if (demo) ghost.style.transform = `translate(${tx}px, ${ty}px)`;
    hist.unshift([tx, ty]); hist.length = 48;
    const head = hist[0], prev = hist[3] || head;
    const speed = Math.hypot(head[0] - prev[0], head[1] - prev[1]);
    vel += (Math.min(speed / 40, 1) - vel) * 0.08;
    curSize += (size * (0.55 + vel * 0.6) - curSize) * 0.1;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < 6; i++) {
      const h = hist[Math.min(i * 4, hist.length - 1)] || head;
      const wob = Math.sin(t * 2.2 + i * 1.7) * 6 * s;
      const r = curSize * s * 50 * Math.pow(0.84, i) * (1 + 0.1 * Math.sin(t * 3 + i));
      arr.set([h[0] + wob, h[1] - wob * 0.6, Math.max(0, r)], i * 3);
    }
    for (let q = 0; q < 2; q++) {
      const h = hist[Math.min(10 + q * 8, hist.length - 1)] || head;
      const ang = t * (0.7 + q * 0.35) * (q ? -1 : 1) + q * 2.6;
      const dist = s * (115 + q * 30);
      const cx = h[0] + Math.cos(ang) * dist, cy = h[1] + Math.sin(ang) * dist * 0.75;
      const pulse = Math.max(0, Math.sin(t * (1.1 + q * 0.4) + q * 2));
      const r = curSize * s * 30 * (0.35 + pulse * 0.9);
      arr.set([cx, cy, r], (6 + q * 2) * 3);
      arr.set([cx + Math.cos(ang * 2) * r * 0.9, cy + Math.sin(ang * 2) * r * 0.7, r * 0.72], (7 + q * 2) * 3);
    }
    if (!gl || !prog || scrollY > hero.clientHeight * 1.7) return;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uni.uRes, glc.width, glc.height);
    gl.uniform4f(uni.uRect, rect[0], rect[1], rect[2], rect[3]);
    gl.uniform3fv(uni.uB, arr);
    gl.uniform1f(uni.uDpr, dpr);
    gl.uniform1f(uni.uT, t);
    gl.uniform2f(uni.uCell, cellUV[0], cellUV[1]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texCode);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  ready.then(() => {
    if (gl) setup();
    layout();
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(layout, 150); });
    const finish = () => {
      clearInterval(tick); bar.style.setProperty('--p', 1); pct.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('is-out');
        document.body.classList.remove('ih-loading');
        hero.classList.add('is-ready');
        setTimeout(() => requestAnimationFrame(frame), quick ? 0 : 500);
      }, quick ? 0 : 350);
    };
    setTimeout(finish, quick ? 0 : 900);
    onScroll();
  });
})();
