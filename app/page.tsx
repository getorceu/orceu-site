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
  const cta = modal.querySelector(".mind-modal-cta");

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

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", openModal);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  if (cta) {
    cta.addEventListener("click", () => {
      closeModal();
    });
  }

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
            FECHAR
          </button>
          <div className="mind-modal-logo" aria-label="Orceu Mind">
            <img src="/assets/logo-orceu.svg" alt="" aria-hidden="true" />
            <span>MIND</span>
          </div>
          <p className="mind-modal-eyebrow">ORCEU MIND</p>
          <h2 className="mind-modal-title" id="mind-modal-title">
            O MASTERMIND MAIS EXCLUSIVO DA CONSTRUÇÃO CIVIL.
          </h2>
          <div className="mind-modal-copy">
            <p>
              O ORCEU MIND REÚNE DONOS DE CONSTRUTORA, ENGENHEIROS E
              ARQUITETOS QUE JÁ SAÍRAM DA OBRA CAOS E OPERAM NUM OUTRO NÍVEL.
              UM AMBIENTE FECHADO, ONDE DECISÃO SE ACELERA, EXPERIÊNCIA REAL SE
              TROCA E CADA MEMBRO CRESCE CERCADO DE GENTE QUE JOGA O MESMO JOGO.
            </p>
            <p>AQUI DENTRO VOCÊ ENCONTRA:</p>
            <ul>
              <li>
                NETWORKING QUALIFICADO COM QUEM JÁ CONSTRUIU OPERAÇÃO
                PREVISÍVEL E LUCRATIVA
              </li>
              <li>
                TROCA DIRETA DE EXPERIÊNCIA SOBRE GESTÃO, PROCESSOS, PESSOAS E
                CRESCIMENTO
              </li>
              <li>
                ACESSO A DISCUSSÕES ESTRATÉGICAS QUE NÃO ACONTECEM EM NENHUM
                OUTRO LUGAR DO SETOR
              </li>
              <li>
                UM CÍRCULO DE CONFIANÇA PARA DESTRAVAR AS DECISÕES MAIS
                DIFÍCEIS DO SEU NEGÓCIO
              </li>
            </ul>
            <p>
              O MIND NÃO ESTÁ ABERTO AO PÚBLICO. O ACESSO É EXCLUSIVO PARA
              QUEM PASSOU PELA IMERSÃO DO ORCEU EMPRESARIAL E PROVOU QUE ESTÁ
              PRONTO PARA ESSE NÍVEL.
            </p>
          </div>
          <p className="mind-modal-note">
            A PORTA DE ENTRADA PARA O ORCEU MIND.
          </p>
          <a className="mind-modal-cta" href="#solucoes-empresarial">
            CONHECER O ORCEU EMPRESARIAL
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
