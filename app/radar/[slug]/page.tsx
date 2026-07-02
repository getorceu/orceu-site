import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRadarArticle,
  getRadarArticleIsoDate,
  radarArticles,
  slugifyRadarCategory,
} from "@/lib/radar-news";
import { getSiteUrl } from "@/lib/site-config";
import { RadarPageChrome } from "../radar-page-chrome";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.dek,
    },
  };
}

export default async function RadarArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getRadarArticle(slug);

  if (!article) notFound();

  const related = radarArticles
    .filter((candidate) => candidate.id !== article.id)
    .filter((candidate) => candidate.cat === article.cat)
    .slice(0, 3);

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/radar/${article.id}`;
  const categorySlug = slugifyRadarCategory(article.cat);
  const articleIsoDate = getRadarArticleIsoDate(article.date);
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
    <RadarPageChrome>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "48px 24px 80px",
          fontFamily: "Axiforma, sans-serif",
        }}
      >
        <Link
          href="/radar"
          style={{
            display: "inline-block",
            marginBottom: 24,
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
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 18,
            color: "#6D7688",
            fontSize: 13,
          }}
        >
          <span
            style={{
              color: "#2146AD",
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
            }}
          >
            <Link
              href={`/radar/categoria/${categorySlug}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {article.cat}
            </Link>
          </span>
          <span>{article.date}</span>
          <span>{article.read} de leitura</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(2.25rem, 5vw, 4.25rem)",
            lineHeight: 1,
            margin: "0 0 18px",
            color: "#2146AD",
          }}
        >
          {article.title}
        </h1>
        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            lineHeight: 1.5,
            margin: "0 0 26px",
            color: "#52607A",
            maxWidth: 760,
          }}
        >
          {article.dek}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 36,
            color: "#6D7688",
            fontSize: 14,
          }}
        >
          <strong style={{ color: "#2146AD" }}>Por {article.author}</strong>
          <span>{article.role}</span>
        </div>

        <article
          style={{
            display: "grid",
            gap: 28,
            maxWidth: 760,
            fontSize: 18,
            lineHeight: 1.75,
            color: "#29364B",
          }}
        >
          <p style={{ margin: 0 }}>{article.lead}</p>
          <blockquote
            style={{
              margin: 0,
              padding: "24px 28px",
              background: "#F5F8FF",
              borderLeft: "6px solid #2146AD",
              borderRadius: 18,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.2,
                color: "#2146AD",
                fontWeight: 800,
              }}
            >
              {article.quote}
            </p>
            <footer
              style={{
                marginTop: 12,
                color: "#63708A",
                fontSize: 14,
              }}
            >
              {article.quoteBy}
            </footer>
          </blockquote>
          {article.body.map((paragraph) => (
            <p key={paragraph} style={{ margin: 0 }}>
              {paragraph}
            </p>
          ))}
          <section
            style={{
              padding: "24px 28px",
              background: "#2146AD",
              color: "#fff",
              borderRadius: 20,
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {article.stat.value}
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.5 }}>{article.stat.label}</div>
          </section>
          <h2
            style={{
              margin: 0,
              color: "#2146AD",
              fontSize: 32,
              lineHeight: 1.1,
            }}
          >
            {article.subhead}
          </h2>
          {article.end.map((paragraph) => (
            <p key={paragraph} style={{ margin: 0 }}>
              {paragraph}
            </p>
          ))}
        </article>

        {related.length > 0 ? (
          <section style={{ marginTop: 72 }}>
            <h2
              style={{
                margin: "0 0 20px",
                color: "#2146AD",
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              Leia também
            </h2>
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {related.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/radar/${candidate.id}`}
                  style={{
                    display: "block",
                    padding: 20,
                    borderRadius: 18,
                    background: "#F5F8FF",
                    border: "1px solid rgba(33,70,173,.12)",
                  }}
                >
                  <div
                    style={{
                      color: "#6D7688",
                      fontSize: 12,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    {candidate.cat}
                  </div>
                  <div
                    style={{
                      color: "#2146AD",
                      fontWeight: 800,
                      fontSize: 20,
                      lineHeight: 1.2,
                      marginBottom: 10,
                    }}
                  >
                    {candidate.title}
                  </div>
                  <div
                    style={{
                      color: "#52607A",
                      fontSize: 15,
                      lineHeight: 1.45,
                    }}
                  >
                    {candidate.dek}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </RadarPageChrome>
  );
}
