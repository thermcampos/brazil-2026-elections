import { formatarMoeda } from "../data";
import type { Candidato, CargoId, EstadoUsuario } from "../types";

export interface AcoesCard {
  aoVotar: (cargo: CargoId, sq: string) => void;
  aoFavoritar: (sq: string) => void;
}

export function renderCard(candidato: Candidato, cargo: CargoId, estado: EstadoUsuario, acoes: AcoesCard): HTMLElement {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.sq = candidato.sq;

  const votado = estado.votos[cargo] === candidato.sq;
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
  botaoVoto.textContent = votado ? "✓ Meu voto" : "Meu voto";
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

  if (candidato.redes.length > 0) {
    const tituloRedes = document.createElement("h4");
    tituloRedes.textContent = "Redes sociais";
    const listaRedes = document.createElement("ul");
    listaRedes.className = "card__redes";
    for (const url of candidato.redes) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = url;
      link.textContent = url.replace(/^https?:\/\/(www\.)?/, "");
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      item.appendChild(link);
      listaRedes.appendChild(item);
    }
    detalhes.append(tituloRedes, listaRedes);
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
