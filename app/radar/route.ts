import { readFile } from "node:fs/promises";
import path from "node:path";

const ARAGUAINA_COORDS = {
  latitude: -7.19207,
  longitude: -48.2078,
};

const TICKER_LABEL_FIX =
  "background:#2146AD;color:#2146AD;font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;padding:9px 18px;display:flex;align-items:center;white-space:nowrap;flex-shrink:0";
const TICKER_LABEL_FIXED =
  "background:#2146AD;color:#FAF7F1;font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;padding:9px 18px;display:flex;align-items:center;white-space:nowrap;flex-shrink:0";
const RADAR_DOT_FIX =
  'width:7px;height:7px;border-radius:50%;background:#FF6A1A;box-shadow:0 0 0 3px rgba(255,106,26,.16);flex-shrink:0';
const RADAR_DOT_FIXED =
  'width:7px;height:7px;border-radius:50%;background:#18A957;box-shadow:0 0 0 3px rgba(24,169,87,.16);flex-shrink:0';
const MASTHEAD_BRAND_FIX =
  `<div onclick=\\"{{ goHome }}\\" style=\\"cursor:pointer;line-height:1\\">\\n        <div style=\\"display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap\\">\\n          <img src=\\"/assets/logo-orceu.svg\\" alt=\\"Orceu\\" style=\\"height:42px;width:auto;display:block;flex:0 0 auto\\">\\n          <span style=\\"font-family:'Axiforma',sans-serif;font-weight:800;font-size:16px;letter-spacing:.34em;text-transform:uppercase;color:#2146AD;padding-bottom:4px\\">RADAR<\\/span>\\n        <\\/div>\\n        <div style=\\"font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#5B72B8;margin-top:8px;font-weight:600\\">Radar da construcao civil com metodo<\\/div>\\n      <\\/div>`;
const MASTHEAD_BRAND_FIXED =
  `<div onclick=\\"{{ goHome }}\\" style=\\"cursor:pointer;line-height:1\\">\\n        <div style=\\"display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap\\">\\n          <span style=\\"font-family:'Axiforma',sans-serif;font-weight:800;font-size:15px;letter-spacing:.34em;text-transform:uppercase;color:#FAF7F1;padding-bottom:3px\\">RADAR<\\/span>\\n          <img src=\\"/assets/logo-orceu.svg\\" alt=\\"Orceu\\" style=\\"height:42px;width:auto;display:block;flex:0 0 auto\\">\\n        <\\/div>\\n        <div style=\\"font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8EA3E3;margin-top:12px;font-weight:600\\">O Radar oficial da construcao civil<\\/div>\\n      <\\/div>`;
const UTILITY_BAR_FIX =
  `<!-- Utility bar -->\\n  <div style=\\"background:#2146AD;color:#EAF0FF;border-bottom:1px solid rgba(33,70,173,.18)\\">\\n    <div class=\\"ub-inner px24\\" style=\\"max-width:1240px;margin:0 auto;padding:9px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px\\">\\n      <span class=\\"ub-date\\" style=\\"font-size:11px;letter-spacing:.14em;font-weight:600\\">{{ dateStr }}<\\/span>\\n      <div style=\\"display:flex;align-items:center;gap:22px;font-size:11.5px;letter-spacing:.1em;font-weight:600;text-transform:uppercase\\">\\n        <span class=\\"ub-hide-sm\\" style=\\"color:#9A9183\\" data-comment-anchor=\\"b8738bc7c8-span\\">Edição Brasil<\\/span>\\n        <span class=\\"ub-hide-sm\\" style=\\"color:#9A9183;cursor:pointer\\">Newsletter<\\/span>\\n        <span style=\\"color:#2146AD;cursor:pointer\\">Entrar<\\/span>\\n      <\\/div>\\n    <\\/div>\\n  <\\/div>\\n\\n  `;
const WEATHER_STATUS_FIX =
  '<div style=\\"display:flex;align-items:center;gap:7px;padding-left:20px;flex-shrink:0\\">\\n        <span style=\\"width:6px;height:6px;border-radius:50%;background:#2146AD\\"><\\/span>\\n        <span style=\\"font-size:10px;font-weight:600;letter-spacing:.04em;color:#A89D8C;white-space:nowrap\\">Atualizado há 4 min<\\/span>\\n      <\\/div>';

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

    if (rainyDays === 0) return "Sem chuva nos próximos 7 dias";
    if (rainyDays === 1) return "Chuva prevista em 1 dos próximos 7 dias";
    return `Chuva prevista em ${rainyDays} dos próximos 7 dias`;
  } catch {
    return "Sem chuva nos próximos 7 dias";
  }
}

export async function GET() {
  const htmlPath = path.join(process.cwd(), "public", "radar", "index.html");
  const [baseHtml, rainForecastLabel] = await Promise.all([
    readFile(htmlPath, "utf8"),
    getRainForecastLabel(),
  ]);
  const html = baseHtml
    .replace(UTILITY_BAR_FIX, "\n")
    .replace(TICKER_LABEL_FIX, TICKER_LABEL_FIXED)
    .replace(RADAR_DOT_FIX, RADAR_DOT_FIXED)
    .replace(MASTHEAD_BRAND_FIX, MASTHEAD_BRAND_FIXED)
    .replace(/<div class=\\"mh-search\\"[\s\S]*?<\\\/div>/, "")
    .replace(
      WEATHER_STATUS_FIX,
      `<div style=\\"display:flex;align-items:center;gap:7px;padding-left:20px;min-width:0;max-width:190px\\">\\n        <span style=\\"width:6px;height:6px;border-radius:50%;background:#2146AD;flex-shrink:0\\"><\\/span>\\n        <span style=\\"font-size:10px;font-weight:700;letter-spacing:.01em;color:#5B72B8;line-height:1.3;white-space:normal\\">${rainForecastLabel}<\\/span>\\n      <\\/div>`,
    )
    .replace(
      "display:flex;align-items:center;gap:20px;overflow-x:auto;padding:18px 24px;background:#FAF7F1;border-bottom:1px solid #ECE7DD",
      "display:flex;align-items:center;gap:20px;overflow-x:auto;padding:18px 24px;background:#FAF7F1;border-bottom:1px solid #ECE7DD;flex-wrap:wrap",
  );

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
