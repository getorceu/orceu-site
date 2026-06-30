import path from "node:path";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { getRadarCategories, radarArticles } from "@/lib/radar-news";
import { getSiteUrl } from "@/lib/site-config";

const RADAR_HTML_PATH = path.join(process.cwd(), "radar", "index.html");

type BundledAsset = {
  compressed: boolean;
  data: string;
  mime: string;
};

const RADAR_LIGHT_BLUE = "#C9D9FF";
const RADAR_TEXT_GRAY = "#8E95A5";
const RADAR_PANEL_BLUE = "#EAF2FF";
const BRAZIL_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const RADAR_NAV_ACTIONS_HTML = `<div class="radar-nav-actions">
      <label class="radar-state-select-wrap" aria-label="Selecionar estado">
        <select class="radar-state-select" data-radar-state-select title="Selecionar estado">
          <option value="" selected disabled>UF</option>
          ${BRAZIL_STATES.map(
            (state) => `<option value="${state}">${state}</option>`,
          ).join("")}
        </select>
      </label>
      <a class="radar-back-home-link" href="/">Voltar para o Orceu</a>
    </div>`;

const RADAR_STATE_SELECTOR_STYLES = `.cat-inner > a:not(.radar-back-home-link){justify-content:flex-start!important;background:transparent!important}.cat-inner > a:not(.radar-back-home-link) span{display:inline-block;transition:transform .22s ease;transform-origin:center}.cat-inner > a:not(.radar-back-home-link):hover{background:transparent!important;color:#EAF0FF!important}.cat-inner > a:not(.radar-back-home-link):hover span{transform:scale(1.08)}.radar-nav-actions{display:inline-flex!important;align-items:center!important;gap:6px!important;margin-left:8px!important;padding-left:8px!important;border-left:0!important;flex:0 0 auto!important;align-self:center!important}.radar-state-select-wrap{display:flex!important;align-items:center!important;padding:0!important;margin:0!important;border-left:0!important;flex:0 0 auto!important}.radar-state-select{appearance:none;width:46px!important;height:22px!important;border:0!important;border-radius:999px!important;background-color:rgba(255,255,255,.08)!important;color:#eef3ff!important;cursor:pointer!important;font-family:'Axiforma',sans-serif!important;font-size:9.5px!important;font-weight:700!important;letter-spacing:.04em!important;line-height:1!important;padding:0 15px 0 8px!important;text-transform:uppercase!important;background-image:linear-gradient(45deg,transparent 50%,#eef3ff 50%),linear-gradient(135deg,#eef3ff 50%,transparent 50%)!important;background-position:calc(100% - 9px) 50%,calc(100% - 6px) 50%!important;background-size:3px 3px,3px 3px!important;background-repeat:no-repeat!important;text-align:left!important}.radar-state-select option{color:#2146ad;background:#fff}.radar-back-home-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:22px!important;margin:0!important;padding:0 12px!important;border-radius:999px!important;background:rgba(255,255,255,.08)!important;color:#eef3ff!important;font-family:'Axiforma',sans-serif!important;font-size:8.8px!important;font-weight:700!important;letter-spacing:.035em!important;line-height:1!important;text-decoration:none!important;text-transform:uppercase!important;white-space:nowrap!important;flex:0 0 auto!important;align-self:center!important}.radar-news-badge{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:34px!important;padding:0 20px!important;color:rgba(255,255,255,.82)!important;font-family:'Axiforma',sans-serif!important;font-size:10.5px!important;font-weight:800!important;letter-spacing:.1em!important;line-height:1!important;text-transform:uppercase!important;white-space:nowrap!important;background:linear-gradient(135deg,rgba(17,20,28,.9),rgba(4,7,13,.94))!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:999px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 16px 38px rgba(0,0,0,.16)!important}@media (max-width:680px){.radar-news-badge{min-height:30px!important;padding:0 14px!important;font-size:8.8px!important;letter-spacing:.08em!important}}`;

const RADAR_STATE_SELECTOR_SCRIPT = `<script>
(() => {
  const validStates = new Set(${JSON.stringify(BRAZIL_STATES)});
  const storageKey = "orceu-radar-uf";
  const selectors = Array.from(document.querySelectorAll("[data-radar-state-select]"));

  if (!selectors.length) return;

  function applyState(value) {
    if (!validStates.has(value)) return;
    window.localStorage.setItem(storageKey, value);
    selectors.forEach((selector) => {
      selector.value = value;
    });
  }

  const storedState = window.localStorage.getItem(storageKey);
  if (storedState && validStates.has(storedState)) applyState(storedState);

  selectors.forEach((selector) => {
    selector.addEventListener("change", () => {
      const value = selector.value;
      if (validStates.has(value)) applyState(value);
    });
  });

  if (storedState && validStates.has(storedState)) return;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1800);

  fetch("https://ipapi.co/json/", {
    signal: controller.signal,
    cache: "no-store",
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      const regionCode = String(data?.region_code ?? "").toUpperCase();
      if (data?.country_code === "BR" && validStates.has(regionCode)) {
        applyState(regionCode);
      }
    })
    .catch(() => {})
    .finally(() => window.clearTimeout(timeout));
})();
</script>`;

const UTILITY_BAR_HTML = `<!-- Utility bar -->
  <div style="background:#2146AD;color:#EAF0FF;border-bottom:1px solid rgba(33,70,173,.18)">
    <div class="ub-inner px24" style="max-width:1240px;margin:0 auto;padding:9px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px">
      <span class="ub-date" style="font-size:11px;letter-spacing:.14em;font-weight:600">{{ dateStr }}</span>
      <div style="display:flex;align-items:center;gap:22px;font-size:11.5px;letter-spacing:.1em;font-weight:600;text-transform:uppercase">
        <span class="ub-hide-sm" style="color:#9A9183" data-comment-anchor="b8738bc7c8-span">Edição Brasil</span>
        <span class="ub-hide-sm" style="color:#9A9183;cursor:pointer">Newsletter</span>
        <span style="color:#2146AD;cursor:pointer">Entrar</span>
      </div>
    </div>
  </div>

  `;

const MASTHEAD_BRAND_HTML = `<div onclick="{{ goHome }}" style="cursor:pointer;line-height:1">
        <div style="display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap">
          <img src="/assets/logo-orceu.svg" alt="Orceu" style="height:42px;width:auto;display:block;flex:0 0 auto">
          <span style="font-family:'Axiforma',sans-serif;font-weight:800;font-size:16px;letter-spacing:.34em;text-transform:uppercase;color:#2146AD;padding-bottom:4px">RADAR</span>
        </div>
        <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#5B72B8;margin-top:8px;font-weight:600">Radar da construcao civil com metodo</div>
      </div>`;

const MASTHEAD_BRAND_FIXED_HTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:18px;flex:1 1 auto;min-width:0;flex-wrap:wrap">
        <div onclick="{{ goHome }}" style="cursor:pointer;display:flex;align-items:center;min-width:0;line-height:1">
          <img src="/assets/orceu-radar.svg" alt="Orceu Radar" style="height:42px;width:auto;display:block;flex:0 0 auto;max-width:min(100%,380px)">
        </div>
        <span class="radar-news-badge">O radar de notícias da construção civil</span>
      </div>`;




const ARTICLE_META_HTML = `<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E7E2D8;border-bottom:1px solid #E7E2D8;margin-bottom:26px">
          <div style="width:44px;height:44px;border-radius:50%;background:#2146AD;color:#2146AD;display:flex;align-items:center;justify-content:center;font-family:'Axiforma',serif;font-weight:700;font-size:19px;flex-shrink:0">{{ sel.author }}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;color:#2146AD">Por {{ sel.author }}</div>
            <div style="font-size:12.5px;color:#5B72B8">{{ sel.role }} • {{ sel.date }} • {{ sel.read }}</div>
          </div>
          <div style="display:flex;gap:8px">
            <span style="width:34px;height:34px;border:1px solid #E0DACE;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#5A5349;cursor:pointer">in</span>
            <span style="width:34px;height:34px;border:1px solid #E0DACE;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#5A5349;cursor:pointer">↗</span>
          </div>
        </div>`;

const ARTICLE_META_FIXED_HTML = `<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E7E2D8;border-bottom:1px solid #E7E2D8;margin-bottom:26px">
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:#2146AD">Por {{ sel.author }}</div>
            <div style="font-size:12.5px;color:#5B72B8">{{ sel.role }} • {{ sel.date }} • {{ sel.read }}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0">
            <span style="width:34px;height:34px;border:1px solid #E0DACE;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#5A5349;cursor:pointer">in</span>
          </div>
        </div>`;

const WEATHER_PANEL_HTML = `<div style="display:flex;align-items:center;gap:11px;padding:0 22px;border-left:1px solid #ECE7DD;flex-shrink:0">
          <span style="font-size:20px;line-height:1">{{ clima.glyph }}</span>
          <div style="display:flex;flex-direction:column;gap:3px">
            <span style="font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#9A8C7C">Clima de obra</span>
            <div style="display:flex;align-items:baseline;gap:7px">
              <span style="font-size:16px;font-weight:800;color:#2146AD">{{ clima.temp }}</span>
              <span style="font-size:11px;font-weight:700;color:#2146AD">{{ clima.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:7px;padding-left:20px;flex-shrink:0">
        <span style="width:6px;height:6px;border-radius:50%;background:#2146AD"></span>
        <span style="font-size:10px;font-weight:600;letter-spacing:.04em;color:#A89D8C;white-space:nowrap">Atualizado há 4 min</span>
      </div>`;

const NEWSLETTER_HTML = `<div style="background:#2146AD;border-radius:25px;padding:26px 24px;color:#FAF7F1">
          <div style="font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#2146AD;margin-bottom:10px">Newsletter semanal</div>
          <h4 style="font-family:'Axiforma',serif;font-weight:700;font-size:23px;line-height:1.12;margin:0 0 8px">O setor muda toda semana. Saiba primeiro.</h4>
          <p style="font-size:13.5px;line-height:1.5;color:#B5AD9F;margin:0 0 18px">Análises de mercado, gestão e tecnologia da construção direto no seu e-mail.</p>
          <div style="display:flex;flex-direction:column;gap:9px">
            <div style="background:#221E18;border:1px solid rgba(255,255,255,.12);border-radius:25px;padding:11px 13px;font-size:13px;color:#5B72B8">seu@email.com.br</div>
            <button style="background:#FF6A1A;color:#2146AD;border:0;border-radius:25px;padding:12px;font-family:'Axiforma',sans-serif;font-weight:800;font-size:13px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer" style-hover="background:#2146AD">Quero receber</button>
          </div>
        </div>`;

const NEWSLETTER_FIXED_HTML = `<div style="background:#2146AD;border-radius:25px;overflow:hidden;flex:1 1 auto;min-height:0;align-self:stretch">
          <image-slot id="newsletter-banner-slot" shape="rect" placeholder="Banner de marketing 1:2.5" style="width:100%;height:100%"></image-slot>
        </div>`;

function expandBundledRadarDocument(html: string) {
  const manifestMatch = html.match(
    /<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/i,
  );
  const templateMatch = html.match(
    /<script type="__bundler\/template">\s*([\s\S]*?)\s*<\/script>/i,
  );

  if (!manifestMatch || !templateMatch) {
    return html;
  }

  const manifest = JSON.parse(manifestMatch[1]) as Record<string, BundledAsset>;
  let template = JSON.parse(templateMatch[1]) as string;

  for (const [uuid, entry] of Object.entries(manifest)) {
    const encodedBytes = Buffer.from(entry.data, "base64");
    const finalBytes = entry.compressed ? gunzipSync(encodedBytes) : encodedBytes;
    const dataUrl = `data:${entry.mime};base64,${finalBytes.toString("base64")}`;
    template = template.split(uuid).join(dataUrl);
  }

  return template
    .replace(/\s+integrity="[^"]*"/gi, "")
    .replace(/\s+crossorigin="[^"]*"/gi, "");
}

function customizeExpandedRadarDocument(html: string) {
  const siteUrl = getSiteUrl();
  const websiteJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Radar Orceu",
    url: `${siteUrl}/radar`,
    description:
      "Notícias, análises e tendências sobre construção civil, tecnologia, gestão, sustentabilidade e economia.",
    inLanguage: "pt-BR",
  });
  const itemListJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Radar Orceu | Notícias da Construção Civil",
    url: `${siteUrl}/radar`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: radarArticles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/radar/${article.id}`,
        name: article.title,
      })),
    },
    hasPart: getRadarCategories().map((category) => ({
      "@type": "CollectionPage",
      name: category.name,
      url: `${siteUrl}/radar/categoria/${category.slug}`,
    })),
  });

  return html
    .replace(
      "<head>",
      `<head><title>Radar Orceu | Notícias da Construção Civil</title><meta name="description" content="Acompanhe no Radar Orceu as principais notícias, tendências e análises sobre gestão, tecnologia, sustentabilidade e economia da construção civil."><link rel="canonical" href="${siteUrl}/radar"><link rel="alternate" type="application/rss+xml" title="Radar Orceu RSS" href="${siteUrl}/radar/feed.xml"><meta property="og:type" content="website"><meta property="og:title" content="Radar Orceu | Notícias da Construção Civil"><meta property="og:description" content="Acompanhe no Radar Orceu as principais notícias, tendências e análises sobre gestão, tecnologia, sustentabilidade e economia da construção civil."><meta property="og:url" content="${siteUrl}/radar"><meta property="og:site_name" content="Radar Orceu"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Radar Orceu | Notícias da Construção Civil"><meta name="twitter:description" content="Acompanhe no Radar Orceu as principais notícias, tendências e análises sobre gestão, tecnologia, sustentabilidade e economia da construção civil."><script type="application/ld+json">${websiteJsonLd}</script><script type="application/ld+json">${itemListJsonLd}</script><style>.mh-inner{overflow:hidden}.mh-inner img{max-width:100%!important}.cat-inner{justify-content:flex-start!important}.cat-inner a:first-child{padding-left:0!important}.radar-eyebrow{display:block;width:max-content;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;color:#000!important;font-family:'Axiforma',sans-serif!important;font-weight:400!important;text-transform:uppercase;line-height:1.1;padding:0!important}.radar-eyebrow-lead{font-size:12px;letter-spacing:.1em;margin:18px 0 10px}.radar-eyebrow-small{font-size:11px;letter-spacing:.1em;margin-bottom:7px}.radar-eyebrow-compact{font-size:10px;letter-spacing:.1em;margin-bottom:7px}${RADAR_STATE_SELECTOR_STYLES}@media (max-width:680px){.mh-inner{padding-left:16px!important;padding-right:16px!important}.cat-inner{padding-left:16px!important;padding-right:16px!important}.cat-inner a:first-child{padding-left:0!important}}</style>`,
    )
    .replaceAll(
      "background:linear-gradient(180deg,#eef4ff 0%,#f8fbff 22%,#ffffff 100%)",
      "background:#ffffff",
    )
    .replaceAll("border-radius:2px", "border-radius:25px")
    .replaceAll("border-radius:3px", "border-radius:25px")
    .replaceAll("border-radius:4px", "border-radius:25px")
    .replaceAll("border-radius:5px", "border-radius:25px")
    .replaceAll("border-radius:8px", "border-radius:25px")
    .replaceAll("border-radius:18px", "border-radius:25px")
    .replaceAll("Indicadores ao vivo", "Indicadores atualizados")
    .replace(UTILITY_BAR_HTML, "\n")
    .replace(MASTHEAD_BRAND_HTML, MASTHEAD_BRAND_FIXED_HTML)
    .replace(ARTICLE_META_HTML, ARTICLE_META_FIXED_HTML)
    .replace(
      WEATHER_PANEL_HTML,
      `<div style="display:flex;align-items:center;gap:11px;padding:0 22px;border-left:1px solid #ECE7DD;flex-shrink:0;min-width:190px">
          <span style="font-size:20px;line-height:1">{{ clima.glyph }}</span>
          <div style="display:flex;flex-direction:column;gap:5px">
            <span style="font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#9A8C7C;line-height:1;white-space:nowrap">Clima de obra</span>
            <div style="display:flex;align-items:baseline;gap:7px">
              <span style="font-size:16px;font-weight:800;color:#2146AD;line-height:1">{{ clima.temp }}</span>
              <span style="font-size:11px;font-weight:700;color:#2146AD;line-height:1;white-space:nowrap">{{ clima.status }}</span>
            </div>
          </div>
        </div>
      </div>`,
    )
    .replace(NEWSLETTER_HTML, NEWSLETTER_FIXED_HTML)
    .replace(
      '<sc-for list=\"{{ radar }}\" as=\"r\" hint-placeholder-count=\"5\">\n          <div style=\"display:flex;flex-direction:column;justify-content:center;gap:3px;padding:0 22px;border-left:1px solid #ECE7DD;flex-shrink:0\">\n            <span style=\"font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#9A8C7C\">{{ r.label }}<\/span>\n            <div style=\"display:flex;align-items:baseline;gap:8px\">\n              <span style=\"font-size:16px;font-weight:800;color:#2146AD;font-variant-numeric:tabular-nums;letter-spacing:-.01em\">{{ r.value }}<\/span>\n              <span style=\"font-size:11px;font-weight:700;color:{{ r.color }};white-space:nowrap\">{{ r.delta }}<\/span>\n            <\/div>\n          <\/div>\n        <\/sc-for>',
      '<sc-for list=\"{{ radar }}\" as=\"r\" hint-placeholder-count=\"5\">\n          <div style=\"display:flex;flex-direction:column;justify-content:center;gap:0;padding:0 22px;border-left:1px solid #ECE7DD;flex-shrink:0\">\n            <span style=\"font-size:9.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#9A8C7C;line-height:1;margin-bottom:5px\">{{ r.label }}<\/span>\n            <div style=\"display:flex;align-items:baseline;gap:8px;line-height:1\">\n              <span style=\"font-size:16px;font-weight:800;color:#2146AD;font-variant-numeric:tabular-nums;letter-spacing:-.01em;line-height:1\">{{ r.value }}<\/span>\n              <span style=\"font-size:11px;font-weight:700;color:{{ r.color }};white-space:nowrap;line-height:1\">{{ r.delta }}<\/span>\n            <\/div>\n          <\/div>\n        <\/sc-for>',
    )
    .replace(
      '<div style="display:flex;align-items:center;gap:10px;padding-right:24px;flex-shrink:0">',
      '<div style="display:flex;align-items:center;gap:10px;padding-right:24px;flex-shrink:0">',
    )
    .replace(
      '<span style="width:7px;height:7px;border-radius:50%;background:#FF6A1A;box-shadow:0 0 0 3px rgba(255,106,26,.16);flex-shrink:0"></span>\n        <div style="line-height:1.25">',
      '<div style="line-height:1.25">',
    )
    .replace(
      'background:#2146AD;color:#2146AD;font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;padding:9px 18px;display:flex;align-items:center;white-space:nowrap;flex-shrink:0',
      "background:#2146AD;color:#FAF7F1;font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;padding:9px 18px;display:flex;align-items:center;white-space:nowrap;flex-shrink:0",
    )
    .replace(
      'style="display:flex;align-items:center;gap:20px;overflow-x:auto;padding:18px 24px;background:#FAF7F1;border-bottom:1px solid #ECE7DD"',
      'style="display:flex;align-items:center;justify-content:flex-start;gap:20px;overflow-x:auto;padding:18px 24px;background:#FAF7F1;border-bottom:1px solid #ECE7DD;flex-wrap:wrap"',
    )
    .replace(
      '<a href="#" style="font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#EAF0FF;text-decoration:none;padding:14px 18px;border-right:1px solid rgba(255,255,255,.07);white-space:nowrap;display:flex;align-items:center" style-hover="color:#2146AD;background:rgba(255,255,255,.03)">{{ cat.name }}</a>',
      '<a href="#" style="font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#EAF0FF;text-decoration:none;padding:14px 18px;border-right:1px solid rgba(255,255,255,.07);white-space:nowrap;display:flex;align-items:center;background:transparent"><span>{{ cat.name }}</span></a>',
    )
    .replace(
      `      </sc-for>
    </div>
  </nav>`,
      `      </sc-for>
      ${RADAR_NAV_ACTIONS_HTML}
    </div>
  </nav>`,
    )
    .replace(
      '<section class="hero-grid" style="display:grid;grid-template-columns:1.95fr 1fr;gap:34px;padding-bottom:34px;border-bottom:1px solid #E7E2D8">',
      '<section class="hero-grid" style="display:grid;grid-template-columns:1.95fr 1fr;gap:34px;padding-bottom:18px">',
    )
    .replace(
      '<section class="body-grid" style="display:grid;grid-template-columns:1fr 340px;gap:48px;padding-top:34px">',
      '<section class="body-grid" style="display:grid;grid-template-columns:1.95fr 1fr;gap:34px;padding-top:34px">',
    )
    .replace(
      '<aside style="display:flex;flex-direction:column;gap:34px">',
      '<aside style="display:flex;flex-direction:column;gap:34px;align-self:stretch;height:100%">',
    )
    .replace(
      '<article onclick="{{ s.open }}" style="cursor:pointer;display:grid;grid-template-columns:1fr;gap:12px;padding-bottom:22px;border-bottom:1px solid #E7E2D8">',
      '<article onclick="{{ s.open }}" style="cursor:pointer;display:grid;grid-template-columns:1fr;gap:12px;padding-bottom:10px">',
    )
    .replace(
      /<div style="[^"]*">\{\{ featured\.cat \}\}<\/div>/g,
      '<div class="radar-eyebrow radar-eyebrow-lead">{{ featured.cat }}</div>',
    )
    .replace(
      /<div style="[^"]*">\{\{ s\.cat \}\}<\/div>/g,
      '<div class="radar-eyebrow radar-eyebrow-small">{{ s.cat }}</div>',
    )
    .replace(
      /<div style="[^"]*">\{\{ m\.cat \}\}<\/div>/g,
      '<div class="radar-eyebrow radar-eyebrow-compact">{{ m.cat }}</div>',
    )
    .replace(
      /<div style="[^"]*">\{\{ a\.cat \}\}<\/div>/g,
      '<div class="radar-eyebrow radar-eyebrow-small">{{ a.cat }}</div>',
    )
    .replace(
      /<div style="[^"]*">\{\{ sel\.cat \}\}<\/div>/g,
      '<div class="radar-eyebrow radar-eyebrow-lead">{{ sel.cat }}</div>',
    )
    .replace(
      /<div style="[^"]*">\{\{ r\.cat \}\}<\/div>/g,
      '<div class="radar-eyebrow radar-eyebrow-compact">{{ r.cat }}</div>',
    )
    .replace(
      `<div style="display:flex;align-items:center;gap:14px;margin-bottom:24px">
          <h3 style="font-family:'Axiforma',sans-serif;font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#2146AD;margin:0">Últimas notícias</h3>
          <div style="height:1px;background:#E7E2D8;flex:1"></div>
        </div>`,
      `<div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
          <span style="width:10px;height:10px;border-radius:50%;background:#C9D9FF;box-shadow:0 0 0 6px rgba(201,217,255,.22);flex-shrink:0"></span>
          <h3 style="font-family:'Axiforma',sans-serif;font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#2146AD;margin:0">Últimas notícias</h3>
        </div>`,
    )
    .replace(
      `<div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <span style="color:#C9D9FF;font-size:18px">▲</span>
            <h3 style="font-family:'Axiforma',sans-serif;font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#2146AD;margin:0">Mais lidas</h3>
          </div>
          <div style="border-top:3px solid #2146AD">`,
      `<div style="background:#F5F8FF;border:1px solid rgba(33,70,173,.1);border-radius:25px;padding:18px 18px 6px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:14px solid #C9D9FF;transform:translateY(-1px)"></span>
            <h3 style="font-family:'Axiforma',sans-serif;font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#2146AD;margin:0">Mais lidas</h3>
          </div>
          <div>`,
    )
    .replaceAll(
      '<div style="border-top:3px solid #2146AD">',
      '<div style="background:#F5F8FF;border:1px solid rgba(33,70,173,.1);border-radius:25px;padding:6px 18px">',
    )
    .replaceAll(
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">',
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">',
    )
    .replace(
      '<article onclick="{{ m.open }}" style="cursor:pointer;display:grid;grid-template-columns:auto 1fr;gap:14px;padding:16px 0;border-bottom:1px solid #E7E2D8;align-items:start">',
      '<article onclick="{{ m.open }}" style="cursor:pointer;display:grid;grid-template-columns:auto 1fr;gap:14px;padding:15px 0;border-bottom:1px solid rgba(33,70,173,.1);align-items:start">',
    )
    .replace(
      'style="max-width:1240px;margin:0 auto;padding:26px 24px 22px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px"',
      'style="max-width:1240px;margin:0 auto;padding:26px 24px 22px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px"',
    )
    .replace(
      'class="eco-band" style="margin-top:14px;background:#2146AD;border-radius:25px;padding:36px 40px;color:#FAF7F1"',
      `class="eco-band" style="margin-top:14px;background:${RADAR_PANEL_BLUE};border-radius:25px;padding:36px 40px;color:#2146AD"`,
    )
    .replace(
      'style="height:1px;background:rgba(255,255,255,.14);flex:1"',
      'style="height:1px;background:rgba(33,70,173,.16);flex:1"',
    )
    .replace(
      "font-family:'Axiforma',serif;font-weight:700;font-size:21px;line-height:1.14;margin:0 0 8px;color:#FAF7F1",
      "font-family:'Axiforma',serif;font-weight:700;font-size:21px;line-height:1.14;margin:0 0 8px;color:#2146AD",
    )
    .replace(
      `radar: [\n        { label: 'INCC', value: '0,48%', delta: '▲ +0,06 p.p.', color: '#2146AD' },\n        { label: 'CUB / m²', value: 'R$ 2.847', delta: '▲ +0,7%', color: '#2146AD' },\n        { label: 'Aço', value: 'R$ 5,12/kg', delta: '▼ −0,3%', color: '#2146AD' },\n        { label: 'Cimento', value: 'R$ 38,90', delta: '▲ +1,2%', color: '#2146AD' },\n        { label: 'Selic', value: '9,75%', delta: '— estável', color: '#5B72B8' }\n      ],`,
      `radar: [\n        { label: 'INCC', value: '0,48%', delta: '▲ +0,06', color: '#2F6B3D' },\n        { label: 'CUB / m²', value: 'R$ 2.847', delta: '▲ +0,7%', color: '#2F6B3D' },\n        { label: 'Aço', value: 'R$ 5,12/kg', delta: '▼ −0,3%', color: '#8B2E2E' },\n        { label: 'Cimento', value: 'R$ 38,90', delta: '▲ +1,2%', color: '#2F6B3D' },\n        { label: 'Selic', value: '9,75%', delta: '', color: '#6B7280' }\n      ],`,
    )
    .replace(/<div class="mh-search"[\s\S]*?<\/div>\s*<\/div>\s*<\/header>/, "</div>\n  </header>")
    .replaceAll("#FF6A1A", RADAR_LIGHT_BLUE)
    .replaceAll("#D9530A", RADAR_LIGHT_BLUE)
    .replaceAll("rgba(255,106,26,.16)", "rgba(201,217,255,.24)")
    .replaceAll("#9A8C7C", RADAR_TEXT_GRAY)
    .replaceAll("#A89D8C", RADAR_TEXT_GRAY)
    .replaceAll("#5A5349", RADAR_TEXT_GRAY)
    .replaceAll("#B5AD9F", RADAR_TEXT_GRAY)
    .replaceAll("#9A9183", RADAR_TEXT_GRAY)
    .replaceAll(
      "background:#EAE5DA;border-radius:25px;overflow:hidden",
      "background:#EAE5DA;border-radius:7px;overflow:hidden",
    )
    .replaceAll(
      "background:#2A251D;border-radius:25px;overflow:hidden",
      "background:#2A251D;border-radius:7px;overflow:hidden",
    )
    .replace(
      /        <!-- Em alta tags -->\s*<div>\s*<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">\s*<h3 style="font-family:'Axiforma',sans-serif;font-weight:800;font-size:14px;letter-spacing:\.14em;text-transform:uppercase;color:#2146AD;margin:0">Em alta<\/h3>\s*<div style="height:1px;background:#E7E2D8;flex:1"><\/div>\s*<\/div>\s*<div style="display:flex;flex-wrap:wrap;gap:8px">\s*<span style="font-size:12\.5px;font-weight:600;color:#8E95A5;border:1px solid #E0DACE;border-radius:25px;padding:7px 11px;cursor:pointer">#BIM<\/span>\s*<span style="font-size:12\.5px;font-weight:600;color:#8E95A5;border:1px solid #E0DACE;border-radius:25px;padding:7px 11px;cursor:pointer">#GestãoDeObras<\/span>\s*<span style="font-size:12\.5px;font-weight:600;color:#8E95A5;border:1px solid #E0DACE;border-radius:25px;padding:7px 11px;cursor:pointer">#Orçamento<\/span>\s*<span style="font-size:12\.5px;font-weight:600;color:#8E95A5;border:1px solid #E0DACE;border-radius:25px;padding:7px 11px;cursor:pointer">#Sustentabilidade<\/span>\s*<span style="font-size:12\.5px;font-weight:600;color:#8E95A5;border:1px solid #E0DACE;border-radius:25px;padding:7px 11px;cursor:pointer">#IA<\/span>\s*<span style="font-size:12\.5px;font-weight:600;color:#8E95A5;border:1px solid #E0DACE;border-radius:25px;padding:7px 11px;cursor:pointer">#PIB<\/span>\s*<\/div>\s*<\/div>/,
      "",
    )
    .replace(
      /\s*<!-- Em alta tags -->\s*<div>[\s\S]*?<\/div>\s*<\/div>\s*(?=<\/aside>)/,
      "",
    )
    .replace(
      "  open(id) {\n    this.setState({ view: 'article', selId: id });\n    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });\n  }\n  goHome() {\n    this.setState({ view: 'home' });\n    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });\n  }\n",
      "  open(id) {\n    if (typeof window !== 'undefined') window.location.href = '/radar/' + id;\n  }\n  goHome() {\n    if (typeof window !== 'undefined') window.location.href = '/radar';\n  }\n",
    )
    .replace("</body>", `<style>${RADAR_STATE_SELECTOR_STYLES}</style>${RADAR_STATE_SELECTOR_SCRIPT}</body>`);
}

export async function GET() {
  const html = await readFile(RADAR_HTML_PATH, "utf8");
  const expandedHtml = expandBundledRadarDocument(html);
  const customizedHtml = customizeExpandedRadarDocument(expandedHtml);

  return new Response(customizedHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
