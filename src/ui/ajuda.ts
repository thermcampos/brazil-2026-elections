import type { CargoId } from "../types";

interface AjudaCargo {
  titulo: string;
  paragrafos: string[];
  fonteRotulo: string;
  fonteUrl: string;
}

const AJUDA: Record<CargoId, AjudaCargo> = {
  presidente: {
    titulo: "Presidente da República",
    paragrafos: [
      "O Presidente da República é, ao mesmo tempo, chefe de Estado e chefe de Governo: representa o Brasil nas relações internacionais e dirige a administração pública federal.",
      "É eleito pelo voto direto para um mandato de quatro anos, com direito a uma reeleição. Entre suas atribuições (art. 84 da Constituição) estão nomear os ministros de Estado, sancionar ou vetar leis, editar medidas provisórias, celebrar tratados internacionais e comandar as Forças Armadas.",
    ],
    fonteRotulo: "TSE: confira quais cargos estarão em disputa nas Eleições 2026",
    fonteUrl: "https://www.tse.jus.br/comunicacao/noticias/2026/Janeiro/confira-quais-cargos-estarao-em-disputa-nas-eleicoes-2026",
  },
  governador: {
    titulo: "Governador",
    paragrafos: [
      "O governador é o chefe do Poder Executivo estadual, eleito pelo voto direto para um mandato de quatro anos, com direito a uma reeleição.",
      "Cabe a ele administrar o estado, definir e executar políticas públicas (saúde, educação, segurança pública, infraestrutura), elaborar o orçamento estadual e participar do processo legislativo, auxiliado pelos secretários de Estado. Também representa o estado nas relações jurídicas, políticas e administrativas.",
    ],
    fonteRotulo: "TSE: atribuições dos cargos em disputa nas eleições",
    fonteUrl: "https://www.tse.jus.br/comunicacao/noticias/2022/Maio/confira-as-atribuicoes-dos-cargos-em-disputa-nas-eleicoes-2022",
  },
  senador: {
    titulo: "Senador",
    paragrafos: [
      "O senador representa o seu estado no Senado Federal, a Câmara alta do Congresso Nacional. Cada estado tem três senadores, independentemente da população, e o mandato é de oito anos.",
      "Suas funções incluem legislar (discutir e votar leis e emendas à Constituição), fiscalizar o Poder Executivo e exercer competências privativas do Senado, como julgar o presidente da República em crime de responsabilidade e aprovar nomes indicados para o STF, o TCU, a Procuradoria-Geral da República e a presidência do Banco Central.",
    ],
    fonteRotulo: "Agência Senado: você sabe o que faz um senador?",
    fonteUrl: "https://www12.senado.leg.br/noticias/materias/2022/08/05/voce-sabe-o-faz-um-senador-entenda-aqui",
  },
  "deputado-federal": {
    titulo: "Deputado Federal",
    paragrafos: [
      "O deputado federal representa a população na Câmara dos Deputados, que tem 513 cadeiras distribuídas entre os estados conforme o tamanho de cada um. O mandato é de quatro anos, e a eleição é proporcional.",
      "Suas atribuições principais são legislar (apresentar e votar projetos de lei e emendas à Constituição), fiscalizar o Poder Executivo (inclusive por meio de CPIs) e acompanhar o Orçamento da União, destinando recursos a estados e municípios por emendas parlamentares.",
    ],
    fonteRotulo: "Câmara dos Deputados: o que faz um deputado federal",
    fonteUrl: "https://especial.camara.leg.br/eleicoes-2026/eleicoes-2026-o-que-faz-um-deputado-federal/",
  },
  "deputado-estadual": {
    titulo: "Deputado Estadual",
    paragrafos: [
      "O deputado estadual atua na Assembleia Legislativa do estado. Em Santa Catarina, a Alesc é composta por 40 deputados, eleitos pelo sistema proporcional para mandatos de quatro anos.",
      "Suas atribuições centrais são legislar sobre assuntos de competência estadual (projetos de lei, emendas à Constituição Estadual e indicações ao Executivo) e fiscalizar as ações do governo do estado, além de participar da definição do orçamento estadual e de comissões, audiências públicas e CPIs.",
    ],
    fonteRotulo: "Agência Alesc: o que faz um deputado estadual",
    fonteUrl: "https://www.alesc.sc.gov.br/agencia/noticia/o-que-faz-deputado-estadual/",
  },
};

export function abrirAjuda(cargoId: CargoId): void {
  const info = AJUDA[cargoId];
  if (!info) return;

  const fundo = document.createElement("div");
  fundo.className = "modal";
  fundo.setAttribute("role", "dialog");
  fundo.setAttribute("aria-modal", "true");
  fundo.setAttribute("aria-label", `O que é e o que faz: ${info.titulo}`);

  const caixa = document.createElement("div");
  caixa.className = "modal__caixa";

  const cabecalho = document.createElement("div");
  cabecalho.className = "modal__cabecalho";
  const titulo = document.createElement("h3");
  titulo.textContent = info.titulo;
  const fechar = document.createElement("button");
  fechar.type = "button";
  fechar.className = "modal__fechar";
  fechar.textContent = "×";
  fechar.setAttribute("aria-label", "Fechar");
  cabecalho.append(titulo, fechar);

  const corpo = document.createElement("div");
  corpo.className = "modal__corpo";
  for (const texto of info.paragrafos) {
    const p = document.createElement("p");
    p.textContent = texto;
    corpo.appendChild(p);
  }

  const rodape = document.createElement("p");
  rodape.className = "modal__fonte";
  rodape.append("Fonte: ");
  const link = document.createElement("a");
  link.href = info.fonteUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = info.fonteRotulo;
  rodape.appendChild(link);
  corpo.appendChild(rodape);

  caixa.append(cabecalho, corpo);
  fundo.appendChild(caixa);

  function fecharModal(): void {
    document.removeEventListener("keydown", aoTeclar);
    fundo.remove();
  }

  function aoTeclar(evento: KeyboardEvent): void {
    if (evento.key === "Escape") fecharModal();
  }

  fechar.addEventListener("click", fecharModal);
  fundo.addEventListener("click", (evento) => {
    if (evento.target === fundo) fecharModal();
  });
  document.addEventListener("keydown", aoTeclar);

  document.body.appendChild(fundo);
  fechar.focus();
}
