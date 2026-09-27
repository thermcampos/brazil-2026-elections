import { chavesVoto } from "../storage";
import type { BaseDados, EstadoUsuario } from "../types";

export interface AcoesColinha {
  aoLimpar: () => void;
}

interface Slot {
  rotulo: string;
  digitos: number;
  escolhido: string | null;
}

export function renderColinha(dados: BaseDados, estado: EstadoUsuario, acoes: AcoesColinha): HTMLElement {
  const secao = document.createElement("section");
  secao.className = "colinha";
  secao.id = "colinha";

  const slots: Slot[] = [];
  for (const cargo of dados.cargos) {
    const chaves = chavesVoto(cargo.id);
    chaves.forEach((chave, i) => {
      const sq = estado.votos[chave];
      const candidato = sq ? cargo.candidatos.find((c) => c.sq === sq) : undefined;
      slots.push({
        rotulo: chaves.length > 1 ? `${cargo.nome} (${i + 1}º voto)` : cargo.nome,
        digitos: cargo.digitos,
        escolhido: candidato
          ? `${candidato.numero} — ${candidato.nomeUrna} (${candidato.partido.sigla})`
          : null,
      });
    });
  }

  const definidos = slots.filter((s) => s.escolhido !== null).length;

  const titulo = document.createElement("h2");
  titulo.textContent = "Minha colinha";
  const progresso = document.createElement("span");
  progresso.className = "colinha__progresso";
  progresso.textContent = `${definidos} de ${slots.length} votos definidos`;
  secao.append(titulo, progresso);

  const dica = document.createElement("p");
  dica.className = "colinha__dica";
  dica.textContent = "Na ordem da urna: deputado federal, deputado estadual, senador (2 vagas), governador e presidente.";
  secao.appendChild(dica);

  const lista = document.createElement("dl");
  lista.className = "colinha__lista";
  for (const slot of slots) {
    const dt = document.createElement("dt");
    dt.textContent = `${slot.rotulo} · ${slot.digitos} dígitos`;
    const dd = document.createElement("dd");
    if (slot.escolhido) {
      dd.textContent = slot.escolhido;
    } else {
      dd.textContent = "Ainda não escolhido";
      dd.className = "colinha__pendente";
    }
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
