import { formatarMoeda } from "../data";
import { rotuloVoto } from "../storage";
import type { Candidato, CargoId, EstadoUsuario } from "../types";

export interface AcoesCard {
  aoVotar: (cargo: CargoId, sq: string) => void;
  aoFavoritar: (sq: string) => void;
}

export function renderCard(candidato: Candidato, cargo: CargoId, estado: EstadoUsuario, acoes: AcoesCard): HTMLElement {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.sq = candidato.sq;

  const rotulo = rotuloVoto(cargo, estado, candidato.sq);
  const votado = rotulo !== null;
  const favorito = estado.favoritos.includes(candidato.sq);
  if (votado) card.classList.add("card--votado");

  const cabecalho = document.createElement("div");
  cabecalho.className = "card__cabecalho";

  if (candidato.foto) {
    const foto = document.createElement("img");
    foto.className = "card__foto";
    foto.src = candidato.foto;
    foto.alt = `Foto de ${candidato.nomeUrna}`;
    foto.loading = "lazy";
    cabecalho.appendChild(foto);
  }

  const identidade = document.createElement("div");
  identidade.className = "card__identidade";
  const nome = document.createElement("h3");
  nome.className = "card__nome";
  nome.textContent = candidato.nomeUrna;
  const numero = document.createElement("p");
  numero.className = "card__numero";
  numero.textContent = `${candidato.numero} · ${candidato.partido.sigla}`;
  identidade.append(nome, numero);
  cabecalho.appendChild(identidade);
  card.appendChild(cabecalho);

  const badge = renderBadgeSituacao(candidato);
  if (badge) card.appendChild(badge);

  const resumo = document.createElement("dl");
  resumo.className = "card__resumo";
  adicionarItem(resumo, "Escolaridade", candidato.escolaridade);
  adicionarItem(resumo, "Ocupação", candidato.ocupacao);
  adicionarItem(resumo, "Patrimônio declarado", formatarMoeda(candidato.patrimonioTotal));
  if (candidato.idade !== null) adicionarItem(resumo, "Idade", `${candidato.idade} anos`);
  if (candidato.mandato) adicionarItem(resumo, "Mandato atual", candidato.mandato);
  card.appendChild(resumo);

  if (candidato.nota) {
    const nota = document.createElement("p");
    nota.className = "card__nota";
    nota.textContent = candidato.nota;
    card.appendChild(nota);
  }

  const acoesEl = document.createElement("div");
  acoesEl.className = "card__acoes";

  const botaoVoto = document.createElement("button");
  botaoVoto.type = "button";
  botaoVoto.className = votado ? "botao botao--votado" : "botao botao--voto";
  botaoVoto.textContent = rotulo ?? "Meu voto";
  botaoVoto.addEventListener("click", () => acoes.aoVotar(cargo, candidato.sq));

  const botaoFav = document.createElement("button");
  botaoFav.type = "button";
  botaoFav.className = favorito ? "botao botao--favorito ativo" : "botao botao--favorito";
  botaoFav.textContent = favorito ? "★" : "☆";
  botaoFav.title = favorito ? "Remover dos favoritos" : "Adicionar aos favoritos";
  botaoFav.addEventListener("click", () => acoes.aoFavoritar(candidato.sq));

  const botaoDetalhes = document.createElement("button");
  botaoDetalhes.type = "button";
  botaoDetalhes.className = "botao botao--detalhes";
  botaoDetalhes.textContent = "Detalhes";
  botaoDetalhes.setAttribute("aria-expanded", "false");

  acoesEl.append(botaoVoto, botaoFav, botaoDetalhes);
  card.appendChild(acoesEl);

  if (candidato.redes.length > 0) {
    const redes = document.createElement("div");
    redes.className = "card__redes-icones";
    for (const url of candidato.redes) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const rede = identificarRede(url);
      link.title = rede.rotulo;
      link.setAttribute("aria-label", rede.rotulo);
      link.innerHTML = rede.svg;
      redes.appendChild(link);
    }
    card.appendChild(redes);
  }

  const detalhes = renderDetalhes(candidato);
  detalhes.hidden = true;
  botaoDetalhes.addEventListener("click", () => {
    detalhes.hidden = !detalhes.hidden;
    botaoDetalhes.setAttribute("aria-expanded", String(!detalhes.hidden));
    botaoDetalhes.textContent = detalhes.hidden ? "Detalhes" : "Ocultar";
  });
  card.appendChild(detalhes);

  return card;
}

const SVG = (conteudo: string): string =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="0">${conteudo}</svg>`;

const ICONES: Record<string, string> = {
  instagram: SVG(
    `<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.4" stroke="none"/>`,
  ),
  facebook: SVG(
    `<path stroke="none" d="M14 3h3.5v3.5H15c-.8 0-1 .5-1 1.3V10h4l-.6 3.5H14V21h-3.6v-7.5H7V10h3.4V7.6C10.4 4.9 12 3 14 3z"/>`,
  ),
  x: SVG(
    `<path stroke="none" d="M3 3h4.6l5 6.7L18.4 3H21l-7 8.3L21.4 21h-4.6l-5.4-7.2L5.6 21H3l7.3-8.7z"/>`,
  ),
  threads: SVG(
    `<circle cx="12" cy="12" r="9" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="none" stroke-width="2"/><path d="M15.2 12v3.5c0 1.4 1 2.5 2.4 2.5" fill="none" stroke-width="2"/>`,
  ),
  youtube: SVG(
    `<rect x="2" y="5.5" width="20" height="13" rx="4" stroke="none"/><path d="M10 9.2v5.6l5-2.8z" fill="#fff" stroke="none"/>`,
  ),
  tiktok: SVG(
    `<path stroke="none" d="M15 3c.4 2.8 2.4 4.8 5.2 5.2v3.1c-1.9 0-3.7-.6-5.2-1.7v5.9A5.5 5.5 0 1 1 9.5 10v3.2a2.4 2.4 0 1 0 2.4 2.4V3z"/>`,
  ),
  whatsapp: SVG(
    `<path stroke="none" d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M9 8.5c-.3 2.8 3.7 6.8 6.5 6.5l.8-1.8-2.2-1.2-.9.9c-.9-.4-1.9-1.4-2.3-2.3l.9-.9-1.2-2.2z" fill="#fff" stroke="none"/>`,
  ),
  site: SVG(
    `<circle cx="12" cy="12" r="9" fill="none" stroke-width="2"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke-width="2"/><path d="M3 12h18" fill="none" stroke-width="2"/>`,
  ),
};

function identificarRede(url: string): { rotulo: string; svg: string } {
  const host = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  let rede = "site";
  let rotulo = "Site";
  if (host.includes("instagram.com")) [rede, rotulo] = ["instagram", "Instagram"];
  else if (host.includes("facebook.com") || host.includes("fb.com")) [rede, rotulo] = ["facebook", "Facebook"];
  else if (host.includes("x.com") || host.includes("twitter.com")) [rede, rotulo] = ["x", "X (Twitter)"];
  else if (host.includes("threads.")) [rede, rotulo] = ["threads", "Threads"];
  else if (host.includes("youtube.com") || host.includes("youtu.be")) [rede, rotulo] = ["youtube", "YouTube"];
  else if (host.includes("tiktok.com")) [rede, rotulo] = ["tiktok", "TikTok"];
  else if (host.includes("whatsapp.com") || host.includes("wa.me")) [rede, rotulo] = ["whatsapp", "WhatsApp"];
  else rotulo = `Site (${host.split("/")[0]})`;
  return { rotulo, svg: ICONES[rede] };
}

interface BadgeSituacao {
  rotulo: string;
  variante: "ficha-limpa" | "indeferido" | "recurso" | "pendente";
}

function badgeSituacao(candidato: Candidato): BadgeSituacao | null {
  const situacao = candidato.situacao;
  if (!situacao) return null;
  const julgamento = situacao.julgamento.toUpperCase();
  const fichaLimpa = situacao.motivos.some((m) => /LC 64\/90/i.test(m));
  if (julgamento.includes("INDEFERIDO")) {
    const sobRecurso = julgamento.includes("RECURSAL");
    if (fichaLimpa) {
      return {
        rotulo: sobRecurso ? "Indeferido sob recurso (Lei da Ficha Limpa)" : "Inelegível (Lei da Ficha Limpa)",
        variante: "ficha-limpa",
      };
    }
    return {
      rotulo: sobRecurso ? "Registro indeferido, aguardando recurso" : "Registro indeferido",
      variante: sobRecurso ? "recurso" : "indeferido",
    };
  }
  if (julgamento.includes("PENDENTE")) return { rotulo: "Registro aguardando julgamento", variante: "pendente" };
  return null;
}

export function alertaRegistro(candidato: Candidato): string | null {
  return badgeSituacao(candidato)?.rotulo ?? null;
}

function renderBadgeSituacao(candidato: Candidato): HTMLElement | null {
  const badge = badgeSituacao(candidato);
  if (!badge) return null;
  const el = document.createElement("p");
  el.className = `card__situacao card__situacao--${badge.variante}`;
  el.textContent = badge.rotulo;
  return el;
}

function adicionarItem(lista: HTMLDListElement, termo: string, valor: string): void {
  const dt = document.createElement("dt");
  dt.textContent = termo;
  const dd = document.createElement("dd");
  dd.textContent = valor;
  lista.append(dt, dd);
}

function renderDetalhes(candidato: Candidato): HTMLElement {
  const detalhes = document.createElement("div");
  detalhes.className = "card__detalhes";

  const info = document.createElement("dl");
  info.className = "card__resumo";
  adicionarItem(info, "Nome completo", candidato.nomeCompleto);
  adicionarItem(info, "Partido", `${candidato.partido.sigla} - ${candidato.partido.nome}`);
  if (candidato.coligacao) adicionarItem(info, "Coligação", candidato.coligacao);
  if (candidato.federacao) adicionarItem(info, "Federação", candidato.federacao);
  adicionarItem(info, "Gênero", candidato.genero);
  adicionarItem(info, "Cor/Raça", candidato.corRaca);
  detalhes.appendChild(info);

  if (candidato.situacao) {
    const tituloSituacao = document.createElement("h4");
    tituloSituacao.textContent = "Situação do registro";
    const julgamento = candidato.situacao.julgamento;
    const textoSituacao = document.createElement("p");
    textoSituacao.className = "card__registro";
    textoSituacao.textContent = `Julgamento: ${julgamento.charAt(0)}${julgamento.slice(1).toLowerCase()}.`;
    detalhes.append(tituloSituacao, textoSituacao);
    if (candidato.situacao.motivos.length > 0) {
      const listaMotivos = document.createElement("ul");
      listaMotivos.className = "card__historico";
      for (const motivo of candidato.situacao.motivos) {
        const item = document.createElement("li");
        item.textContent = motivo;
        listaMotivos.appendChild(item);
      }
      detalhes.appendChild(listaMotivos);
    }
    if (candidato.situacao.processo) {
      const processo = document.createElement("p");
      processo.className = "card__registro";
      processo.textContent = `Processo: ${candidato.situacao.processo}`;
      detalhes.appendChild(processo);
    }
    const fonte = document.createElement("p");
    fonte.className = "card__fonte";
    fonte.textContent = "Fonte: TSE (DivulgaCand 2026). A situação pode mudar até o fim do prazo recursal.";
    detalhes.appendChild(fonte);
  }

  if (candidato.historico.length > 0) {
    const tituloHistorico = document.createElement("h4");
    tituloHistorico.textContent = "Trajetória eleitoral";
    const listaHistorico = document.createElement("ul");
    listaHistorico.className = "card__historico";
    for (const h of candidato.historico) {
      const item = document.createElement("li");
      const local = h.local ? ` · ${h.local}` : "";
      item.textContent = `${h.ano}: ${h.cargo}${local} (${h.partido}) — ${h.resultado}`;
      listaHistorico.appendChild(item);
    }
    detalhes.append(tituloHistorico, listaHistorico);
  }

  if (candidato.bens.length > 0) {
    const tituloBens = document.createElement("h4");
    tituloBens.textContent = `Bens declarados (${formatarMoeda(candidato.patrimonioTotal)})`;
    const listaBens = document.createElement("ul");
    listaBens.className = "card__bens";
    for (const bem of candidato.bens) {
      const item = document.createElement("li");
      item.textContent = `${bem.tipo}: ${bem.descricao} — ${formatarMoeda(bem.valor)}`;
      listaBens.appendChild(item);
    }
    detalhes.append(tituloBens, listaBens);
  } else {
    const semBens = document.createElement("p");
    semBens.className = "card__aviso";
    semBens.textContent = "Nenhum bem declarado.";
    detalhes.appendChild(semBens);
  }

  if (candidato.proposta) {
    const linkProposta = document.createElement("a");
    linkProposta.className = "botao botao--proposta";
    linkProposta.href = candidato.proposta;
    linkProposta.target = "_blank";
    linkProposta.rel = "noopener noreferrer";
    linkProposta.textContent = "Proposta de governo (PDF)";
    detalhes.appendChild(linkProposta);
  }

  return detalhes;
}
