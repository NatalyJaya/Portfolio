/**
 * Shell — a dependency-free WebGL relief of the loading image.
 *
 * The flat picture becomes a 3D surface: brightness drives depth, so the
 * cyborg's white plating stands forward and the black background stays back.
 * The mesh is built as two halves (left/right) so it can open like a pair of
 * chest plates, each swinging on its outer edge.
 *
 * The renderer is deliberately dumb: the component owns the timeline and
 * passes a `ShellFrame` every animation frame.
 *
 *  - scan:   0..1 — how far the load "scan" has travelled top → bottom.
 *            Above the scan line the image is shown; below it, only the
 *            relief's contour lines.
 *  - open:   0..1 — the two halves swinging apart.
 *  - seam:   0..1 — cyan light along the centre split, just before opening.
 *  - intro:  0..1 — the relief rising out of the flat plane.
 */

export type ShellFrame = {
  time: number; // seconds
  scan: number;
  open: number;
  seam: number;
  intro: number;
  alpha: number;
  rotX: number;
  rotY: number;
  zoom: number;
};

export type ShellRenderer = {
  render: (f: ShellFrame) => void;
  resize: () => void;
  destroy: (releaseContext: boolean) => void;
};

const COLS_PER_HALF = 64;
const ROWS = 72;
const CAM_Z = 3;
const FOV_HALF = (20 * Math.PI) / 180;

const VERT = `
attribute vec2 aPos;
attribute vec2 aUv;
attribute float aDepth;
attribute float aSide;

uniform float uScale;
uniform float uAspect;
uniform float uHalfW;
uniform float uOpen;
uniform float uIntro;
uniform float uTime;
uniform vec2 uRot;

varying vec2 vUv;
varying float vDepth;

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

void main() {
  vUv = aUv;
  vDepth = aDepth;

  // relief: rises with the intro, breathes very slightly afterwards
  float z = aDepth * 0.34 * uIntro * (1.0 + 0.04 * sin(uTime * 1.3 + aPos.y * 3.0));
  vec3 p = vec3(aPos, z);

  // opening: each half swings on its outer edge, inner edges toward the viewer
  float o = uOpen;
  float hinge = aSide * uHalfW;
  p.x -= hinge;
  p = rotY(aSide * o * 1.75) * p;
  p.x += hinge + aSide * o * uHalfW * 0.9;
  p.z += o * (0.35 + aDepth * 0.9);

  p = rotY(uRot.y) * rotX(uRot.x) * p;
  p *= uScale;

  // perspective camera on +z looking at the origin
  float f = 1.0 / tan(${FOV_HALF.toFixed(6)});
  float zc = p.z - ${CAM_Z.toFixed(1)};
  float near = 0.1;
  float far = 20.0;
  gl_Position = vec4(
    p.x * f / uAspect,
    p.y * f,
    zc * (far + near) / (near - far) + (2.0 * far * near) / (near - far),
    -zc
  );
}
`;

const FRAG = `
precision mediump float;

uniform sampler2D uTex;
uniform float uScan;
uniform float uSeam;
uniform float uAlpha;
uniform float uFlicker; // own uniform: precision must match if shared across stages

varying vec2 vUv;
varying float vDepth;

void main() {
  vec3 cyan = vec3(0.435, 0.867, 0.902);
  vec3 violet = vec3(0.663, 0.608, 1.0);

  // crush the frame's dark grey to black so only the body carries light
  vec3 tex = clamp((texture2D(uTex, vUv).rgb - 0.08) / 0.92, 0.0, 1.0);
  float lum = dot(tex, vec3(0.299, 0.587, 0.114));

  // cool, slightly desaturated plate — sits with the site's ink and accents
  vec3 img = mix(tex, vec3(lum) * vec3(0.9, 0.97, 1.06), 0.3);
  img *= 0.84 + 0.16 * sin(gl_FragCoord.y * 2.094); // fine raster lines

  // contour lines of the relief (what the scan hasn't reached yet)
  float k = fract(vDepth * 16.0);
  float iso = 1.0 - smoothstep(0.0, 0.09, min(k, 1.0 - k));
  float body = smoothstep(0.06, 0.2, vDepth);
  vec3 holo = mix(violet, cyan, vUv.y) * iso * body * 0.55 + cyan * body * 0.035;

  // the scan travels top → bottom (uv.y = 0 is the top)
  float front = uScan * 1.06 - 0.03;
  float d = front - vUv.y;
  float scanned = smoothstep(0.0, 0.03, d);
  vec3 col = mix(holo, img, scanned);
  float live = step(uScan, 0.999);
  col += cyan * exp(-abs(d) * 70.0) * (0.25 + lum) * 0.9 * live;

  // light along the centre split
  col += cyan * exp(-abs(vUv.x - 0.5) * 140.0) * uSeam * (0.6 + 0.4 * sin(uFlicker + vUv.y * 40.0));

  // feather the rectangle so the plate has no hard edge
  float e = smoothstep(0.0, 0.07, vUv.x) * smoothstep(1.0, 0.93, vUv.x)
          * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

  // black drops out → only the lit body remains once the doors part
  float a = clamp(max(max(col.r, col.g), col.b) * 1.6, 0.0, 1.0) * e * uAlpha;
  gl_FragColor = vec4(col * e * uAlpha, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[shell] shader:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/** Brightness → depth, sampled on the mesh grid and softened. */
function depthGrid(img: HTMLImageElement, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return new Float32Array(w * h);
  ctx.drawImage(img, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  let d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const l = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
    d[i] = Math.pow(Math.max(0, (l - 0.1) / 0.9), 0.8);
  }
  // two passes of a 3×3 box blur keep the surface smooth
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let n = 0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const xx = x + i;
            const yy = y + j;
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
            sum += d[yy * w + xx];
            n++;
          }
        }
        out[y * w + x] = sum / n;
      }
    }
    d = out;
  }
  return d;
}

export function createShellRenderer(canvas: HTMLCanvasElement, img: HTMLImageElement): ShellRenderer | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[shell] link:", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  // ------------------------------------------------------------- geometry
  const aspect = img.naturalWidth / img.naturalHeight || 1.75;
  const halfW = aspect / 2;
  const gw = COLS_PER_HALF * 2 + 1;
  const gh = ROWS + 1;
  const depth = depthGrid(img, gw, gh);

  const vertsPerHalf = (COLS_PER_HALF + 1) * gh;
  const data = new Float32Array(vertsPerHalf * 2 * 6); // pos2 uv2 depth side
  const idx = new Uint16Array(COLS_PER_HALF * ROWS * 6 * 2);
  let v = 0;
  let ii = 0;
  for (let half = 0; half < 2; half++) {
    const side = half === 0 ? -1 : 1;
    const c0 = half * COLS_PER_HALF;
    const base = half * vertsPerHalf;
    for (let r = 0; r < gh; r++) {
      for (let c = 0; c <= COLS_PER_HALF; c++) {
        const gx = c0 + c;
        const u = gx / (gw - 1);
        const t = r / ROWS;
        data[v++] = (u - 0.5) * aspect;
        data[v++] = 0.5 - t;
        data[v++] = u;
        data[v++] = t;
        data[v++] = depth[r * gw + gx];
        data[v++] = side;
      }
    }
    const stride = COLS_PER_HALF + 1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS_PER_HALF; c++) {
        const a = base + r * stride + c;
        const b = a + 1;
        const d = a + stride;
        const e = d + 1;
        idx[ii++] = a;
        idx[ii++] = d;
        idx[ii++] = b;
        idx[ii++] = b;
        idx[ii++] = d;
        idx[ii++] = e;
      }
    }
  }

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  const F = 4;
  const attr = (name: string, size: number, offset: number) => {
    const loc = gl.getAttribLocation(prog, name);
    if (loc < 0) return;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 6 * F, offset * F);
  };
  attr("aPos", 2, 0);
  attr("aUv", 2, 2);
  attr("aDepth", 1, 4);
  attr("aSide", 1, 5);

  // -------------------------------------------------------------- texture
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = {
    tex: u("uTex"),
    scale: u("uScale"),
    aspect: u("uAspect"),
    halfW: u("uHalfW"),
    open: u("uOpen"),
    intro: u("uIntro"),
    time: u("uTime"),
    flicker: u("uFlicker"),
    rot: u("uRot"),
    scan: u("uScan"),
    seam: u("uSeam"),
    alpha: u("uAlpha"),
  };
  gl.uniform1i(U.tex, 0);
  gl.uniform1f(U.halfW, halfW);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  // ------------------------------------------------------------ viewport
  let vw = 1;
  let vh = 1;
  let fit = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = Math.max(1, rect.width);
    vh = Math.max(1, rect.height);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    // displayed height of the plate, in px → world scale at the focal plane
    const widthShare = vw < 640 ? 0.94 : 0.8; // matches .shell-fallback
    const targetH = Math.min((vw * widthShare) / aspect, vh * 0.56, 560);
    const visibleH = 2 * CAM_Z * Math.tan(FOV_HALF);
    fit = (targetH / vh) * visibleH;
  }
  resize();

  return {
    resize,
    render(f) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(U.scale, fit * f.zoom);
      gl.uniform1f(U.aspect, vw / vh);
      gl.uniform1f(U.open, f.open);
      gl.uniform1f(U.intro, f.intro);
      gl.uniform1f(U.time, f.time);
      gl.uniform1f(U.flicker, (f.time * 30) % (Math.PI * 2));
      gl.uniform2f(U.rot, f.rotX, f.rotY);
      gl.uniform1f(U.scan, f.scan);
      gl.uniform1f(U.seam, f.seam);
      gl.uniform1f(U.alpha, f.alpha);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    },
    destroy(releaseContext) {
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // A lost context can't be recreated on the same canvas, so only release
      // it when the sequence is over for good.
      if (releaseContext) gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
