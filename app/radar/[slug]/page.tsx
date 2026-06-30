import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRadarArticle,
  getRadarArticleIsoDate,
  getRadarCategories,
  radarArticles,
  slugifyRadarCategory,
} from "@/lib/radar-news";
import { getSiteUrl } from "@/lib/site-config";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const CATEGORY_ART: Record<string, string> = {
  "inovacao-e-ia": "/assets/bim_technology.webp",
  "mercado-e-economia": "/assets/construction_market.webp",
  sustentabilidade: "/assets/sustainable_concrete.webp",
  "gestao-e-obras": "/assets/dashboard.png",
  "tecnologia-e-bim": "/assets/bim_technology.png",
  carreira: "/assets/lucas-ativo-2.png",
};

const SIDEBAR_BANNERS = [
  {
    title: "Controle obra, compras e caixa em um só fluxo",
    description:
      "O ecossistema Orceu organiza orçamento, suprimentos e financeiro sem planilha paralela.",
    href: "/",
    image: "/assets/dashboard.png",
    cta: "Conhecer o ecossistema",
  },
  {
    title: "Diagnóstico para destravar a gestão da sua construtora",
    description:
      "Entenda onde o improviso está consumindo margem e previsibilidade na operação.",
    href: "/",
    image: "/assets/banner-principal-hero.webp",
    cta: "Iniciar diagnóstico",
  },
];

const RADAR_CATEGORY_ORDER = [
  "inovacao-e-ia",
  "mercado-e-economia",
  "sustentabilidade",
  "gestao-e-obras",
  "tecnologia-e-bim",
  "carreira",
] as const;

const RADAR_METRICS = [
  { label: "INCC", value: "0,48%", delta: "▲ +0,06", tone: "positive" as const },
  { label: "CUB / m²", value: "R$ 2.847", delta: "▲ +0,7%", tone: "positive" as const },
  { label: "Aço", value: "R$ 5,12/kg", delta: "▼ −0,3%", tone: "negative" as const },
  { label: "Cimento", value: "R$ 38,90", delta: "▲ +1,2%", tone: "positive" as const },
  { label: "Selic", value: "9,75%", delta: "", tone: "neutral" as const },
];

const RADAR_TICKER = [
  "PIB da construção avança no trimestre e supera projeções do mercado",
  "Riow Construção anuncia novo método de gestão de canteiro com IA",
  "Custo do aço estável pelo terceiro mês consecutivo",
  "Demanda por orçamentistas dispara em capitais do Sudeste",
];

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

const radarStateSelectorScript = `
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
`;

const pageStyles = `
  .radar-article-shell {
    min-height: 100vh;
    background: #ffffff;
    color: #241f18;
    font-family: Axiforma, sans-serif;
    overflow-x: clip;
  }

  .radar-home-head {
    background: #2146ad;
    overflow-x: clip;
  }

  .radar-home-head-inner {
    max-width: 1240px;
    margin: 0 auto;
    padding: 26px 24px 22px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    overflow: hidden;
  }

  .radar-home-brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    flex: 1 1 auto;
    min-width: 0;
  }

  .radar-home-brand {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    max-width: 100%;
  }

  .radar-home-brand img {
    display: block;
    width: auto;
    height: 42px;
    max-width: min(100%, 380px);
  }

  .radar-news-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 20px;
    color: rgba(255,255,255,.82);
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .1em;
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;
    background: linear-gradient(135deg, rgba(17,20,28,.9), rgba(4,7,13,.94));
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 999px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 16px 38px rgba(0,0,0,.16);
  }

  .radar-home-category-nav {
    background: #2146ad;
    border-top: 3px solid #c9d9ff;
    overflow-x: clip;
  }

  .radar-home-nav {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: stretch;
    gap: 0;
    justify-content: flex-start;
    overflow-x: hidden;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .radar-home-nav::-webkit-scrollbar {
    display: none;
  }

  .radar-home-nav > a:not(.radar-back-home-link) {
    flex: 0 0 auto;
    padding: 14px 18px;
    background: transparent;
    color: #eef3ff;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    border-right: 1px solid rgba(255,255,255,.07);
    white-space: nowrap;
    display: flex;
    align-items: center;
  }

  .radar-home-nav > a:not(.radar-back-home-link) span {
    display: inline-block;
    transition: transform .22s ease;
    transform-origin: center;
  }

  .radar-home-nav > a:not(.radar-back-home-link):hover {
    background: transparent;
    color: #eef3ff;
  }

  .radar-home-nav > a:not(.radar-back-home-link):hover span {
    transform: scale(1.08);
  }

  .radar-home-nav > a:first-child {
    padding-left: 0;
  }

  .radar-home-nav > a.active {
    color: #ffffff;
  }

  .radar-nav-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    padding-left: 8px;
    border-left: 0;
    flex: 0 0 auto;
  }

  .radar-state-select-wrap {
    display: flex;
    align-items: center;
    padding: 0;
    margin-left: 0;
    border-left: 0;
    flex: 0 0 auto;
  }

  .radar-back-home-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px !important;
    margin-left: 0;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.08);
    color: #eef3ff !important;
    font-size: 8.8px !important;
    font-weight: 700;
    letter-spacing: .035em;
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
    white-space: nowrap;
    flex: 0 0 auto;
    align-self: center;
  }

  .radar-state-select {
    appearance: none;
    width: 46px !important;
    height: 22px !important;
    border: 0;
    border-radius: 999px;
    background-color: rgba(255,255,255,.08);
    color: #eef3ff;
    cursor: pointer;
    font-family: Axiforma, sans-serif;
    font-size: 9.5px !important;
    font-weight: 700;
    letter-spacing: .04em;
    line-height: 1;
    padding: 0 15px 0 8px;
    text-transform: uppercase;
    background-image: linear-gradient(45deg, transparent 50%, #eef3ff 50%), linear-gradient(135deg, #eef3ff 50%, transparent 50%);
    background-position: calc(100% - 9px) 50%, calc(100% - 6px) 50%;
    background-size: 3px 3px, 3px 3px;
    background-repeat: no-repeat;
    text-align: left;
  }

  .radar-state-select option {
    color: #2146ad;
    background: #ffffff;
  }

  .radar-home-nav .radar-back-home-link {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .radar-home-indicators {
    background: #ffffff;
    border-top: 1px solid #e7e2d8;
    border-bottom: 1px solid #e7e2d8;
    overflow-x: clip;
  }

  .radar-home-indicators-inner {
    max-width: 1240px;
    margin: 0 auto;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    gap: 0;
    overflow-x: auto;
  }

  .radar-home-label-block {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 24px;
    flex-shrink: 0;
  }

  .radar-home-metrics {
    display: flex;
    align-items: stretch;
    flex: 1;
  }

  .radar-home-indicator {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0;
    padding: 0 22px;
    border-left: 1px solid #ece7dd;
    flex-shrink: 0;
  }

  .radar-home-weather {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 22px;
    border-left: 1px solid #ece7dd;
    flex-shrink: 0;
    min-width: 190px;
  }

  .radar-home-label-copy {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }

  .radar-home-label-copy strong {
    color: #2146ad;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .radar-home-label-copy span {
    color: #8e95a5;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .radar-home-indicator-top strong,
  .radar-home-weather-copy strong {
    color: #8e95a5;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: .13em;
    text-transform: uppercase;
    line-height: 1;
    white-space: nowrap;
  }

  .radar-home-indicator-top {
    line-height: 1;
    margin-bottom: 5px;
  }

  .radar-home-indicator-bottom,
  .radar-home-weather-bottom {
    display: flex;
    align-items: baseline;
    gap: 8px;
    line-height: 1;
  }

  .radar-home-indicator-delta {
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
  }

  .radar-home-indicator-delta.positive {
    color: #2f6b3d;
  }

  .radar-home-indicator-delta.negative {
    color: #8b2e2e;
  }

  .radar-home-indicator-delta.neutral {
    color: #8e95a5;
  }

  .radar-home-indicator-value {
    color: #2146ad;
    font-size: 16px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .radar-home-weather-copy {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  .radar-home-weather-bottom span {
    color: #2146ad;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .radar-home-weather-bottom span:first-child {
    font-size: 16px;
    font-weight: 800;
  }

  .radar-home-ticker {
    background: #c9d9ff;
    color: #2146ad;
    overflow: hidden;
    display: flex;
    align-items: stretch;
  }

  .radar-home-ticker-tag {
    flex: 0 0 auto;
    padding: 9px 18px;
    background: #2146ad;
    color: #faf7f1;
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: .18em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .radar-home-ticker-window {
    overflow: hidden;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .radar-home-ticker-track {
    display: flex;
    gap: 48px;
    white-space: nowrap;
    animation: orceuTicker 40s linear infinite;
    padding-left: 48px;
    color: #2146ad;
  }

  .radar-home-ticker-track span {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .01em;
  }

  @keyframes orceuTicker {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  .radar-article-wrap {
    max-width: 1240px;
    margin: 0 auto;
    padding: 28px 24px 84px;
  }

  .radar-article-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 34px;
    align-items: start;
  }

  .radar-article-main {
    min-width: 0;
  }

  .radar-article-intro {
    margin-bottom: 16px;
  }

  .radar-article-kicker {
    display: block;
    width: max-content;
    margin-bottom: 9px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #000000;
    font-family: Axiforma, sans-serif;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: .12em;
    line-height: 1.1;
    text-transform: uppercase;
  }

  .radar-article-title {
    margin: 0;
    color: #2146ad;
    font-size: clamp(2.15rem, 3.7vw, 3.25rem);
    line-height: 1;
    letter-spacing: -.03em;
    text-wrap: balance;
    max-width: 12.5em;
  }

  .radar-article-dek {
    margin: 12px 0 0;
    max-width: 45em;
    color: #4a443b;
    font-size: 16px;
    line-height: 1.45;
  }

  .radar-article-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    color: #6e7891;
    font-size: 11.5px;
    font-weight: 600;
  }

  .radar-article-meta strong,
  .radar-article-meta a {
    color: #2146ad;
    text-decoration: none;
  }

  .radar-article-meta span {
    opacity: .82;
  }

  .radar-article-divider {
    margin: 18px 0;
    border: 0;
    border-top: 1px solid #e7e2d8;
  }

  .radar-article-hero {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #eae5da;
    border-radius: 7px;
    overflow: hidden;
    margin-bottom: 10px;
    position: relative;
  }

  .radar-article-hero img {
    object-fit: cover;
  }

  .radar-article-caption {
    margin-bottom: 30px;
    color: #9a8c7c;
    font-size: 12px;
    font-style: italic;
  }

  .radar-article-story {
    color: #241f18;
  }

  .radar-article-lead {
    margin: 0 0 22px;
    color: #2146ad;
    font-size: 21px;
    line-height: 1.6;
    font-weight: 500;
  }

  .radar-article-quote {
    margin: 30px 0;
    padding: 6px 0 6px 26px;
    border-left: 4px solid #c9d9ff;
  }

  .radar-article-quote p {
    margin: 0;
    color: #2146ad;
    font-size: 27px;
    font-weight: 700;
    line-height: 1.22;
    letter-spacing: -.01em;
  }

  .radar-article-quote footer {
    margin-top: 12px;
    color: #9a8c7c;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .radar-article-body p {
    margin: 0 0 22px;
    color: #2e2920;
    font-size: 18.5px;
    line-height: 1.68;
  }

  .radar-article-stat {
    display: flex;
    align-items: center;
    gap: 22px;
    margin: 28px 0;
    padding: 24px 28px;
    border-radius: 25px;
    background: #f5f8ff;
    border: 1px solid rgba(33,70,173,.08);
  }

  .radar-article-stat strong {
    display: block;
    color: #2146ad;
    font-size: 48px;
    line-height: .9;
    letter-spacing: -.03em;
    white-space: nowrap;
  }

  .radar-article-stat span {
    color: #4a443b;
    font-size: 15px;
    line-height: 1.55;
  }

  .radar-article-subhead {
    margin: 0 0 18px;
    color: #2146ad;
    font-size: 34px;
    line-height: 1.08;
    letter-spacing: -.02em;
  }

  .radar-read-more {
    margin-top: 34px;
  }

  .radar-read-more-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .radar-read-more-head span {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #c9d9ff;
    box-shadow: 0 0 0 6px rgba(201,217,255,.22);
    flex-shrink: 0;
  }

  .radar-read-more-head h2 {
    margin: 0;
    color: #2146ad;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .radar-read-more-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .radar-read-more-card {
    text-decoration: none;
  }

  .radar-read-more-thumb {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #eae5da;
    border-radius: 7px;
    overflow: hidden;
    position: relative;
    margin-bottom: 12px;
  }

  .radar-read-more-thumb img {
    object-fit: cover;
  }

  .radar-read-more-card em {
    display: block;
    margin-bottom: 8px;
    color: #000000;
    font-family: Axiforma, sans-serif;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .radar-read-more-card strong {
    display: block;
    color: #2146ad;
    font-size: 24px;
    line-height: 1.12;
    letter-spacing: -.01em;
  }

  .radar-article-sidebar {
    display: flex;
    flex-direction: column;
    gap: 34px;
    position: sticky;
    top: 24px;
  }

  .radar-most-read {
    background: #f5f8ff;
    border: 1px solid rgba(33,70,173,.1);
    border-radius: 25px;
    padding: 18px 18px 6px;
  }

  .radar-most-read-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .radar-most-read-head span {
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 11px solid #d8e4ff;
    transform: translateY(-1px);
  }

  .radar-most-read-head h2 {
    margin: 0;
    color: #2146ad;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .radar-most-read-list {
    background: #f9fbff;
    border: 1px solid rgba(33,70,173,.08);
    border-radius: 25px;
    padding: 4px 16px;
  }

  .radar-most-read-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    padding: 13px 0;
    align-items: start;
    border-bottom: 1px solid rgba(33,70,173,.1);
    text-decoration: none;
  }

  .radar-most-read-item:last-child {
    border-bottom: 0;
  }

  .radar-most-read-item b {
    min-width: 22px;
    color: #d5e2ff;
    font-size: 25px;
    line-height: .9;
  }

  .radar-most-read-item em {
    display: block;
    margin-bottom: 2px;
    color: #000000;
    font-family: Axiforma, sans-serif;
    font-size: 9px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .radar-most-read-item strong {
    display: block;
    color: #2449ad;
    font-size: 14.5px;
    font-weight: 600;
    line-height: 1.18;
  }

  .radar-sidebar-banner {
    position: relative;
    min-height: 320px;
    overflow: hidden;
    border-radius: 25px;
    background: #2146ad;
    color: #faf7f1;
    text-decoration: none;
  }

  .radar-sidebar-banner img {
    object-fit: cover;
    opacity: .22;
  }

  .radar-sidebar-banner::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(20,39,96,.1), rgba(20,39,96,.84));
  }

  .radar-sidebar-banner-copy {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    padding: 26px 24px;
  }

  .radar-sidebar-banner-copy span {
    display: block;
    margin-bottom: 10px;
    color: #000000;
    font-family: Axiforma, sans-serif;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .radar-sidebar-banner-copy strong {
    display: block;
    margin-bottom: 8px;
    font-size: 23px;
    line-height: 1.12;
  }

  .radar-sidebar-banner-copy p {
    margin: 0 0 18px;
    color: rgba(255,255,255,.82);
    font-size: 13.5px;
    line-height: 1.5;
  }

  .radar-sidebar-banner-copy em {
    color: #ffffff;
    font-size: 12px;
    font-style: normal;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  @media (max-width: 1080px) {
    .radar-home-indicators-inner {
      overflow-x: auto;
    }

    .radar-article-grid,
    .radar-read-more-grid {
      grid-template-columns: 1fr;
    }

    .radar-article-sidebar {
      position: static;
    }
  }

  @media (max-width: 720px) {
    .radar-home-head-inner,
    .radar-home-nav,
    .radar-home-indicators-inner,
    .radar-article-wrap {
      padding-left: 16px;
      padding-right: 16px;
    }

    .radar-home-brand img {
      height: 34px;
      max-width: 100%;
    }

    .radar-home-brand-row {
      flex-wrap: wrap;
    }

    .radar-news-badge {
      min-height: 30px;
      padding: 0 14px;
      font-size: 8.8px;
      letter-spacing: .08em;
    }

    .radar-home-nav > a:not(.radar-back-home-link) {
      padding-left: 16px;
      padding-right: 16px;
    }

    .radar-home-nav > a:first-child {
      padding-left: 0;
    }

    .radar-home-ticker-tag {
      padding-left: 18px;
      padding-right: 18px;
    }

    .radar-article-title {
      font-size: 2.5rem;
    }

    .radar-article-dek {
      font-size: 17px;
    }

    .radar-article-stat {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }
  }
`;

export async function generateStaticParams() {
  return radarArticles.map((article) => ({ slug: article.id }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getRadarArticle(slug);

  if (!article) {
    return {
      title: "Matéria não encontrada | Radar Orceu",
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/radar/${article.id}`;
  const categorySlug = slugifyRadarCategory(article.cat);
  const articleImage =
    article.image ??
    CATEGORY_ART[categorySlug] ??
    "/assets/banner-principal-hero@2x.webp";

  return {
    title: `${article.title} | Radar Orceu`,
    description: article.dek,
    category: article.cat,
    alternates: {
      canonical,
    },
    authors: [{ name: article.author }],
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.dek,
      siteName: "Radar Orceu",
      locale: "pt_BR",
      publishedTime: getRadarArticleIsoDate(article.date),
      modifiedTime: getRadarArticleIsoDate(article.date),
      authors: [article.author],
      tags: [article.cat, "Construção civil", "Radar Orceu"],
      images: [articleImage],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.dek,
      images: [articleImage],
    },
  };
}

export default async function RadarArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getRadarArticle(slug);

  if (!article) notFound();

  const categories = getRadarCategories().sort(
    (left, right) =>
      RADAR_CATEGORY_ORDER.indexOf(left.slug as (typeof RADAR_CATEGORY_ORDER)[number]) -
      RADAR_CATEGORY_ORDER.indexOf(right.slug as (typeof RADAR_CATEGORY_ORDER)[number]),
  );
  const related = radarArticles
    .filter((candidate) => candidate.id !== article.id)
    .filter((candidate) => candidate.cat === article.cat)
    .slice(0, 3);
  const mostRead = radarArticles
    .filter((candidate) => candidate.id !== article.id)
    .slice(0, 5);

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/radar/${article.id}`;
  const categorySlug = slugifyRadarCategory(article.cat);
  const articleIsoDate = getRadarArticleIsoDate(article.date);
  const articleImage =
    article.image ??
    CATEGORY_ART[categorySlug] ??
    "/assets/banner-principal-hero@2x.webp";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.dek,
    datePublished: articleIsoDate,
    dateModified: articleIsoDate,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Orceu",
      url: siteUrl,
    },
    mainEntityOfPage: articleUrl,
    articleSection: article.cat,
    articleBody: [article.lead, ...article.body, ...article.end].join(" "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Radar",
        item: `${siteUrl}/radar`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: article.cat,
        item: `${siteUrl}/radar/categoria/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <main className="radar-article-shell">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="radar-home-head">
        <div className="radar-home-head-inner">
          <div className="radar-home-brand-row">
            <Link
              href="/radar"
              aria-label="Voltar para a home do Radar"
              className="radar-home-brand"
            >
              <Image
                src="/assets/orceu-radar.svg"
                alt="Orceu Radar"
                width={380}
                height={44}
                priority
              />
            </Link>
            <span className="radar-news-badge">
              O radar de notícias da construção civil
            </span>
          </div>
        </div>
      </header>

      <nav className="radar-home-category-nav" aria-label="Categorias do Radar">
        <div className="radar-home-nav">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/radar/categoria/${category.slug}`}
              className={category.slug === categorySlug ? "active" : undefined}
            >
              <span>{category.name}</span>
            </Link>
          ))}
          <div className="radar-nav-actions">
            <label className="radar-state-select-wrap" aria-label="Selecionar estado">
              <select
                className="radar-state-select"
                data-radar-state-select
                defaultValue=""
                title="Selecionar estado"
              >
                <option value="" disabled>
                  UF
                </option>
                {BRAZIL_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <Link href="/" className="radar-back-home-link">
              Voltar para o Orceu
            </Link>
          </div>
        </div>
      </nav>
      <script dangerouslySetInnerHTML={{ __html: radarStateSelectorScript }} />

      <div className="radar-home-indicators">
        <div className="radar-home-indicators-inner">
          <div className="radar-home-label-block">
            <div className="radar-home-label-copy">
              <strong>Radar da obra</strong>
              <span>Indicadores atualizados</span>
            </div>
          </div>

          <div className="radar-home-metrics">
            {RADAR_METRICS.map((metric) => (
              <div key={metric.label} className="radar-home-indicator">
                <div className="radar-home-indicator-top">
                  <strong>{metric.label}</strong>
                </div>
                <div className="radar-home-indicator-bottom">
                  <div className="radar-home-indicator-value">{metric.value}</div>
                  {metric.delta ? (
                    <span className={`radar-home-indicator-delta ${metric.tone}`}>
                      {metric.delta}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}

            <div className="radar-home-weather">
              <div style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">
                ☀️
              </div>
              <div className="radar-home-weather-copy">
                <strong>Clima de obra</strong>
                <div className="radar-home-weather-bottom">
                  <span>28°</span>
                  <span>Favorável</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="radar-home-ticker" aria-label="Últimas notícias">
        <div className="radar-home-ticker-tag">● Últimas</div>
        <div className="radar-home-ticker-window">
          <div className="radar-home-ticker-track">
            {[...RADAR_TICKER, ...RADAR_TICKER].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <section className="radar-article-wrap">
        <div className="radar-article-grid">
          <div className="radar-article-main">
            <div className="radar-article-intro">
              <div className="radar-article-kicker">{article.cat}</div>
              <h1 className="radar-article-title">{article.title}</h1>
              <p className="radar-article-dek">{article.dek}</p>
              <div className="radar-article-meta">
                <strong>Por {article.author}</strong>
                <span>•</span>
                <span>{article.role}</span>
                <span>•</span>
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.read} de leitura</span>
              </div>
            </div>

            <hr className="radar-article-divider" />

            <div className="radar-article-hero">
              <Image
                src={articleImage}
                alt={article.title}
                fill
                sizes="(max-width: 1080px) 100vw, 66vw"
                priority
              />
            </div>
            <div className="radar-article-caption">
              Imagem ilustrativa da matéria.
            </div>

            <article className="radar-article-story">
              <p className="radar-article-lead">{article.lead}</p>

              <figure className="radar-article-quote">
                <blockquote>
                  <p>{article.quote}</p>
                </blockquote>
                <figcaption>{article.quoteBy}</figcaption>
              </figure>

              <div className="radar-article-body">
                {article.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="radar-article-stat">
                <strong>{article.stat.value}</strong>
                <span>{article.stat.label}</span>
              </div>

              <h2 className="radar-article-subhead">{article.subhead}</h2>

              <div className="radar-article-body">
                {article.end.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            {related.length > 0 ? (
              <section className="radar-read-more">
                <div className="radar-read-more-head">
                  <span />
                  <h2>Leia tambem</h2>
                </div>
                <div className="radar-read-more-grid">
                  {related.map((candidate) => (
                    <Link
                      key={candidate.id}
                      href={`/radar/${candidate.id}`}
                      className="radar-read-more-card"
                    >
                      <div className="radar-read-more-thumb">
                        <Image
                          src={
                            CATEGORY_ART[slugifyRadarCategory(candidate.cat)] ??
                            "/assets/banner-principal-hero.webp"
                          }
                          alt={candidate.title}
                          fill
                          sizes="(max-width: 1080px) 100vw, 30vw"
                        />
                      </div>
                      <em>{candidate.cat}</em>
                      <strong>{candidate.title}</strong>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="radar-article-sidebar">
            <section>
              <div className="radar-most-read-head">
                <span />
                <h2>Mais lidas</h2>
              </div>
              <div className="radar-most-read-list">
                {mostRead.map((candidate, index) => (
                  <Link
                    key={candidate.id}
                    href={`/radar/${candidate.id}`}
                    className="radar-most-read-item"
                  >
                    <b>{index + 1}</b>
                    <div>
                      <em>{candidate.cat}</em>
                      <strong>{candidate.title}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {SIDEBAR_BANNERS.map((banner) => (
              <Link
                key={banner.title}
                href={banner.href}
                className="radar-sidebar-banner"
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 1080px) 100vw, 320px"
                />
                <div className="radar-sidebar-banner-copy">
                  <span>Especial Orceu</span>
                  <strong>{banner.title}</strong>
                  <p>{banner.description}</p>
                  <em>{banner.cta}</em>
                </div>
              </Link>
            ))}
          </aside>
        </div>
      </section>
    </main>
  );
}
