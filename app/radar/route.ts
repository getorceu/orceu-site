import path from "node:path";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

const RADAR_HTML_PATH = path.join(process.cwd(), "radar", "index.html");

type BundledAsset = {
  compressed: boolean;
  data: string;
  mime: string;
};

const ARAGUAINA_COORDS = {
  latitude: -7.19207,
  longitude: -48.2078,
};

const RADAR_LIGHT_BLUE = "#C9D9FF";

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

const MASTHEAD_BRAND_FIXED_HTML = `<div onclick="{{ goHome }}" style="cursor:pointer;line-height:1">
        <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
          <span style="font-family:'Axiforma',sans-serif;font-weight:800;font-size:18px;letter-spacing:.38em;text-transform:uppercase;color:#FAF7F1;padding-top:6px">RADAR</span>
          <img src="/assets/logo-orceu.svg" alt="Orceu" style="height:52px;width:auto;display:block;flex:0 0 auto">
        </div>
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C9D9FF;margin-top:14px;font-weight:600">O RADAR OFICIAL DA CONSTRUÇÃO CIVIL</div>
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

const NEWSLETTER_HTML = `<div style="background:#2146AD;border-radius:4px;padding:26px 24px;color:#FAF7F1">
          <div style="font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#2146AD;margin-bottom:10px">Newsletter semanal</div>
          <h4 style="font-family:'Axiforma',serif;font-weight:700;font-size:23px;line-height:1.12;margin:0 0 8px">O setor muda toda semana. Saiba primeiro.</h4>
          <p style="font-size:13.5px;line-height:1.5;color:#B5AD9F;margin:0 0 18px">Análises de mercado, gestão e tecnologia da construção direto no seu e-mail.</p>
          <div style="display:flex;flex-direction:column;gap:9px">
            <div style="background:#221E18;border:1px solid rgba(255,255,255,.12);border-radius:2px;padding:11px 13px;font-size:13px;color:#5B72B8">seu@email.com.br</div>
            <button style="background:#FF6A1A;color:#2146AD;border:0;border-radius:2px;padding:12px;font-family:'Axiforma',sans-serif;font-weight:800;font-size:13px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer" style-hover="background:#2146AD">Quero receber</button>
          </div>
        </div>`;

const NEWSLETTER_FIXED_HTML = `<div style="background:#2146AD;border-radius:8px;overflow:hidden;aspect-ratio:1/2.5;min-height:620px">
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

async function getRainForecastLabel() {
  try {
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", String(ARAGUAINA_COORDS.latitude));
    weatherUrl.searchParams.set("longitude", String(ARAGUAINA_COORDS.longitude));
    weatherUrl.searchParams.set("daily", "precipitation_sum");
    weatherUrl.searchParams.set("forecast_days", "7");
    weatherUrl.searchParams.set("timezone", "America/Araguaina");

    const response = await fetch(weatherUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`weather ${response.status}`);

    const data = await response.json();
    const precipitation = Array.isArray(data?.daily?.precipitation_sum)
      ? data.daily.precipitation_sum
      : [];
    const rainyDays = precipitation.filter(
      (value: unknown) => typeof value === "number" && value >= 0.2,
    ).length;

    if (rainyDays === 0) return "Sem chuva em 7 dias";
    if (rainyDays === 1) return "Chuva em 1 dia";
    return `Chuva em ${rainyDays} dias`;
  } catch {
    return "Previsão indisponível";
  }
}

function customizeExpandedRadarDocument(html: string, rainForecastLabel: string) {
  return html
    .replace(UTILITY_BAR_HTML, "\n")
    .replace(MASTHEAD_BRAND_HTML, MASTHEAD_BRAND_FIXED_HTML)
    .replace(ARTICLE_META_HTML, ARTICLE_META_FIXED_HTML)
    .replace(
      WEATHER_PANEL_HTML,
      `<div style="display:flex;align-items:center;gap:11px;padding:0 22px;border-left:1px solid #ECE7DD;flex-shrink:0">
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

      <div style="display:flex;align-items:center;gap:10px;padding-left:18px;margin-left:18px;border-left:1px solid #ECE7DD;flex-shrink:0;min-width:132px">
        <span style="width:7px;height:7px;border-radius:50%;background:#C9D9FF;box-shadow:0 0 0 3px rgba(201,217,255,.24);flex-shrink:0"></span>
        <div style="display:flex;flex-direction:column;justify-content:center;gap:2px;min-width:0">
          <span style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9A8C7C">Chuva 7d</span>
          <span style="font-size:9.5px;font-weight:700;letter-spacing:.01em;color:#5B72B8;line-height:1.15;max-width:110px">${rainForecastLabel}</span>
        </div>
      </div>`,
    )
    .replace(NEWSLETTER_HTML, NEWSLETTER_FIXED_HTML)
    .replace(
      'background:#2146AD;color:#2146AD;font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;padding:9px 18px;display:flex;align-items:center;white-space:nowrap;flex-shrink:0',
      "background:#2146AD;color:#FAF7F1;font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;padding:9px 18px;display:flex;align-items:center;white-space:nowrap;flex-shrink:0",
    )
    .replace(
      'style="display:flex;align-items:center;gap:20px;overflow-x:auto;padding:18px 24px;background:#FAF7F1;border-bottom:1px solid #ECE7DD"',
      'style="display:flex;align-items:center;gap:20px;overflow-x:auto;padding:18px 24px;background:#FAF7F1;border-bottom:1px solid #ECE7DD;flex-wrap:wrap"',
    )
    .replace(
      'style="max-width:1240px;margin:0 auto;padding:26px 24px 22px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px"',
      'style="max-width:1240px;margin:0 auto;padding:26px 24px 22px;display:flex;align-items:flex-end;justify-content:flex-start;gap:24px"',
    )
    .replace(/<div class="mh-search"[\s\S]*?<\/div>\s*<\/div>\s*<\/header>/, "</div>\n  </header>")
    .replaceAll("#FF6A1A", RADAR_LIGHT_BLUE)
    .replaceAll("#D9530A", RADAR_LIGHT_BLUE)
    .replaceAll("rgba(255,106,26,.16)", "rgba(201,217,255,.24)");
}

export async function GET() {
  const html = await readFile(RADAR_HTML_PATH, "utf8");
  const [rainForecastLabel] = await Promise.all([getRainForecastLabel()]);
  const expandedHtml = expandBundledRadarDocument(html);
  const customizedHtml = customizeExpandedRadarDocument(
    expandedHtml,
    rainForecastLabel,
  );

  return new Response(customizedHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
