#!/usr/bin/env node
/*
 * System Design PG — render pipeline.
 * For each .md: extract ```mermaid fence(s) -> <slug>.mmd, render the diagram to
 * inline SVG, build a styled <slug>.pdf via the system Chrome/Edge.
 * No .png / .html / .svg is left behind.
 *
 * Usage: node md2pdf.js <file-or-dir> [more...]
 *   - a directory => every *.md inside it
 *   - file(s)     => those .md files
 * Env: CHROME_PATH overrides browser auto-detection.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync, execFileSync } = require("child_process");

const SCRIPT_DIR = __dirname;

// ---------- 1. bootstrap node deps (no Chromium download) ----------
function ensureDeps() {
  if (fs.existsSync(path.join(SCRIPT_DIR, "node_modules", "markdown-it"))) return;
  console.log("[system-design-pg] instalando deps de render (uma vez)…");
  execSync("npm install --no-audit --no-fund --loglevel=error", {
    cwd: SCRIPT_DIR,
    stdio: "inherit",
    env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true" },
  });
}

// ---------- 2. locate Chrome / Edge ----------
function findBrowser() {
  const env = process.env.CHROME_PATH;
  if (env && fs.existsSync(env)) return env;
  const LA = process.env.LOCALAPPDATA || "";
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    LA && path.join(LA, "Google/Chrome/Application/chrome.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error(
    "Chrome/Edge não encontrado. Instale o Chrome ou aponte CHROME_PATH para o executável."
  );
}

ensureDeps();
const MarkdownIt = require(path.join(SCRIPT_DIR, "node_modules", "markdown-it"));
const BROWSER = findBrowser();
const CSS = fs.readFileSync(path.join(SCRIPT_DIR, "doc.css"), "utf8");

// puppeteer config so mmdc drives the same system browser
const PP_CONFIG = path.join(os.tmpdir(), "sdpg-puppeteer.json");
fs.writeFileSync(
  PP_CONFIG,
  JSON.stringify({ executablePath: BROWSER, args: ["--no-sandbox", "--disable-gpu"] })
);
const MMDC = path.join(
  SCRIPT_DIR, "node_modules", ".bin", process.platform === "win32" ? "mmdc.cmd" : "mmdc"
);

let _n = 0;
function tmp(ext) {
  _n += 1;
  return path.join(os.tmpdir(), `sdpg-${process.pid}-${_n}.${ext}`);
}

// ---------- 3. mermaid -> inline SVG ----------
function mermaidToSvg(code) {
  const inFile = tmp("mmd");
  const outFile = tmp("svg");
  fs.writeFileSync(inFile, code, "utf8");
  execSync(`"${MMDC}" -i "${inFile}" -o "${outFile}" -p "${PP_CONFIG}"`, {
    stdio: "ignore",
    env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true" },
  });
  let svg = fs.readFileSync(outFile, "utf8");
  for (const f of [inFile, outFile]) try { fs.unlinkSync(f); } catch {}
  svg = svg
    .replace(/<\?xml[^>]*\?>/i, "")
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/style="max-width:[^"]*"/i, ""); // let CSS size it to the page
  return svg.trim();
}

// ---------- 4. inline raster fallback (only if author used ![](x.png)) ----------
function inlineImages(html, baseDir) {
  return html.replace(/src="([^"]+)"/g, (m, src) => {
    if (/^(https?:|data:)/.test(src)) return m;
    const file = path.resolve(baseDir, src);
    if (!fs.existsSync(file)) return m;
    const ext = path.extname(file).slice(1).toLowerCase();
    const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
    return `src="data:${mime};base64,${fs.readFileSync(file).toString("base64")}"`;
  });
}

// ---------- 5. render one .md ----------
function renderDoc(mdPath) {
  const dir = path.dirname(mdPath);
  const name = path.basename(mdPath, ".md");
  const src = fs.readFileSync(mdPath, "utf8");

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

  // extract mermaid fences for the standalone .mmd
  const mermaids = md.parse(src, {})
    .filter((t) => t.type === "fence" && (t.info || "").trim().toLowerCase() === "mermaid")
    .map((t) => t.content.trim());
  if (mermaids.length) {
    fs.writeFileSync(path.join(dir, name + ".mmd"), mermaids.join("\n\n") + "\n", "utf8");
  }

  // render mermaid fences as inline SVG
  const baseFence = md.renderer.rules.fence ||
    ((t, i, o, e, s) => s.renderToken(t, i, o));
  md.renderer.rules.fence = function (tokens, idx, opts, env, self) {
    if ((tokens[idx].info || "").trim().toLowerCase() === "mermaid") {
      return `<div class="diagram">${mermaidToSvg(tokens[idx].content)}</div>`;
    }
    return baseFence(tokens, idx, opts, env, self);
  };

  const body = inlineImages(md.render(src), dir);
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>${name}</title><style>${CSS}</style></head>
<body><main class="doc">${body}</main></body></html>`;
  const htmlPath = path.join(dir, name + ".__sdpg__.html");
  const pdfPath = path.join(dir, name + ".pdf");
  fs.writeFileSync(htmlPath, html, "utf8");

  execSync(
    `"${BROWSER}" --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer ` +
    `--print-to-pdf-no-header --print-to-pdf="${pdfPath}" ` +
    `"file:///${htmlPath.replace(/\\/g, "/")}"`,
    { stdio: "ignore" }
  );
  try { fs.unlinkSync(htmlPath); } catch {}

  const kb = Math.round(fs.statSync(pdfPath).size / 1024);
  const extra = mermaids.length ? ` + ${name}.mmd` : "";
  console.log(`ok ${name}.pdf (${kb} KB)${extra}`);
}

// ---------- 6. resolve targets ----------
function collect(args) {
  const out = [];
  for (const a of args) {
    const p = path.resolve(a);
    if (!fs.existsSync(p)) { console.error(`aviso: não existe — ${a}`); continue; }
    if (fs.statSync(p).isDirectory()) {
      for (const f of fs.readdirSync(p)) if (f.toLowerCase().endsWith(".md")) out.push(path.join(p, f));
    } else if (p.toLowerCase().endsWith(".md")) {
      out.push(p);
    }
  }
  return out;
}

const targets = collect(process.argv.slice(2));
if (!targets.length) {
  console.error("uso: node md2pdf.js <pasta-ou-arquivos.md>");
  process.exit(1);
}
for (const t of targets) renderDoc(t);
