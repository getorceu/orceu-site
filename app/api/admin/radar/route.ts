import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type RadarCmsPayload = {
  secret?: string;
  title?: string;
  slug?: string;
  cat?: string;
  dek?: string;
  author?: string;
  role?: string;
  date?: string;
  read?: string;
  lead?: string;
  quote?: string;
  quoteBy?: string;
  subhead?: string;
  statValue?: string;
  statLabel?: string;
  end?: string;
  body?: string;
  image?: string;
  published?: boolean;
};

type RadarCmsTextField = Exclude<keyof RadarCmsPayload, "published">;

const CONTENT_DIR = path.join(process.cwd(), "content", "radar", "noticias");
const PUBLIC_NEWS_ASSETS_DIR = path.join(
  process.cwd(),
  "public",
  "assets",
  "radar",
  "noticias",
);

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function quoteYaml(value = "") {
  return JSON.stringify(value.trim());
}

function serializeMarkdown(payload: Required<RadarCmsPayload>, slug: string) {
  const body = payload.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .join("\n\n");

  return `---
title: ${quoteYaml(payload.title)}
slug: ${quoteYaml(slug)}
cat: ${quoteYaml(payload.cat)}
dek: ${quoteYaml(payload.dek)}
author: ${quoteYaml(payload.author)}
role: ${quoteYaml(payload.role)}
date: ${quoteYaml(payload.date)}
read: ${quoteYaml(payload.read)}
lead: ${quoteYaml(payload.lead)}
quote: ${quoteYaml(payload.quote)}
quoteBy: ${quoteYaml(payload.quoteBy)}
subhead: ${quoteYaml(payload.subhead)}
statValue: ${quoteYaml(payload.statValue)}
statLabel: ${quoteYaml(payload.statLabel)}
end: ${quoteYaml(payload.end)}
image: ${quoteYaml(payload.image)}
published: ${payload.published ? "true" : "false"}
---

${body}
`;
}

function normalizePayload(payload: RadarCmsPayload) {
  const title = payload.title?.trim();

  if (!title) {
    throw new Error("Informe o titulo da noticia.");
  }

  const slug = slugify(payload.slug?.trim() || title);

  if (!slug) {
    throw new Error("Nao foi possivel gerar o slug da noticia.");
  }

  return {
    article: {
      secret: payload.secret?.trim() ?? "",
      title,
      slug,
      cat: payload.cat?.trim() || "Mercado & Economia",
      dek: payload.dek?.trim() ?? "",
      author: payload.author?.trim() || "Redacao Orceu",
      role: payload.role?.trim() || "Radar Orceu",
      date: payload.date?.trim() || "30 de junho de 2026",
      read: payload.read?.trim() || "4 min",
      lead: payload.lead?.trim() ?? "",
      quote: payload.quote?.trim() ?? "",
      quoteBy: payload.quoteBy?.trim() ?? "",
      subhead: payload.subhead?.trim() ?? "",
      statValue: payload.statValue?.trim() ?? "",
      statLabel: payload.statLabel?.trim() ?? "",
      end: payload.end?.trim() ?? "",
      body: payload.body?.trim() ?? "",
      image: payload.image?.trim() ?? "",
      published: payload.published !== false,
    },
    slug,
  };
}

async function upsertGithubFile(relativePath: string, content: string) {
  const token = process.env.ORCEU_CMS_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  const repo =
    process.env.ORCEU_CMS_GITHUB_REPO ?? process.env.GITHUB_REPOSITORY;
  const branch = process.env.ORCEU_CMS_GITHUB_BRANCH ?? "main";

  if (!token || !repo) return false;

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${relativePath}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const existing = await fetch(`${apiUrl}?ref=${branch}`, { headers });
  const existingJson = existing.ok ? await existing.json() : null;
  const sha = existingJson?.sha;

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Publica noticia Radar: ${relativePath}`,
      content: Buffer.from(content).toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub recusou o commit: ${message}`);
  }

  return true;
}

async function upsertGithubBinaryFile(relativePath: string, content: Buffer) {
  const token = process.env.ORCEU_CMS_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  const repo =
    process.env.ORCEU_CMS_GITHUB_REPO ?? process.env.GITHUB_REPOSITORY;
  const branch = process.env.ORCEU_CMS_GITHUB_BRANCH ?? "main";

  if (!token || !repo) return false;

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${relativePath}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const existing = await fetch(`${apiUrl}?ref=${branch}`, { headers });
  const existingJson = existing.ok ? await existing.json() : null;
  const sha = existingJson?.sha;

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Publica imagem Radar: ${relativePath}`,
      content: content.toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub recusou o upload da imagem: ${message}`);
  }

  return true;
}

function getImageExtension(file: File) {
  const extensionFromName = file.name.match(/\.(webp|png|jpe?g|gif|avif)$/i)?.[1];

  if (extensionFromName) return extensionFromName.toLowerCase().replace("jpeg", "jpg");
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/gif") return "gif";
  if (file.type === "image/avif") return "avif";

  return "webp";
}

async function saveUploadedImage(slug: string, file: File) {
  if (!file.size) return "";

  if (!file.type.startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem valido.");
  }

  const extension = getImageExtension(file);
  const assetName = `${slug}.${extension}`;
  const publicPath = `/assets/radar/noticias/${assetName}`;
  const relativePath = `public/assets/radar/noticias/${assetName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const committed = await upsertGithubBinaryFile(relativePath, buffer);

  if (!committed) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Configure ORCEU_CMS_GITHUB_TOKEN e ORCEU_CMS_GITHUB_REPO para subir imagens em producao.",
      );
    }

    await mkdir(PUBLIC_NEWS_ASSETS_DIR, { recursive: true });
    await writeFile(path.join(PUBLIC_NEWS_ASSETS_DIR, assetName), buffer);
  }

  return publicPath;
}

async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return {
      payload: (await request.json()) as RadarCmsPayload,
      imageFile: null,
    };
  }

  const formData = await request.formData();
  const imageFile = formData.get("imageFile");
  const payload: RadarCmsPayload = {};
  const textFields: RadarCmsTextField[] = [
    "secret",
    "title",
    "slug",
    "cat",
    "dek",
    "author",
    "role",
    "date",
    "read",
    "lead",
    "quote",
    "quoteBy",
    "subhead",
    "statValue",
    "statLabel",
    "end",
    "body",
    "image",
  ];

  for (const key of textFields) {
    const value = formData.get(key);
    if (typeof value === "string") payload[key] = value;
  }

  payload.published = formData.get("published") === "on";

  return {
    payload,
    imageFile: imageFile instanceof File ? imageFile : null,
  };
}

export async function POST(request: Request) {
  try {
    const { payload, imageFile } = await readPayload(request);
    const configuredSecret = process.env.ORCEU_CMS_SECRET;

    if (configuredSecret && payload.secret !== configuredSecret) {
      return NextResponse.json(
        { ok: false, error: "Senha do CMS incorreta." },
        { status: 401 },
      );
    }

    if (process.env.NODE_ENV === "production" && !configuredSecret) {
      return NextResponse.json(
        { ok: false, error: "Configure ORCEU_CMS_SECRET antes de publicar." },
        { status: 500 },
      );
    }

    const { article, slug } = normalizePayload(payload);
    const uploadedImage = imageFile ? await saveUploadedImage(slug, imageFile) : "";
    if (uploadedImage) article.image = uploadedImage;

    const markdown = serializeMarkdown(article, slug);
    const relativePath = `content/radar/noticias/${slug}.md`;
    const committed = await upsertGithubFile(relativePath, markdown);

    if (!committed) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Configure ORCEU_CMS_GITHUB_TOKEN e ORCEU_CMS_GITHUB_REPO para publicar em producao.",
          },
          { status: 500 },
        );
      }

      await mkdir(CONTENT_DIR, { recursive: true });
      await writeFile(path.join(CONTENT_DIR, `${slug}.md`), markdown, "utf8");
    }

    return NextResponse.json({
      ok: true,
      mode: committed ? "github" : "local",
      path: relativePath,
      url: `/radar/${slug}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel publicar a noticia.",
      },
      { status: 400 },
    );
  }
}
