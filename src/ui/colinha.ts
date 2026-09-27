import type { BaseDados, EstadoUsuario } from "../types";

export interface AcoesColinha {
  aoLimpar: () => void;
}

export function renderColinha(dados: BaseDados, estado: EstadoUsuario, acoes: AcoesColinha): HTMLElement {
  const secao = document.createElement("section");
  secao.className = "colinha";
  secao.id = "colinha";

  const titulo = document.createElement("h2");
  titulo.textContent = "Minha colinha";
  secao.appendChild(titulo);

  const votos = dados.cargos
    .map((cargo) => {
      const sq = estado.votos[cargo.id];
      const candidato = sq ? cargo.candidatos.find((c) => c.sq === sq) : undefined;
      return { cargo, candidato };
    })
    .filter((v) => v.candidato);

  if (votos.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "colinha__vazio";
    vazio.textContent = "Você ainda não escolheu nenhum candidato. Toque em \"Meu voto\" nos cards acima.";
    secao.appendChild(vazio);
    return secao;
  }

  const lista = document.createElement("dl");
  lista.className = "colinha__lista";
  for (const { cargo, candidato } of votos) {
    const dt = document.createElement("dt");
    dt.textContent = cargo.nome;
    const dd = document.createElement("dd");
    dd.textContent = `${candidato!.numero} — ${candidato!.nomeUrna} (${candidato!.partido.sigla})`;
    lista.append(dt, dd);
  }
  secao.appendChild(lista);

  const botaoLimpar = document.createElement("button");
  botaoLimpar.type = "button";
  botaoLimpar.className = "botao botao--limpar";
  botaoLimpar.textContent = "Limpar escolhas";
  botaoLimpar.addEventListener("click", acoes.aoLimpar);
  secao.appendChild(botaoLimpar);

  return secao;
}
