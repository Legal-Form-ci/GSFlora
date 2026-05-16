#!/usr/bin/env node
// QA branding checklist — fails (exit 1) if forbidden patterns are found.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "src";
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".html"]);

// Forbidden patterns (old branding / hard-coded colors that bypass the design system)
const FORBIDDEN = [
  { re: /logo-flora\.png/i, msg: "Ancien logo /logo-flora.png" },
  { re: /['"`]GS Flora['"`]/, msg: "Ancien nom de marque 'GS Flora'" },
  { re: /from\s+["']@\/assets\/logo-flora/i, msg: "Import ancien logo-flora" },
];

// Required pieces on the landing page
const REQUIRED_IN_LANDING = [
  { file: "src/components/landing/CTASection.tsx", needles: ["Fondateur", "Enseignant", "Élève", "Parent"], label: "CTA par rôle" },
  { file: "src/components/landing/Footer.tsx", needles: ["SchoolHub Pro"], label: "Footer branding" },
  { file: "src/components/Logo.tsx", needles: ["logo-schoolhub-pro"], label: "Logo central pointant vers le nouvel asset" },
];

let errors = 0;
const warn = (m) => { errors++; console.log("✗", m); };
const ok = (m) => console.log("✓", m);

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      walk(p);
    } else if (EXTS.has(extname(name))) {
      const content = readFileSync(p, "utf8");
      for (const { re, msg } of FORBIDDEN) {
        if (re.test(content)) warn(`${msg} -> ${p}`);
      }
    }
  }
}

console.log("== QA Branding Checklist ==");
walk(ROOT);

for (const { file, needles, label } of REQUIRED_IN_LANDING) {
  try {
    const c = readFileSync(file, "utf8");
    const missing = needles.filter((n) => !c.includes(n));
    if (missing.length) warn(`${label}: éléments manquants [${missing.join(", ")}] dans ${file}`);
    else ok(`${label} OK (${file})`);
  } catch {
    warn(`Fichier introuvable: ${file}`);
  }
}

if (errors === 0) {
  console.log("\n✓ Charte graphique & CTA conformes — 0 problème détecté.");
  process.exit(0);
} else {
  console.log(`\n✗ ${errors} problème(s) détecté(s).`);
  process.exit(1);
}