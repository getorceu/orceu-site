import Script from "next/script";
import { loadLegacyHomeHtml } from "@/lib/legacy-site";

const heroHeaderBoundsScript = `(() => {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  if (!header || !hero) return;

  const syncHeaderBounds = () => {
    const heroRect = hero.getBoundingClientRect();
    const headerHeight = header.offsetHeight || 0;
    const floatingOffset = window.innerWidth <= 680 ? 8 : 14;
    const headerBottom = floatingOffset + headerHeight;
    const staysInsideHero = heroRect.bottom > headerBottom;

    header.classList.toggle("is-outside-hero", !staysInsideHero);
  };

  syncHeaderBounds();
  window.addEventListener("scroll", syncHeaderBounds, { passive: true });
  window.addEventListener("resize", syncHeaderBounds, { passive: true });
  window.addEventListener("load", syncHeaderBounds);
  window.addEventListener("hashchange", syncHeaderBounds, { passive: true });
  window.requestAnimationFrame(syncHeaderBounds);
})();`;

const mindModalScript = `(() => {
  const modal = document.getElementById("orceu-mind-modal");
  if (!modal) return;

  const triggers = document.querySelectorAll("#solucoes-mind .card-cta.light");
  const closeButtons = modal.querySelectorAll("[data-mind-modal-close]");

  const openModal = (event) => {
    if (event) event.preventDefault();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("mind-modal-open");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mind-modal-open");
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", openModal));
  closeButtons.forEach((button) => button.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
})();`;

export default async function Home() {
  const homeHtml = await loadLegacyHomeHtml();

  return (
    <>
      <div
        className="legacy-home"
        dangerouslySetInnerHTML={{ __html: homeHtml }}
      />
      <div
        className="mind-modal"
        id="orceu-mind-modal"
        role="presentation"
        aria-hidden="true"
      >
        <button
          className="mind-modal-backdrop"
          type="button"
          aria-label="Fechar Orceu Mind"
          data-mind-modal-close
        />
        <section
          className="mind-modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mind-modal-title"
        >
          <button
            className="mind-modal-close"
            type="button"
            aria-label="Fechar Orceu Mind"
            data-mind-modal-close
          >
            Fechar
          </button>
          <img
            className="mind-modal-head"
            src="/assets/orceu-mind-head.webp"
            alt="Orceu Mind. O mastermind mais exclusivo da construção civil."
          />
          <h2 className="mind-modal-title" id="mind-modal-title">
            O mastermind mais exclusivo da construção civil.
          </h2>
          <div className="mind-modal-content">
            <p className="mind-modal-lead">
              O Orceu Mind reúne donos de construtora, engenheiros e arquitetos
              que já saíram da Obra Caos e operam num outro nível. Um ambiente
              fechado, onde decisão se acelera, experiência real se troca e
              cada membro cresce cercado de gente que joga o mesmo jogo.
            </p>
            <div className="mind-modal-logo-marquee" aria-hidden="true">
              <div className="mind-modal-logo-track">
                <img src="/assets/logos%20minds0.svg" alt="" />
                <img src="/assets/logos%20minds0.svg" alt="" />
              </div>
            </div>
            <p className="mind-modal-kicker">Aqui dentro você encontra:</p>
            <div className="mind-modal-benefits">
              <p>Networking qualificado com quem já construiu operação previsível e lucrativa.</p>
              <p>Troca direta de experiência sobre gestão, processos, pessoas e crescimento.</p>
              <p>Discussões estratégicas que não acontecem em nenhum outro lugar do setor.</p>
              <p>Um círculo de confiança para destravar as decisões mais difíceis do negócio.</p>
            </div>
            <p className="mind-modal-access">
              O Mind não está aberto ao público. O acesso é exclusivo para quem
              passou pela imersão do Orceu Empresarial e provou que está pronto
              para esse nível.
            </p>
          </div>
          <p className="mind-modal-note">A porta de entrada para o Orceu Mind:</p>
          <a
            className="mind-modal-cta"
            href="https://www.orceuempresarial.com.br/"
            target="_blank"
            rel="noreferrer"
          >
            Conhecer o Orceu Empresarial
          </a>
        </section>
      </div>
      <Script id="hero-header-bounds" strategy="afterInteractive">
        {heroHeaderBoundsScript}
      </Script>
      <Script id="orceu-mind-modal" strategy="afterInteractive">
        {mindModalScript}
      </Script>
      <Script
        src="/legacy-scripts/home-part-1.js"
        strategy="afterInteractive"
      />
      <Script
        src="/legacy-scripts/home-part-2.js"
        strategy="afterInteractive"
      />
    </>
  );
}
