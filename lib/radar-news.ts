import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type RadarArticle = {
  id: string;
  cat: string;
  title: string;
  dek: string;
  author: string;
  role: string;
  date: string;
  read: string;
  lead: string;
  quote: string;
  quoteBy: string;
  subhead: string;
  body: string[];
  stat: {
    value: string;
    label: string;
  };
  end: string[];
  image?: string;
  published?: boolean;
};

export type RadarCategory = {
  slug: string;
  name: string;
  description: string;
  articles: RadarArticle[];
};

const fallbackRadarArticles: RadarArticle[] = [
  {
    id: "ia-bim",
    cat: "Inovação & IA",
    title: "IA e BIM: a revolução tecnológica que está acelerando obras no país",
    dek: "A integração de inteligência artificial com modelagem BIM reduz erros de projeto em até 40% e encurta cronogramas — e já começa a redesenhar o canteiro brasileiro.",
    author: "Marina Tavares",
    role: "Editora de Tecnologia",
    date: "29 de junho de 2026",
    read: "6 min",
    lead: "Há cinco anos, compatibilizar um projeto estrutural com o hidráulico era uma reunião de pranchas, café e paciência. Hoje, em construtoras que adotaram modelos BIM acoplados a inteligência artificial, o mesmo trabalho roda em segundos — e devolve uma lista priorizada de conflitos antes que o concreto seja lançado.",
    quote: "Quem entra na obra com o modelo resolvido não improvisa no canteiro. Improviso virou exceção, não rotina.",
    quoteBy: "Lucas Arruda, fundador do Orceu",
    subhead: "Do desenho ao orçamento, sem retrabalho",
    body: [
      "O salto não está apenas em desenhar em três dimensões. Está em ligar o modelo a orçamento, suprimentos e cronograma num único fluxo, de modo que uma alteração de projeto recalcule automaticamente quantitativos, compras e custo final da obra.",
      "Construtoras de médio porte relatam queda expressiva no retrabalho depois de integrar projeto e execução. O ganho aparece menos no software e mais na previsibilidade: a obra passa a entregar o que foi orçado, e não uma surpresa no fechamento da DRE.",
    ],
    stat: {
      value: "40%",
      label: "de redução em erros de projeto com BIM integrado a IA",
    },
    end: [
      "A barreira que resta é cultural. Adotar a tecnologia exige reorganizar processos e treinar equipes acostumadas à planilha paralela — um esforço que, segundo especialistas ouvidos pela reportagem, se paga já na primeira obra conduzida no novo método.",
      'Para 2026, a expectativa do setor é de que ferramentas com IA deixem de ser diferencial competitivo e passem a ser linha de base. "Em poucos anos, perguntar se a construtora usa IA vai soar como perguntar se ela usa e-mail", resume um dos consultores.',
    ],
  },
  {
    id: "empregos",
    cat: "Mercado & Economia",
    title: "Construção civil lidera a geração de novos empregos formais no ano",
    dek: "Impulsionado por novos lançamentos e obras de infraestrutura, o setor se consolida como motor do crescimento econômico e puxa a fila das contratações com carteira assinada.",
    author: "Rafael Nogueira",
    role: "Repórter de Economia",
    date: "28 de junho de 2026",
    read: "5 min",
    lead: "A construção civil voltou ao centro do debate econômico pelo motivo mais concreto possível: emprego. Os dados mais recentes colocam o setor à frente na criação de vagas formais no acumulado do ano, à frente de serviços e indústria de transformação.",
    quote: "Cada obra que sai do papel movimenta uma cadeia inteira — do cimento ao financiamento. É emprego que se multiplica.",
    quoteBy: "Análise setorial",
    subhead: "Infraestrutura puxa a retomada",
    body: [
      "O avanço é puxado por dois vetores: o ciclo de novos lançamentos imobiliários, sustentado pela demanda habitacional, e os grandes contratos de infraestrutura — saneamento, rodovias e energia — que voltaram à agenda de investimento.",
      "Economistas alertam, porém, que a sustentação desse ritmo depende de previsibilidade. Custo de insumos, taxa de juros e capacidade de gestão das construtoras seguem como os principais gargalos de quem quer crescer sem perder margem.",
    ],
    stat: {
      value: "+200 mil",
      label: "vagas formais abertas pelo setor no acumulado do ano",
    },
    end: [
      "Na ponta, o desafio é qualificação. A escassez de mão de obra técnica — de mestres de obra a orçamentistas — pressiona salários e empurra o setor a investir em treinamento e tecnologia para fazer mais com equipes enxutas.",
      "Para as construtoras, o recado é direto: crescer exige método. Quem escala operação no improviso transforma a alta da demanda em caos de gestão.",
    ],
  },
  {
    id: "concreto-verde",
    cat: "Sustentabilidade",
    title: "Concreto verde: setor adota materiais de baixa pegada de carbono",
    dek: "Construtoras brasileiras aceleram a transição sustentável com concreto ecológico e processos que reduzem o desperdício no canteiro — e descobrem que sustentabilidade virou argumento de venda.",
    author: "Beatriz Lemos",
    role: "Repórter de Sustentabilidade",
    date: "27 de junho de 2026",
    read: "4 min",
    lead: "O concreto é responsável por uma fatia relevante das emissões globais de carbono. É por isso que a chegada de cimentos de baixo clínquer e de aditivos que reduzem a pegada do material está sendo tratada menos como tendência e mais como inevitabilidade no setor.",
    quote: "Obra sustentável deixou de ser custo extra. Bem planejada, ela reduz desperdício e melhora o resultado.",
    quoteBy: "Especialista em construção sustentável",
    subhead: "Menos desperdício, mais margem",
    body: [
      "A transição não acontece só na composição do material. Ela passa por planejamento: orçar com precisão, comprar a quantidade certa e evitar o desperdício que historicamente transforma sobra de obra em prejuízo silencioso.",
      "Construtoras que já operam com controle integrado de insumos relatam que a agenda ambiental e a agenda financeira caminham juntas — cada quilo de material que não vira entulho é margem que fica na obra.",
    ],
    stat: {
      value: "30%",
      label: "de redução de emissões com cimentos de baixo clínquer",
    },
    end: [
      "A certificação ambiental, antes restrita a grandes empreendimentos, começa a descer para o médio porte, puxada por clientes e financiadores que pedem rastreabilidade.",
      "O movimento ainda esbarra em custo inicial e disponibilidade regional de materiais, mas a direção, dizem os especialistas, é sem volta.",
    ],
  },
  {
    id: "cronograma",
    cat: "Gestão & Obras",
    title: "Obra que depende do dono para existir: o gargalo invisível das construtoras",
    dek: "Pesquisa com gestores aponta que a falta de processo, e não a falta de demanda, é o que trava o crescimento das pequenas e médias construtoras brasileiras.",
    author: "Carla Menezes",
    role: "Editora de Gestão",
    date: "26 de junho de 2026",
    read: "5 min",
    lead: 'A pergunta que mais aparece em diagnósticos de gestão não é sobre dinheiro nem sobre mercado. É mais simples e mais incômoda: o que acontece com a obra quando o dono não está? Para a maioria das construtoras, a resposta é "ela trava".',
    quote: "Empresa que para quando o dono viaja não é empresa. É um cargo com CNPJ.",
    quoteBy: "Consultoria de gestão de obras",
    subhead: "Do improviso ao método",
    body: [
      "O sintoma é conhecido: decisões concentradas, equipe sem direção clara, fornecedor atrasado e custo que só aparece no fechamento. Tudo vira urgência ao mesmo tempo, e o dono passa o dia apagando incêndio em vez de pensar estratégia.",
      "A saída apontada por especialistas não é contratar mais gente, e sim instalar processo: aprovações dentro de um sistema, indicadores em tempo real e fluxos que não dependem da memória de uma pessoa.",
    ],
    stat: {
      value: "7 em 10",
      label: "construtoras travam operações sem o dono presente",
    },
    end: [
      'Quando o processo entra, o papel do dono muda. Ele sai de "apagador de incêndio" e vira peça-chave: quem decide o rumo, não quem corre atrás do problema.',
      "O resultado, dizem os gestores que fizeram a transição, é uma operação que escala sem multiplicar o caos — e um dono que, finalmente, consegue tirar férias.",
    ],
  },
  {
    id: "precos-insumos",
    cat: "Mercado & Economia",
    title: "Preço dos insumos dá trégua, mas planejamento segue como diferencial",
    dek: "Aço e cimento estabilizam após dois anos de volatilidade; especialistas dizem que vantagem fica com quem orça e compra com precisão.",
    author: "Rafael Nogueira",
    role: "Repórter de Economia",
    date: "25 de junho de 2026",
    read: "4 min",
    lead: "Depois de dois anos de montanha-russa, os preços dos principais insumos da construção dão sinais de estabilização. Mas quem espera que o alívio se traduza automaticamente em margem maior pode se decepcionar.",
    quote: "Preço estável ajuda. Mas quem ganha de verdade é quem compra certo, na hora certa.",
    quoteBy: "Analista de suprimentos",
    subhead: "Comprar bem virou competência",
    body: [
      "A estabilização reduz o risco de orçamentos que estouram no meio da obra, mas não elimina o problema central: comprar sem planejamento, em quantidade errada e fora de hora, continua corroendo o resultado.",
      "A diferença, dizem os analistas, está em integrar orçamento e suprimentos. Quando o que foi orçado vira pedido de compra automaticamente, a obra para de comprar no susto.",
    ],
    stat: {
      value: "0%",
      label: "de variação no aço no último trimestre",
    },
    end: [
      "Para 2026, a recomendação é cautela: estabilidade de preço não é garantia de previsibilidade de obra. O canteiro continua sendo vencido no detalhe da gestão.",
      "Construtoras que tratam compra como processo, e não como emergência, são as que devem capturar a maior parte desse alívio de custo.",
    ],
  },
  {
    id: "mulheres-obra",
    cat: "Carreira",
    title: "Mulheres engenheiras assumem a liderança técnica nos canteiros",
    dek: "Participação feminina em cargos de gestão de obra cresce e redesenha a cultura do setor, historicamente masculino.",
    author: "Beatriz Lemos",
    role: "Repórter de Carreira",
    date: "24 de junho de 2026",
    read: "4 min",
    lead: "O canteiro de obras, símbolo de um setor historicamente masculino, vive uma transformação silenciosa: cada vez mais mulheres ocupam cargos de liderança técnica — de engenheiras responsáveis a gerentes de obra.",
    quote: "Competência não tem gênero. O que muda é a cultura que finalmente abre espaço.",
    quoteBy: "Engenheira e gestora de obras",
    subhead: "Uma nova geração no comando",
    body: [
      "O avanço é puxado por uma geração que chegou às escolas de engenharia em número recorde e agora ocupa posições de decisão. Com ela, mudam também as práticas de gestão e comunicação no canteiro.",
      "Especialistas apontam que equipes mais diversas tendem a tomar decisões mais equilibradas — um ativo num setor que depende cada vez mais de gestão de pessoas, e não só de técnica.",
    ],
    stat: {
      value: "2x",
      label: "crescimento de mulheres em cargos de gestão de obra em 5 anos",
    },
    end: [
      "O desafio que permanece é de permanência: garantir que a entrada se converta em carreira, com igualdade de oportunidade e de remuneração.",
      "Para as construtoras, ampliar a base de talento é também resposta à escassez de mão de obra qualificada que pressiona o setor.",
    ],
  },
  {
    id: "drone",
    cat: "Tecnologia & BIM",
    title: "Drones e sensores transformam a fiscalização de obras em tempo real",
    dek: "Captura aérea periódica e sensores de canteiro alimentam o modelo digital da obra e permitem comparar o planejado com o executado dia a dia.",
    author: "Marina Tavares",
    role: "Editora de Tecnologia",
    date: "23 de junho de 2026",
    read: "5 min",
    lead: "A fiscalização de obra, antes feita com prancheta e visita presencial, ganhou olhos no céu. Voos periódicos de drone capturam o avanço físico do canteiro e o cruzam, automaticamente, com o cronograma planejado.",
    quote: "Não dá mais para descobrir o atraso no fim do mês. O dado chega antes do prejuízo.",
    quoteBy: "Especialista em tecnologia de obras",
    subhead: "O canteiro vira dado",
    body: [
      "A combinação de imagens aéreas e sensores instalados no canteiro transforma a obra em uma fonte contínua de dados. Atraso, desvio de execução e ociosidade de equipe passam a ser detectados quase em tempo real.",
      "O ganho não está só em fiscalizar, mas em decidir. Com o avanço real visível, o gestor antecipa problemas em vez de reagir a eles.",
    ],
    stat: {
      value: "Diário",
      label: "comparativo entre obra planejada e executada",
    },
    end: [
      "A tecnologia, antes restrita a grandes construtoras, fica mais acessível com serviços sob demanda que dispensam a compra de equipamento.",
      "O próximo passo, segundo o setor, é fechar o ciclo: ligar o que o drone vê ao orçamento e ao financeiro, para que o desvio físico vire imediatamente desvio de custo conhecido.",
    ],
  },
  {
    id: "financiamento",
    cat: "Mercado & Economia",
    title: "Crédito imobiliário se reorganiza e abre janela para novos lançamentos",
    dek: "Novas linhas e a entrada de capital privado mudam o financiamento da construção e ampliam o fôlego das incorporadoras de médio porte.",
    author: "Rafael Nogueira",
    role: "Repórter de Economia",
    date: "22 de junho de 2026",
    read: "4 min",
    lead: "O financiamento da construção passa por uma reorganização que mistura linhas tradicionais, capital privado e instrumentos de mercado. Para a incorporadora de médio porte, isso significa mais caminhos — e mais exigência de gestão.",
    quote: "Capital existe. O que o investidor cobra é previsibilidade, e isso se constrói com método.",
    quoteBy: "Especialista em crédito imobiliário",
    subhead: "Quem se organiza, capta",
    body: [
      "A diversificação das fontes de recurso é boa notícia para quem tem projeto, mas eleva a régua de governança. Acesso a capital privado costuma vir acompanhado de exigência de transparência financeira e indicadores claros.",
      "Construtoras com controle financeiro estruturado — DRE gerencial, fluxo de caixa por obra e conciliação em dia — chegam à mesa de negociação em posição muito mais forte.",
    ],
    stat: {
      value: "R$",
      label: "capital privado amplia funding para incorporação",
    },
    end: [
      "Para 2026, a expectativa é de seletividade: dinheiro disponível, mas direcionado a quem demonstra capacidade de execução e de gestão.",
      "A lição para o setor é que captar deixou de ser só relacionamento bancário. Virou prova de que a operação roda com clareza.",
    ],
  },
  {
    id: "seguranca",
    cat: "Gestão & Obras",
    title: "Segurança do trabalho ganha tecnologia e deixa de ser só papelada",
    dek: "Wearables, treinamento em realidade virtual e checklists digitais reduzem acidentes e mudam a cultura de prevenção no canteiro.",
    author: "Carla Menezes",
    role: "Editora de Gestão",
    date: "21 de junho de 2026",
    read: "4 min",
    lead: "A segurança do trabalho na construção, por muito tempo reduzida a formulários e fiscalização pontual, começa a ganhar inteligência. Dispositivos vestíveis e checklists digitais transformam prevenção em rotina mensurável.",
    quote: "Acidente não é fatalidade. É falha de processo que dá para medir e corrigir.",
    quoteBy: "Técnico em segurança do trabalho",
    subhead: "Prevenção que vira dado",
    body: [
      "Sensores que detectam quedas, treinamento imersivo em realidade virtual e registros digitais de inspeção criam um histórico que permite identificar onde e por que os incidentes acontecem.",
      "Mais do que cumprir norma, as construtoras descobrem que segurança bem gerida reduz paralisação, retrabalho e custo — e protege o ativo mais valioso da obra, que são as pessoas.",
    ],
    stat: {
      value: "−35%",
      label: "de afastamentos com gestão digital de segurança",
    },
    end: [
      "A adoção ainda é desigual e esbarra em custo e em cultura, sobretudo nas obras menores.",
      "O caminho, dizem os especialistas, é integrar segurança à gestão diária da obra, e não tratá-la como um departamento à parte que só aparece na fiscalização.",
    ],
  },
];

const RADAR_CONTENT_DIR = path.join(
  process.cwd(),
  "content",
  "radar",
  "noticias",
);

function cleanFrontmatterValue(value = "") {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseMarkdownArticle(source: string, filename: string): RadarArticle | null {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) return null;

  const [, frontmatter, markdownBody] = match;
  const fields = new Map<string, string>();

  for (const line of frontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    fields.set(key, cleanFrontmatterValue(value));
  }

  const id =
    fields.get("id") ??
    fields.get("slug") ??
    filename.replace(/\.mdx?$/i, "");

  if (fields.get("published") === "false") return null;

  const body = markdownBody
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return {
    id,
    cat: fields.get("cat") ?? fields.get("category") ?? "Radar",
    title: fields.get("title") ?? id,
    dek: fields.get("dek") ?? fields.get("description") ?? "",
    author: fields.get("author") ?? "Redação Orceu",
    role: fields.get("role") ?? "Radar Orceu",
    date: fields.get("date") ?? "30 de junho de 2026",
    read: fields.get("read") ?? "4 min",
    lead: fields.get("lead") ?? body[0] ?? "",
    quote: fields.get("quote") ?? "",
    quoteBy: fields.get("quoteBy") ?? fields.get("quote_by") ?? "",
    subhead: fields.get("subhead") ?? "",
    body,
    stat: {
      value: fields.get("statValue") ?? fields.get("stat_value") ?? "",
      label: fields.get("statLabel") ?? fields.get("stat_label") ?? "",
    },
    end: (fields.get("end") ?? "")
      .split("|")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    image: fields.get("image"),
    published: true,
  };
}

function getContentRadarArticles() {
  if (!existsSync(RADAR_CONTENT_DIR)) return [];

  return readdirSync(RADAR_CONTENT_DIR)
    .filter((file) => /\.mdx?$/i.test(file))
    .map((file) => {
      const filePath = path.join(RADAR_CONTENT_DIR, file);
      return parseMarkdownArticle(readFileSync(filePath, "utf8"), file);
    })
    .filter((article): article is RadarArticle => Boolean(article));
}

function mergeRadarArticles(
  baseArticles: RadarArticle[],
  contentArticles: RadarArticle[],
) {
  const byId = new Map<string, RadarArticle>();

  for (const article of baseArticles) byId.set(article.id, article);
  for (const article of contentArticles) byId.set(article.id, article);

  return Array.from(byId.values());
}

const mergedRadarArticles: RadarArticle[] = mergeRadarArticles(
  fallbackRadarArticles,
  getContentRadarArticles(),
);

export function getRadarArticle(slug: string) {
  return radarArticles.find((article) => article.id === slug);
}

const PT_BR_MONTHS: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  marco: "03",
  março: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "inovacao-ia":
    "Notícias sobre inovação, inteligência artificial e ganhos de produtividade na construção civil.",
  "mercado-economia":
    "Cobertura de mercado, crédito, emprego, custo de insumos e economia da construção civil.",
  sustentabilidade:
    "Tendências e práticas de sustentabilidade aplicadas ao canteiro, materiais e operação.",
  "gestao-obras":
    "Conteúdo sobre gestão de obras, processos, cronograma, operação e previsibilidade de resultado.",
  "tecnologia-bim":
    "Avanços em tecnologia, BIM, drones, sensores e transformação digital da construção.",
  carreira:
    "Matérias sobre liderança, formação e carreira no ecossistema da construção civil.",
};

export function slugifyRadarCategory(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "e")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function getRadarArticleIsoDate(dateLabel: string) {
  const match = dateLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/(\d{1,2}) de ([a-z]+) de (\d{4})/);

  if (!match) return new Date().toISOString();

  const [, day, monthLabel, year] = match;
  const month = PT_BR_MONTHS[monthLabel];

  if (!month) return new Date().toISOString();

  return `${year}-${month}-${day.padStart(2, "0")}T08:00:00-03:00`;
}

export const radarArticles: RadarArticle[] = mergedRadarArticles.sort(
  (left, right) =>
    new Date(getRadarArticleIsoDate(right.date)).getTime() -
    new Date(getRadarArticleIsoDate(left.date)).getTime(),
);

export function getRadarCategories(): RadarCategory[] {
  const grouped = new Map<string, RadarArticle[]>();

  for (const article of radarArticles) {
    const slug = slugifyRadarCategory(article.cat);
    const current = grouped.get(slug) ?? [];
    current.push(article);
    grouped.set(slug, current);
  }

  return Array.from(grouped.entries()).map(([slug, articles]) => ({
    slug,
    name: articles[0]?.cat ?? slug,
    description:
      CATEGORY_DESCRIPTIONS[slug] ??
      "Cobertura editorial do Radar Orceu sobre construção civil.",
    articles: articles.sort(
      (left, right) =>
        new Date(getRadarArticleIsoDate(right.date)).getTime() -
        new Date(getRadarArticleIsoDate(left.date)).getTime(),
    ),
  }));
}

export function getRadarCategory(slug: string) {
  return getRadarCategories().find((category) => category.slug === slug);
}
