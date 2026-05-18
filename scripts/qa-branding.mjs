#!/usr/bin/env node
// QA branding checklist — fails (exit 1) if forbidden patterns are found.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["src", "public", "scripts"];
const ROOT_SHALLOW = ["."];
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".html", ".json", ".webmanifest", ".yml", ".yaml"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".next", "build", "coverage"]);
const SKIP_FILES = new Set(["qa-branding.mjs", "package-lock.json", "bun.lockb", "pnpm-lock.yaml", "yarn.lock"]);

const FORBIDDEN = [
  { re: /logo-flora\.png/i, msg: "Ancien logo /logo-flora.png" },
  { re: /["'`]GS Flora["'`]/, msg: "Ancien nom de marque 'GS Flora'" },
  { re: /from\s+["']@\/assets\/logo-flora/i, msg: "Import ancien logo-flora" },
  { re: /gs-flora/i, msg: "Ancien slug 'gs-flora'" },
];

const REQUIRED = [
  { file: "src/components/landing/CTASection.tsx", needles: ["Fondateur", "Enseignant", "Élève", "Parent"], label: "CTA par rôle" },
  { file: "src/components/landing/Footer.tsx", needles: ["SchoolHub Pro"], label: "Footer branding" },
  { file: "src/components/Logo.tsx", needles: ["logo-schoolhub-pro"], label: "Logo central" },
  { file: "index.html", needles: ["SchoolHub Pro", "logo-schoolhub-pro.png"], label: "index.html branding & favicon" },
  { file: "public/manifest.json", needles: ["SchoolHub Pro", "logo-schoolhub-pro.png"], label: "PWA manifest branding" },
  { file: "src/lib/brandingGuard.ts", needles: ["startBrandingGuard"], label: "Runtime branding guard" },
  { file: "src/contexts/MotionPreferenceContext.tsx", needles: ["MotionPreferenceProvider", "reduce-motion"], label: "Motion preference context" },
  { file: "src/main.tsx", needles: ["startBrandingGuard"], label: "Branding guard wired in main" },
];

const FORBIDDEN_FILES = ["public/logo-flora.png", "src/assets/logo-flora.png"];

let errors = 0;
const warn = (m) => { errors++; console.log("✗", m); };
const ok = (m) => console.log("✓", m);

function scanFile(p) {
  const content = readFileSync(p, "utf8");
  for (const { re, msg } of FORBIDDEN) if (re.test(content)) warn(`${msg} -> ${p}`);
}
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name) || SKIP_FILES.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (EXTS.has(extname(name))) scanFile(p);
  }
}

console.log("== QA Branding Checklist ==");
for (const r of ROOTS) walk(r);
// self-exclude the QA script itself (it intentionally contains the forbidden patterns)
for (const r of ROOT_SHALLOW) {
  if (!existsSync(r)) continue;
  for (const name of readdirSync(r)) {
    if (SKIP_FILES.has(name) || SKIP_DIRS.has(name)) continue;
    const p = join(r, name);
    if (!statSync(p).isFile()) continue;
    if (EXTS.has(extname(name))) scanFile(p);
  }
}
for (const f of FORBIDDEN_FILES) {
  if (existsSync(f)) warn(`Fichier ancien logo encore présent: ${f}`);
  else ok(`Fichier ancien absent: ${f}`);
}
for (const { file, needles, label } of REQUIRED) {
  try {
    const c = readFileSync(file, "utf8");
    const missing = needles.filter((n) => !c.includes(n));
    if (missing.length) warn(`${label}: éléments manquants [${missing.join(", ")}] dans ${file}`);
    else ok(`${label} OK (${file})`);
  } catch { warn(`Fichier introuvable: ${file}`); }
}
if (errors === 0) { console.log("\n✓ Charte graphique & CTA conformes — 0 problème détecté."); process.exit(0); }
console.log(`\n✗ ${errors} problème(s) détecté(s).`); process.exit(1);
