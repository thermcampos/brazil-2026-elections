import type { CargoId, EstadoUsuario } from "./types";

const CHAVE = "eleicoes-2026-sc";

function estadoVazio(): EstadoUsuario {
  return { votos: {}, favoritos: [] };
}

export function carregarEstado(): EstadoUsuario {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return estadoVazio();
    const estado = JSON.parse(bruto) as EstadoUsuario;
    return {
      votos: estado.votos ?? {},
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
  if (estado.votos[cargo] === sq) {
    delete estado.votos[cargo];
  } else {
    estado.votos[cargo] = sq;
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
