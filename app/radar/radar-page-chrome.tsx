import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getRadarCategories } from "@/lib/radar-news";

type RadarPageChromeProps = {
  children: ReactNode;
};

const tickerItems = [
  "PIB da construção avança no trimestre",
  "Custo do aço estável pelo terceiro mês",
  "Gestão de obras ganha força com IA",
  "Demanda por orçamentistas dispara",
];

export function RadarPageChrome({ children }: RadarPageChromeProps) {
  const categories = getRadarCategories();

  return (
    <main className="radar-page">
      <RadarPageStyles />
      <header className="radar-page-top" aria-label="Topo do Radar Orceu">
        <div className="radar-page-masthead">
          <Link className="radar-page-brand" href="/radar" aria-label="Ir para o Radar Orceu">
            <Image
              src="/assets/ORCEU RADAR0.svg"
              alt="Orceu Radar"
              width={360}
              height={54}
              priority
            />
          </Link>
          <div className="radar-page-edition">
            <span>Radar da construção civil</span>
            <strong>Com método, dados e contexto</strong>
          </div>
        </div>
        <nav className="radar-page-categories" aria-label="Categorias do Radar">
          <Link href="/radar">Início</Link>
          {categories.map((category) => (
            <Link key={category.slug} href={`/radar/categoria/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="radar-page-ticker" aria-label="Destaques do Radar">
          <span className="radar-page-ticker-label">Radar agora</span>
          <div className="radar-page-ticker-window">
            <div className="radar-page-ticker-track">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}

function RadarPageStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .radar-page {
            min-height: 100vh;
            font-family: Axiforma, sans-serif;
            color: #14223f;
            background: linear-gradient(180deg, #eef4ff 0%, #f8fbff 24%, #ffffff 100%);
          }

          .radar-page-top {
            background: #2146ad;
            color: #ffffff;
            border-bottom: 1px solid rgba(255, 255, 255, 0.16);
          }

          .radar-page-masthead {
            width: min(100%, 1240px);
            margin: 0 auto;
            padding: 24px 24px 20px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 24px;
          }

          .radar-page-brand {
            display: inline-flex;
            align-items: center;
            min-width: 0;
          }

          .radar-page-brand img {
            display: block;
            width: min(360px, 68vw);
            height: auto;
          }

          .radar-page-edition {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            text-align: right;
            text-transform: uppercase;
          }

          .radar-page-edition span {
            color: #c9d9ff;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.18em;
          }

          .radar-page-edition strong {
            color: #ffffff;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
          }

          .radar-page-categories {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 12px max(24px, calc((100vw - 1240px) / 2));
            overflow-x: auto;
            background: #f8fbff;
            border-top: 1px solid rgba(255, 255, 255, 0.14);
            border-bottom: 1px solid rgba(33, 70, 173, 0.12);
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .radar-page-categories::-webkit-scrollbar {
            display: none;
          }

          .radar-page-categories a {
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 34px;
            padding: 0 14px;
            color: #2146ad;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            border: 1px solid rgba(33, 70, 173, 0.12);
            border-radius: 999px;
            background: rgba(234, 242, 255, 0.82);
          }

          .radar-page-ticker {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
            padding: 10px max(24px, calc((100vw - 1240px) / 2));
            overflow: hidden;
            background: #eaf2ff;
            color: #2146ad;
            border-bottom: 1px solid rgba(33, 70, 173, 0.1);
          }

          .radar-page-ticker-label {
            flex: 0 0 auto;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .radar-page-ticker-window {
            min-width: 0;
            overflow: hidden;
          }

          .radar-page-ticker-track {
            display: flex;
            width: max-content;
            gap: 28px;
            animation: radarPageTicker 32s linear infinite;
          }

          .radar-page-ticker-track span {
            flex: 0 0 auto;
            color: #5b72b8;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          @keyframes radarPageTicker {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          @media (max-width: 680px) {
            .radar-page-masthead {
              padding: 20px 16px 18px;
              align-items: flex-start;
              flex-direction: column;
              gap: 14px;
            }

            .radar-page-brand img {
              width: min(300px, 78vw);
            }

            .radar-page-edition {
              align-items: flex-start;
              text-align: left;
            }

            .radar-page-categories,
            .radar-page-ticker {
              padding-right: 16px;
              padding-left: 16px;
            }
          }
        `,
      }}
    />
  );
}
