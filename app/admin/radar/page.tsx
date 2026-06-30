"use client";

import { ChangeEvent, FormEvent, useState } from "react";

const categories = [
  "Inovação & IA",
  "Mercado & Economia",
  "Sustentabilidade",
  "Gestão & Obras",
  "Tecnologia & BIM",
  "Carreira",
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export default function RadarAdminPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview("");
      setImageName("");
      return;
    }

    setImagePreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return URL.createObjectURL(file);
    });
    setImageName(file.name);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("Publicando...");

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/radar", {
      method: "POST",
      body: form,
    });
    const result = await response.json();

    setIsSaving(false);
    setStatus(
      result.ok
        ? `Publicado em ${result.url} (${result.mode}).`
        : result.error,
    );
  }

  return (
    <main className="radar-admin">
      <style>{`
        @font-face{font-family:Axiforma;src:url('/assets/axiforma-book.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
        @font-face{font-family:Axiforma;src:url('/assets/axiforma-bold.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap}
        .radar-admin{min-height:100vh;background:#f6f8ff;color:#111827;font-family:Axiforma,Arial,sans-serif;padding:48px clamp(20px,4vw,72px)}
        .radar-admin-shell{max-width:1120px;margin:0 auto;background:#fff;border:1px solid #d8e4ff;border-radius:25px;padding:34px;box-shadow:0 18px 50px rgba(33,70,173,.08)}
        .radar-admin h1{margin:0;color:#2146ad;font-size:clamp(34px,5vw,64px);line-height:.95;letter-spacing:-.05em}
        .radar-admin p{color:#667085;font-size:16px;line-height:1.55;max-width:720px}
        .radar-admin-layout{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:28px;align-items:start;margin-top:28px}
        .radar-admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
        .radar-admin label{display:grid;gap:8px;color:#111827;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .radar-admin input,.radar-admin select,.radar-admin textarea{width:100%;border:1px solid #cdd9f4;border-radius:18px;background:#fff;color:#111827;font:400 16px/1.4 Axiforma,Arial,sans-serif;padding:14px 16px;outline:none}
        .radar-admin textarea{min-height:130px;resize:vertical}
        .radar-admin .wide{grid-column:1/-1}
        .radar-admin-preview{position:sticky;top:24px;border:1px solid #d8e4ff;background:#f7faff;border-radius:25px;padding:18px}
        .radar-admin-image-drop{display:grid;place-items:center;min-height:240px;border:1.5px dashed #9fb6ee;border-radius:7px;background:#eaf2ff;color:#2146ad;text-align:center;cursor:pointer;overflow:hidden}
        .radar-admin-image-drop input{display:none}
        .radar-admin-image-drop img{width:100%;height:100%;object-fit:cover;display:block}
        .radar-admin-image-copy{padding:18px;display:grid;gap:8px}
        .radar-admin-image-copy strong{font-size:16px}
        .radar-admin-image-copy span{color:#667085;font-size:13px;line-height:1.4;text-transform:none;letter-spacing:0;font-weight:400}
        .radar-admin-card-preview{margin-top:18px;background:#fff;border:1px solid #d8e4ff;border-radius:25px;padding:20px}
        .radar-admin-kicker{color:#000;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px}
        .radar-admin-card-preview h2{margin:0;color:#2146ad;font-size:28px;line-height:1.05;letter-spacing:-.04em}
        .radar-admin-card-preview p{margin:12px 0 0;font-size:14px}
        .radar-admin-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:24px}
        .radar-admin button{border:0;border-radius:999px;background:#2146ad;color:#fff;font:700 16px Axiforma,Arial,sans-serif;padding:16px 28px;cursor:pointer}
        .radar-admin button:disabled{opacity:.55;cursor:not-allowed}
        .radar-admin-status{color:#2146ad;font-weight:700}
        .radar-admin-check{display:flex!important;grid-template-columns:auto 1fr!important;align-items:center;gap:10px;text-transform:none!important;letter-spacing:0!important;font-size:15px!important;color:#667085!important}
        .radar-admin-check input{width:auto}
        @media(max-width:980px){.radar-admin-layout{grid-template-columns:1fr}.radar-admin-preview{position:static}}
        @media(max-width:760px){.radar-admin-shell{padding:24px}.radar-admin-grid{grid-template-columns:1fr}}
      `}</style>
      <section className="radar-admin-shell">
        <h1>CMS Radar Orceu</h1>
        <p>
          Publique noticias com URL propria, imagem de capa, sitemap, feed e SEO
          automaticos. Voce preenche a materia aqui; o site cuida dos arquivos
          por baixo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="radar-admin-layout">
            <div className="radar-admin-grid">
              <label>
                Senha do CMS
                <input name="secret" type="password" autoComplete="current-password" />
              </label>

              <label>
                Categoria
                <select name="cat" defaultValue="Mercado & Economia">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="wide">
                Titulo
                <input
                  name="title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (!slug) setSlug(slugify(event.target.value));
                  }}
                  required
                />
              </label>

              <label>
                Slug / URL
                <input
                  name="slug"
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  placeholder="minha-noticia"
                />
              </label>

              <label>
                Data
                <input name="date" defaultValue="30 de junho de 2026" />
              </label>

              <label>
                Autor
                <input name="author" defaultValue="Redacao Orceu" />
              </label>

              <label>
                Cargo
                <input name="role" defaultValue="Radar Orceu" />
              </label>

              <label>
                Tempo de leitura
                <input name="read" defaultValue="4 min" />
              </label>

              <label>
                URL alternativa da imagem
                <input
                  name="image"
                  placeholder="/assets/radar/noticias/imagem.webp"
                />
              </label>

              <label className="wide">
                Descricao SEO / chamada
                <textarea name="dek" required />
              </label>

              <label className="wide">
                Lead
                <textarea name="lead" required />
              </label>

              <label>
                Frase de destaque
                <textarea name="quote" />
              </label>

              <label>
                Autor da frase
                <textarea name="quoteBy" />
              </label>

              <label>
                Intertitulo
                <input name="subhead" />
              </label>

              <label>
                Estatistica
                <input name="statValue" placeholder="40%" />
              </label>

              <label className="wide">
                Legenda da estatistica
                <input name="statLabel" />
              </label>

              <label className="wide">
                Corpo da noticia
                <textarea
                  name="body"
                  required
                  placeholder="Separe os paragrafos com uma linha em branco."
                />
              </label>

              <label className="wide">
                Fechamento
                <textarea
                  name="end"
                  placeholder="Separe paragrafos finais com |"
                />
              </label>

              <label className="radar-admin-check wide">
                <input name="published" type="checkbox" defaultChecked />
                Publicar agora
              </label>
            </div>

            <aside className="radar-admin-preview">
              <label className="radar-admin-image-drop">
                <input
                  name="imageFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview da imagem da noticia" />
                ) : (
                  <span className="radar-admin-image-copy">
                    <strong>Escolher imagem de capa</strong>
                    <span>PNG, JPG, WEBP ou AVIF. Ela vai para o ar junto com a noticia.</span>
                  </span>
                )}
              </label>
              <div className="radar-admin-card-preview">
                <div className="radar-admin-kicker">Preview</div>
                <h2>{title || "Titulo da noticia"}</h2>
                <p>
                  {imageName
                    ? `Imagem selecionada: ${imageName}`
                    : "A imagem escolhida aparece aqui antes de publicar."}
                </p>
              </div>
            </aside>
          </div>

          <div className="radar-admin-actions">
            <button disabled={isSaving} type="submit">
              {isSaving ? "Publicando..." : "Publicar noticia"}
            </button>
            {status ? <span className="radar-admin-status">{status}</span> : null}
          </div>
        </form>
      </section>
    </main>
  );
}
