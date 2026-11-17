(() => {
  const hero = document.getElementById('accueil');
  if (!hero) return;

  const stage = document.getElementById('ih-stage');
  const photo = document.getElementById('ih-photo');
  const topoCanvas = document.getElementById('ih-topo');
  const glCanvas = document.getElementById('ih-gl');
  const ghostCursor = document.getElementById('ih-ghost');
  const hint = document.getElementById('ih-hint');
  const loader = document.getElementById('ih-loader');
  const loaderBar = document.getElementById('ih-bar');
  const loaderPercent = document.getElementById('ih-pct');
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const burger = document.getElementById('burger');
  const heroMenuButton = document.getElementById('ih-menu');
  const fadingBlocks = [...document.querySelectorAll('.ih__card, .ih__side, .ih__hint')];

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE_BREAKPOINT = 820;
  const BLOB_COUNT = 10;
  const TRAIL_LENGTH = 48;
  const DEMO_CYCLE = 6.5;
  const DEMO_SWEEP = 3.4;
  const RELEASE_FADE_MS = 900;
  const FALLBACK_CODE = 'const tristan = { formation: "BUT Informatique" };';

  const isNarrow = () => hero.clientWidth < MOBILE_BREAKPOINT;
  const isMenuOpen = () => document.body.classList.contains('menu-open');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  function hasSeenIntro() {
    try {
      const seen = sessionStorage.getItem('tm-intro') === '1';
      sessionStorage.setItem('tm-intro', '1');
      return seen;
    } catch (error) {
      return false;
    }
  }

  const skipLoader = hasSeenIntro() || reducedMotion;
  if (skipLoader) {
    loader.classList.add('is-skip');
  } else {
    document.body.classList.add('ih-loading');
  }

  function createNoise() {
    const permutation = [...Array(256).keys()].sort(() => Math.random() - 0.5);
    const table = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      table[i] = permutation[i & 255];
    }

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const gradient = (hash, x, y) => (hash & 1 ? -x : x) + (hash & 2 ? -y : y);

    return (x, y) => {
      const cellX = Math.floor(x) & 255;
      const cellY = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);

      const u = fade(x);
      const v = fade(y);
      const a = table[cellX] + cellY;
      const b = table[cellX + 1] + cellY;

      const top =
        gradient(table[a], x, y) + u * (gradient(table[b], x - 1, y) - gradient(table[a], x, y));
      const bottom =
        gradient(table[a + 1], x, y - 1) +
        u * (gradient(table[b + 1], x - 1, y - 1) - gradient(table[a + 1], x, y - 1));
      return top + v * (bottom - top);
    };
  }

  const noise = createNoise();

  function drawTopography() {
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    topoCanvas.width = width * pixelRatio;
    topoCanvas.height = height * pixelRatio;

    const ctx = topoCanvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);

    const background = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      0,
      width * 0.5,
      height * 0.45,
      Math.max(width, height) * 0.7,
    );
    background.addColorStop(0, '#05424d');
    background.addColorStop(1, '#022830');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.filter = 'blur(40px)';
    ctx.fillStyle = 'rgba(143, 255, 224, 0.035)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(
        width * (0.1 + i * 0.21),
        height * (0.25 + (i % 2) * 0.5),
        width * 0.12,
        height * 0.2,
        i,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();

    const step = 10;
    const cols = Math.ceil(width / step) + 1;
    const rows = Math.ceil(height / step) + 1;
    const field = new Float32Array(cols * rows);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col * step) / 260;
        const y = (row * step) / 260;
        field[row * cols + col] = noise(x, y) * 0.75 + noise(x * 2.1 + 7, y * 2.1 + 3) * 0.25;
      }
    }

    ctx.lineWidth = 1;
    for (let level = -0.6; level <= 0.6; level += 0.075) {
      ctx.strokeStyle =
        Math.abs(level) < 0.01 ? 'rgba(143, 255, 224, 0.16)' : 'rgba(143, 255, 224, 0.075)';
      ctx.beginPath();
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          drawContourCell(ctx, field, cols, col, row, step, level);
        }
      }
      ctx.stroke();
    }
  }

  function drawContourCell(ctx, field, cols, col, row, step, level) {
    const topLeft = field[row * cols + col];
    const topRight = field[row * cols + col + 1];
    const bottomRight = field[(row + 1) * cols + col + 1];
    const bottomLeft = field[(row + 1) * cols + col];
    const x = col * step;
    const y = row * step;
    const points = [];

    const crossEdge = (valueA, valueB, x1, y1, x2, y2) => {
      if (valueA < level !== valueB < level) {
        const t = (level - valueA) / (valueB - valueA);
        points.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
      }
    };

    crossEdge(topLeft, topRight, x, y, x + step, y);
    crossEdge(topRight, bottomRight, x + step, y, x + step, y + step);
    crossEdge(bottomLeft, bottomRight, x, y + step, x + step, y + step);
    crossEdge(topLeft, bottomLeft, x, y, x, y + step);

    for (let i = 0; i + 1 < points.length; i += 2) {
      ctx.moveTo(points[i][0], points[i][1]);
      ctx.lineTo(points[i + 1][0], points[i + 1][1]);
    }
  }

  let loadProgress = 0;
  const progressTimer = setInterval(() => {
    const assetsLoaded = photo.complete && document.fonts.status === 'loaded';
    loadProgress = Math.min(loadProgress + 0.07 + Math.random() * 0.08, assetsLoaded ? 1 : 0.85);
    loaderBar.style.setProperty('--p', loadProgress);
    loaderPercent.textContent = Math.round(loadProgress * 100) + '%';
  }, 90);

  let codeText = '';

  function loadCodeText() {
    return fetch('assets/data/code.txt')
      .then((response) => response.text())
      .then((text) => {
        codeText = text;
      })
      .catch(() => {
        codeText = FALLBACK_CODE;
      });
  }

  function loadPhoto() {
    return new Promise((resolve) => {
      if (photo.complete) {
        resolve();
      } else {
        photo.onload = resolve;
      }
    }).then(() => (photo.decode ? photo.decode().catch(() => {}) : null));
  }

  const assetsReady = Promise.all([
    loadCodeText(),
    loadPhoto(),
    document.fonts.ready,
    document.fonts.load('700 12px "JetBrains Mono"'),
  ]);

  const VERTEX_SHADER = `
    attribute vec2 aPosition;

    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;

    uniform sampler2D uCode;
    uniform vec2 uResolution;
    uniform vec2 uOrigin;
    uniform vec4 uPhotoRect;
    uniform vec3 uBlobs[${BLOB_COUNT}];
    uniform float uPixelRatio;
    uniform float uTime;
    uniform vec2 uCell;

    const vec3 MINT = vec3(0.561, 1.0, 0.878);

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 point = uOrigin + vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uPixelRatio;
      vec2 uv = (point - uPhotoRect.xy) / uPhotoRect.zw;
      bool insidePhoto = uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0;

      vec2 cellId = floor(uv / uCell);
      float cellSeed = hash(cellId);
      float phase = floor(uTime * (0.8 + cellSeed * 2.6) + cellSeed * 9.0);
      float variant = step(0.55, hash(cellId + phase * 1.37));

      vec4 code = insidePhoto ? texture2D(uCode, vec2(uv.x, uv.y * 0.5 + variant * 0.5)) : vec4(0.0);
      float scanLine = exp(-pow((uv.y - fract(uTime * 0.18)) * 22.0, 2.0));
      code.rgb += MINT * scanLine * 0.22 * code.a;

      float field = 0.0;
      for (int i = 0; i < ${BLOB_COUNT}; i++) {
        vec2 delta = point - uBlobs[i].xy;
        field += uBlobs[i].z * uBlobs[i].z / (dot(delta, delta) + 1.0);
      }

      float mask = smoothstep(0.95, 1.05, field);
      float rim = smoothstep(0.93, 0.97, field) - smoothstep(0.97, 1.01, field);

      vec4 color = code * mask;
      color.rgb = color.rgb * (1.0 - rim) + MINT * rim;
      color.a = max(color.a, rim);
      gl_FragColor = color;
    }
  `;

  const gl = glCanvas.getContext('webgl', { premultipliedAlpha: true, antialias: false });
  if (!gl) document.documentElement.classList.add('no-webgl');

  const uniforms = {};
  let program = null;
  let codeTexture = null;
  let pixelRatio = 1;
  let photoRect = [0, 0, 1, 1];
  let canvasBox = [0, 0, 1, 1];
  let cellSize = [1, 1];

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function setupWebGL() {
    program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const names = [
      'uCode',
      'uResolution',
      'uOrigin',
      'uPhotoRect',
      'uBlobs',
      'uPixelRatio',
      'uTime',
      'uCell',
    ];
    names.forEach((name) => {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    gl.uniform1i(uniforms.uCode, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  function createTexture(source) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  function samplePhoto(cols, rows) {
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(photo, 0, 0, cols, rows);
    return ctx.getImageData(0, 0, cols, rows).data;
  }

  function buildCodeTexture() {
    const width = Math.round(photoRect[2] * pixelRatio);
    const height = Math.round(photoRect[3] * pixelRatio);
    const lineHeight = Math.max(6, Math.round(photoRect[3] / 118)) * pixelRatio;
    const charWidth = lineHeight * 0.62;
    const cols = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / lineHeight);
    cellSize = [charWidth / width, lineHeight / height];

    const pixels = samplePhoto(cols, rows);
    const code = codeText || FALLBACK_CODE;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#021a20';
    ctx.fillRect(0, 0, width, height * 2);
    ctx.font = `700 ${lineHeight}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';

    for (let variant = 0; variant < 2; variant++) {
      let charIndex = variant * 7919;
      const offsetY = variant * height;

      for (let row = 0; row < rows; row++) {
        const y = offsetY + row * lineHeight;
        if (y + lineHeight > offsetY + height) break;

        for (let col = 0; col < cols; col++) {
          const pixel = (row * cols + col) * 4;
          const alpha = pixels[pixel + 3] / 255;
          const luminance =
            (0.299 * pixels[pixel] + 0.587 * pixels[pixel + 1] + 0.114 * pixels[pixel + 2]) / 255;
          const x = col * charWidth;

          if (alpha > 0.5) {
            const brightness = Math.min(1, Math.pow(luminance, 1.35) * 1.35);
            const red = Math.round(2 + brightness * 18);
            const green = Math.round(26 + brightness * 70);
            const blue = Math.round(32 + brightness * 64);
            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.fillRect(x, y, charWidth + 1, lineHeight + 1);
            ctx.fillStyle =
              brightness > 0.72
                ? `rgba(234, 251, 246, ${(0.55 + brightness * 0.45).toFixed(3)})`
                : `rgba(143, 255, 224, ${(0.18 + brightness * 0.95).toFixed(3)})`;
          } else {
            ctx.fillStyle = 'rgba(143, 255, 224, 0.12)';
          }

          ctx.fillText(code[charIndex % code.length], x, y);
          charIndex = charIndex + 1;
        }
      }
    }

    if (codeTexture) gl.deleteTexture(codeTexture);
    gl.activeTexture(gl.TEXTURE1);
    codeTexture = createTexture(canvas);
    gl.activeTexture(gl.TEXTURE0);
  }

  const touchZone = document.createElement('div');
  touchZone.className = 'ih__touch';
  stage.appendChild(touchZone);

  let lastWidth = 0;
  let lastHeight = 0;
  let canvasIsBlank = false;

  function layout(force) {
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    const sameWidth = Math.abs(width - lastWidth) < 2;
    const onlyBrowserBarsMoved = Math.abs(height - lastHeight) < 160;
    if (!force && sameWidth && onlyBrowserBarsMoved) return;

    lastWidth = width;
    lastHeight = height;
    drawTopography();
    if (!gl) return;

    const narrow = isNarrow();
    const bottomOffset = narrow ? height * 0.17 : 0;
    const aspect = photo.naturalWidth / photo.naturalHeight;
    let photoHeight = height * (narrow ? 0.7 : 0.93);
    let photoWidth = photoHeight * aspect;
    if (photoWidth > width * 1.05) {
      photoWidth = width * 1.05;
      photoHeight = photoWidth / aspect;
    }

    photoRect = [
      (width - photoWidth) / 2,
      height - photoHeight - bottomOffset,
      photoWidth,
      photoHeight,
    ];
    photo.style.height = photoHeight + 'px';
    photo.style.bottom = bottomOffset + 'px';

    pixelRatio = Math.min(devicePixelRatio || 1, narrow ? 1.5 : 2);
    resizeCanvasAroundPhoto(width, height);
    placeTouchZone();
    buildCodeTexture();
    canvasIsBlank = false;
  }

  function resizeCanvasAroundPhoto(width, height) {
    const [photoX, photoY, photoWidth, photoHeight] = photoRect;
    const left = Math.max(0, photoX - photoWidth * 0.3);
    const top = Math.max(0, photoY - photoHeight * 0.05);
    const right = Math.min(width, photoX + photoWidth * 1.3);
    const bottom = Math.min(height, photoY + photoHeight * 0.8);
    canvasBox = [left, top, right - left, bottom - top];

    glCanvas.style.left = left + 'px';
    glCanvas.style.top = top + 'px';
    glCanvas.style.width = canvasBox[2] + 'px';
    glCanvas.style.height = canvasBox[3] + 'px';
    glCanvas.width = Math.round(canvasBox[2] * pixelRatio);
    glCanvas.height = Math.round(canvasBox[3] * pixelRatio);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
  }

  function placeTouchZone() {
    const [photoX, photoY, photoWidth, photoHeight] = photoRect;
    touchZone.style.left = photoX + photoWidth * 0.16 + 'px';
    touchZone.style.top = photoY + 'px';
    touchZone.style.width = photoWidth * 0.68 + 'px';
    touchZone.style.height = photoHeight * 0.6 + 'px';
  }

  const pointer = { x: 0, y: 0, active: false, lastMove: 0, releasedAt: 0 };
  let userTookOver = false;

  function hideHint() {
    hint.classList.add('is-off');
  }

  function movePointerTo(clientX, clientY) {
    const stageRect = stage.getBoundingClientRect();
    const stageScale = stageRect.width / hero.clientWidth || 1;
    pointer.x = (clientX - stageRect.left) / stageScale;
    pointer.y = (clientY - stageRect.top) / stageScale;
    pointer.active = true;
    pointer.lastMove = performance.now();
  }

  function releasePointer() {
    pointer.active = false;
    pointer.releasedAt = performance.now();
  }

  function stopDemo() {
    userTookOver = true;
    hideHint();
  }

  hero.addEventListener('pointermove', (event) => {
    movePointerTo(event.clientX, event.clientY);
    hideHint();
  });

  hero.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') releasePointer();
  });

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'mouse') stopDemo();
    },
    { passive: true },
  );

  function onTouch(event) {
    const touch = event.touches[0];
    if (!touch) return;
    movePointerTo(touch.clientX, touch.clientY);
    stopDemo();
  }

  touchZone.addEventListener('touchstart', onTouch, { passive: true });
  touchZone.addEventListener('touchmove', onTouch, { passive: true });
  touchZone.addEventListener('touchend', releasePointer, { passive: true });
  touchZone.addEventListener('touchcancel', releasePointer, { passive: true });

  let lastScrollProgress = -1;

  function onScroll() {
    if (nav && !menu.classList.contains('is-open')) {
      nav.classList.toggle('is-shown', scrollY > hero.clientHeight * 0.6);
    }

    const progress = clamp(scrollY / (hero.clientHeight * 0.65), 0, 1);
    if (Math.abs(progress - lastScrollProgress) < 0.001) return;
    lastScrollProgress = progress;

    const eased = 1 - Math.pow(1 - progress, 2);
    stage.style.transform = reducedMotion
      ? ''
      : `translateY(${-eased * 7}%) scale(${1 - eased * 0.2})`;
    stage.style.opacity = String(1 - eased * 0.55);
    fadingBlocks.forEach((block) => {
      block.style.opacity = String(Math.max(0, 1 - progress * 2.2));
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('menuclose', () => {
    lastScrollProgress = -1;
    onScroll();
    if (nav && scrollY <= hero.clientHeight * 0.6) nav.classList.remove('is-shown');
    setTimeout(startLoop, 50);
  });

  if (heroMenuButton && nav && burger) {
    heroMenuButton.addEventListener('click', () => {
      nav.classList.add('is-shown');
      if (!menu.classList.contains('is-open')) burger.click();
      burger.focus();
    });
  }

  const trail = [];
  let startTime = 0;
  let lastFrameTime = 0;
  let speed = 0;
  let revealSize = 0;
  let heroVisible = true;
  let loopRunning = false;

  const canAnimate = () => heroVisible && !document.hidden && !isMenuOpen();

  function startLoop() {
    if (loopRunning || !canAnimate()) return;
    loopRunning = true;
    lastFrameTime = 0;
    requestAnimationFrame(renderFrame);
  }

  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    startLoop();
  }).observe(hero);

  document.addEventListener('visibilitychange', startLoop);

  function getTarget(now, time) {
    const faceX = photoRect[0] + photoRect[2] * 0.5;
    const faceY = photoRect[1] + photoRect[3] * 0.33;

    if (reducedMotion) {
      return { x: faceX, y: faceY, size: 0, demo: false };
    }

    if (userTookOver || pointer.lastMove > 0) {
      const fadeAfterRelease = Math.max(0, 1 - (now - pointer.releasedAt) / RELEASE_FADE_MS);
      return {
        x: pointer.x,
        y: pointer.y,
        size: pointer.active ? 1 : fadeAfterRelease,
        demo: false,
      };
    }

    const cycleTime = Math.max(0, time - 0.3) % DEMO_CYCLE;
    const sweep = Math.min(cycleTime / DEMO_SWEEP, 1);
    const angle = easeInOutCubic(sweep) * Math.PI * 2 - 0.6;
    let x = faceX + Math.sin(angle) * photoRect[2] * 0.19;
    const y = faceY + Math.sin(angle * 2) * photoRect[3] * 0.07;
    let size = 0;

    if (cycleTime < DEMO_SWEEP) {
      size = Math.min(1, Math.sin(sweep * Math.PI) * 1.6);
    } else {
      const returnProgress = Math.min((cycleTime - DEMO_SWEEP) / (DEMO_CYCLE - DEMO_SWEEP), 1);
      const startX = faceX + Math.sin(-0.6) * photoRect[2] * 0.19;
      x = startX * returnProgress + x * (1 - returnProgress);
    }

    return { x, y, size, demo: cycleTime < DEMO_SWEEP + 0.3 };
  }

  function computeBlobs(time, scale) {
    const blobs = new Float32Array(BLOB_COUNT * 3);
    const head = trail[0];

    for (let i = 0; i < 6; i++) {
      const point = trail[Math.min(i * 4, trail.length - 1)] || head;
      const wobble = Math.sin(time * 2.2 + i * 1.7) * 6 * scale;
      const radius =
        revealSize * scale * 50 * Math.pow(0.84, i) * (1 + 0.1 * Math.sin(time * 3 + i));
      blobs.set([point[0] + wobble, point[1] - wobble * 0.6, Math.max(0, radius)], i * 3);
    }

    for (let i = 0; i < 2; i++) {
      const point = trail[Math.min(10 + i * 8, trail.length - 1)] || head;
      const direction = i === 0 ? 1 : -1;
      const angle = time * (0.7 + i * 0.35) * direction + i * 2.6;
      const distance = scale * (115 + i * 30);
      const centerX = point[0] + Math.cos(angle) * distance;
      const centerY = point[1] + Math.sin(angle) * distance * 0.75;
      const pulse = Math.max(0, Math.sin(time * (1.1 + i * 0.4) + i * 2));
      const radius = revealSize * scale * 30 * (0.35 + pulse * 0.9);
      const satelliteX = centerX + Math.cos(angle * 2) * radius * 0.9;
      const satelliteY = centerY + Math.sin(angle * 2) * radius * 0.7;

      blobs.set([centerX, centerY, radius], (6 + i * 2) * 3);
      blobs.set([satelliteX, satelliteY, radius * 0.72], (7 + i * 2) * 3);
    }

    return blobs;
  }

  function clearCanvas() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function draw(time, blobs) {
    clearCanvas();
    gl.uniform2f(uniforms.uResolution, glCanvas.width, glCanvas.height);
    gl.uniform2f(uniforms.uOrigin, canvasBox[0], canvasBox[1]);
    gl.uniform4f(uniforms.uPhotoRect, photoRect[0], photoRect[1], photoRect[2], photoRect[3]);
    gl.uniform3fv(uniforms.uBlobs, blobs);
    gl.uniform1f(uniforms.uPixelRatio, pixelRatio);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform2f(uniforms.uCell, cellSize[0], cellSize[1]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, codeTexture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function renderFrame(now) {
    if (!canAnimate()) {
      loopRunning = false;
      return;
    }
    requestAnimationFrame(renderFrame);

    const deltaTime = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.1) : 1 / 60;
    lastFrameTime = now;
    const smoothing = (factor) => 1 - Math.pow(1 - factor, deltaTime * 60);

    if (!startTime) startTime = now;
    const time = (now - startTime) / 1000;
    const scale = (photoRect[3] / 900) * (isNarrow() ? 1.3 : 1);

    const target = getTarget(now, time);
    ghostCursor.classList.toggle('is-on', target.demo);
    if (target.demo) ghostCursor.style.transform = `translate(${target.x}px, ${target.y}px)`;

    trail.unshift([target.x, target.y]);
    trail.length = TRAIL_LENGTH;

    const head = trail[0];
    const previous = trail[3] || head;
    const distance = Math.hypot(head[0] - previous[0], head[1] - previous[1]);
    speed += (Math.min(distance / 40, 1) - speed) * smoothing(0.08);
    revealSize += (target.size * (0.55 + speed * 0.6) - revealSize) * smoothing(0.14);

    if (!gl || !program) return;

    if (revealSize < 0.01) {
      if (!canvasIsBlank) {
        clearCanvas();
        canvasIsBlank = true;
      }
      return;
    }

    canvasIsBlank = false;
    draw(time, computeBlobs(time, scale));
  }

  function revealHero() {
    clearInterval(progressTimer);
    loaderBar.style.setProperty('--p', 1);
    loaderPercent.textContent = '100%';

    setTimeout(
      () => {
        loader.classList.add('is-out');
        setTimeout(() => loader.classList.add('is-skip'), 1200);
        document.body.classList.remove('ih-loading');
        hero.classList.add('is-ready');
        setTimeout(startLoop, skipLoader ? 0 : 500);
      },
      skipLoader ? 0 : 350,
    );
  }

  assetsReady.then(() => {
    if (gl) setupWebGL();
    layout(true);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => layout(false), 200);
    });

    setTimeout(revealHero, skipLoader ? 0 : 900);
    onScroll();
  });
})();
