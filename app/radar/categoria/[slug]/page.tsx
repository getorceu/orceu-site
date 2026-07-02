import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRadarArticleIsoDate,
  getRadarCategories,
  getRadarCategory,
} from "@/lib/radar-news";
import { getSiteUrl } from "@/lib/site-config";
import { RadarPageChrome } from "../../radar-page-chrome";

type RadarCategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getRadarCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: RadarCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getRadarCategory(slug);

  if (!category) {
    return {
      title: "Categoria não encontrada | Radar Orceu",
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/radar/categoria/${category.slug}`;

  return {
    title: `${category.name} | Radar Orceu`,
    description: category.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${category.name} | Radar Orceu`,
      description: category.description,
      siteName: "Radar Orceu",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | Radar Orceu`,
      description: category.description,
    },
  };
}

export default async function RadarCategoryPage({
  params,
}: RadarCategoryPageProps) {
  const { slug } = await params;
  const category = getRadarCategory(slug);

  if (!category) notFound();

  const siteUrl = getSiteUrl();
  const categoryUrl = `${siteUrl}/radar/categoria/${category.slug}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} | Radar Orceu`,
    description: category.description,
    url: categoryUrl,
    isPartOf: `${siteUrl}/radar`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: category.articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/radar/${article.id}`,
        name: article.title,
      })),
    },
  };

  return (
    <RadarPageChrome>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 24px 80px",
          fontFamily: "Axiforma, sans-serif",
        }}
      >
        <Link
          href="/radar"
          style={{
            display: "inline-block",
            marginBottom: 20,
            color: "#2146AD",
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            fontSize: 12,
          }}
        >
          Voltar ao Radar
        </Link>
        <div
          style={{
            color: "#6D7688",
            fontSize: 13,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Categoria editorial
        </div>
        <h1
          style={{
            margin: "0 0 14px",
            color: "#2146AD",
            fontSize: "clamp(2.3rem, 5vw, 4.1rem)",
            lineHeight: 0.98,
          }}
        >
          {category.name}
        </h1>
        <p
          style={{
            margin: "0 0 36px",
            maxWidth: 760,
            color: "#52607A",
            fontSize: 18,
            lineHeight: 1.6,
          }}
        >
          {category.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {category.articles.map((article) => (
            <Link
              key={article.id}
              href={`/radar/${article.id}`}
              style={{
                display: "block",
                padding: 24,
                borderRadius: 22,
                background: "#F5F8FF",
                border: "1px solid rgba(33,70,173,.12)",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  color: "#6D7688",
                  fontSize: 12,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {new Date(getRadarArticleIsoDate(article.date)).toLocaleDateString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  },
                )}
              </div>
              <div
                style={{
                  color: "#2146AD",
                  fontWeight: 800,
                  fontSize: 24,
                  lineHeight: 1.14,
                  marginBottom: 12,
                }}
              >
                {article.title}
              </div>
              <div
                style={{
                  color: "#52607A",
                  fontSize: 16,
                  lineHeight: 1.55,
                  marginBottom: 16,
                }}
              >
                {article.dek}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  color: "#6D7688",
                  fontSize: 13,
                }}
              >
                <strong style={{ color: "#2146AD" }}>{article.author}</strong>
                <span>{article.read} de leitura</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </RadarPageChrome>
  );
}
