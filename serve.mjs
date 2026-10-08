import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const racine = path.resolve(process.argv[2] || "dist");
const port = Number(process.argv[3] || process.env.PORT || 4321);
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".ics": "text/calendar", ".webmanifest": "application/manifest+json"
};

http.createServer((req, res) => {
  let chemin = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (chemin.endsWith("/")) chemin += "index.html";
  let fichier = path.join(racine, chemin);
  if (!fichier.startsWith(racine)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(fichier) && fs.existsSync(fichier + ".html")) fichier += ".html";
  fs.readFile(fichier, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": types[".html"] });
      res.end(fs.existsSync(path.join(racine, "404.html")) ? fs.readFileSync(path.join(racine, "404.html")) : "404");
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(fichier).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, () => console.log(`Site servi sur http://localhost:${port} (dossier ${racine})`));
