import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const SITE = {
  url: "https://killian-rll.github.io/Proto-Mesnie-Fert-Clairbois",
  nom: "La Mesnie de la Ferté-Clairbois",
  email: "lamesniedelaferteclairbois@gmail.com",
  facebook: "https://www.facebook.com/mesniedelaferteclairbois/",
  helloasso: "https://www.helloasso.com/associations/la-mesnie-de-la-ferte-clairbois",
  domaine: "https://domaineferteclairbois.fr/",
  adresse: "53270 Sainte-Suzanne-et-Chammes"
};

const ici = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(ici, "src");
const dist = path.join(ici, "dist");

const lire = (f) => fs.readFileSync(f, "utf8");
const layout = lire(path.join(src, "layout.html"));
const partiels = Object.fromEntries(
  fs.readdirSync(path.join(src, "partials")).map((f) => [path.basename(f, ".html"), lire(path.join(src, "partials", f))])
);

const rendre = (gabarit, vars) =>
  gabarit
    .replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partiels[n] ?? "")
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => k.split(".").reduce((o, p) => (o == null ? undefined : o[p]), vars) ?? "");

const enTete = (contenu) => {
  const m = contenu.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return [{}, contenu];
  const meta = Object.fromEntries(
    m[1].split(/\r?\n/).filter(Boolean).map((l) => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
  );
  return [meta, contenu.slice(m[0].length)];
};

const copier = (de, vers) => {
  fs.mkdirSync(vers, { recursive: true });
  for (const f of fs.readdirSync(de, { withFileTypes: true })) {
    if (f.name.startsWith("_")) continue;
    const a = path.join(de, f.name), b = path.join(vers, f.name);
    f.isDirectory() ? copier(a, b) : fs.copyFileSync(a, b);
  }
};

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copier(path.join(ici, "assets"), path.join(dist, "assets"));

const pages = fs.readdirSync(path.join(src, "pages")).filter((f) => f.endsWith(".html"));
const urls = [];
for (const f of pages) {
  const [meta, corps] = enTete(lire(path.join(src, "pages", f)));
  const vars = {
    site: SITE,
    titre: meta.titre ? `${meta.titre} — Les Féodales de Clairbois` : "Les Féodales de Clairbois · Fête médiévale en Mayenne",
    description: meta.description || "",
    image: meta.image || "assets/img/feodales-troupe.webp",
    page: f
  };
  let html = rendre(layout, { ...vars, contenu: rendre(corps, vars) });
  if (meta.nav) html = html.replaceAll(`data-nav="${meta.nav}"`, `data-nav="${meta.nav}" aria-current="page"`);
  if (meta.groupe === "feodales") html = html.replace('class="sous-menu__lien"', 'class="sous-menu__lien is-actif"');
  if (meta.noindex === "oui") html = html.replace("<!--robots-->", '<meta name="robots" content="noindex">');
  fs.writeFileSync(path.join(dist, f), html);
  if (meta.noindex !== "oui") urls.push(f === "index.html" ? "" : f);
}

fs.writeFileSync(path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE.url}/${u}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);

console.log(`✔ ${pages.length} pages générées dans dist/`);

if (process.argv.includes("--serve")) {
  spawn(process.execPath, [path.join(ici, "serve.mjs"), dist, "4321"], { stdio: "inherit" });
}
