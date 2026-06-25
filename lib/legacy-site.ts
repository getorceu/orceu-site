import { readFile } from "node:fs/promises";
import path from "node:path";

const BACKUP_ROOT = path.join(
  process.cwd(),
  "backup",
  "static-site-2026-06-25",
);

const HOME_FRAGMENTS = [
  "10-fundo-navbar-hero.html",
  "20-ecossistema.html",
  "21-marquee-logos.html",
  "22-diagnostico-cta.html",
  "23-skin-in-the-game.html",
  "24-recursos.html",
  "25-software-spotlight.html",
  "26-perfis.html",
  "27-noticias.html",
  "28-faq.html",
  "29-rodape.html",
  "30-modal-diagnostico.html",
];

const SCRIPT_TAG_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const ASSET_ATTRIBUTE_RE = /\b(src|srcset|href|poster)=(")([^"]*)"/gi;
const MISSING_DASHBOARD_VIDEO_RE =
  /<source\s+src="(?:public\/)?assets\/dashboard-video\.mp4"\s+type="video\/mp4">\s*/i;

function normalizeLegacyAssetValue(value: string) {
  return value
    .replace(/(^|,\s*)(?:public\/)?assets\//gi, "$1/assets/")
    .replace(/^assets\//i, "/assets/");
}

async function readLegacy(relativePath: string) {
  const absolutePath = path.join(BACKUP_ROOT, relativePath);
  return readFile(absolutePath, "utf8");
}

export async function loadLegacyHomeHtml() {
  const fragments = await Promise.all(
    HOME_FRAGMENTS.map(async (fragment) => {
      const html = await readLegacy(path.join("webflow-embeds", fragment));
      return html
        .replace(SCRIPT_TAG_RE, "")
        .replace(MISSING_DASHBOARD_VIDEO_RE, "")
        .replace(
          ASSET_ATTRIBUTE_RE,
          (_, attribute: string, quote: string, value: string) =>
            `${attribute}=${quote}${normalizeLegacyAssetValue(value)}${quote}`,
        )
        .trim();
    }),
  );

  return fragments.join("\n\n");
}
