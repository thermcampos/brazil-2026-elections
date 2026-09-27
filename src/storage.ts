import type { CargoId, EstadoUsuario } from "./types";

const CHAVE = "eleicoes-2026-sc";

export function chavesVoto(cargo: CargoId): string[] {
  return cargo === "senador" ? ["senador-1", "senador-2"] : [cargo];
}

export function rotuloVoto(cargo: CargoId, estado: EstadoUsuario, sq: string): string | null {
  const chaves = chavesVoto(cargo);
  for (let i = 0; i < chaves.length; i++) {
    if (estado.votos[chaves[i]] === sq) {
      return chaves.length > 1 ? `✓ ${i + 1}º voto` : "✓ Meu voto";
    }
  }
  return null;
}

function estadoVazio(): EstadoUsuario {
  return { votos: {}, favoritos: [] };
}

export function carregarEstado(): EstadoUsuario {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return estadoVazio();
    const estado = JSON.parse(bruto) as EstadoUsuario;
    const votos = estado.votos ?? {};
    if (typeof votos["senador"] === "string" && !votos["senador-1"]) {
      votos["senador-1"] = votos["senador"];
      delete votos["senador"];
    }
    return {
      votos,
      favoritos: Array.isArray(estado.favoritos) ? estado.favoritos : [],
    };
  } catch {
    return estadoVazio();
  }
}

function salvar(estado: EstadoUsuario): void {
  localStorage.setItem(CHAVE, JSON.stringify(estado));
}

export function definirVoto(cargo: CargoId, sq: string): EstadoUsuario {
  const estado = carregarEstado();
  const chaves = chavesVoto(cargo);
  const atual = chaves.find((chave) => estado.votos[chave] === sq);
  if (atual) {
    delete estado.votos[atual];
  } else {
    const livre = chaves.find((chave) => !estado.votos[chave]);
    estado.votos[livre ?? chaves[chaves.length - 1]] = sq;
  }
  salvar(estado);
  return estado;
}

export function alternarFavorito(sq: string): EstadoUsuario {
  const estado = carregarEstado();
  const indice = estado.favoritos.indexOf(sq);
  if (indice >= 0) {
    estado.favoritos.splice(indice, 1);
  } else {
    estado.favoritos.push(sq);
  }
  salvar(estado);
  return estado;
}

export function limparEscolhas(): EstadoUsuario {
  const estado = estadoVazio();
  salvar(estado);
  return estado;
}
