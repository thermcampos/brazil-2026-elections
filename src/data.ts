import type { BaseDados, Candidato } from "./types";

export async function carregarDados(): Promise<BaseDados> {
  const resposta = await fetch("data/candidatos.json");
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar dados: ${resposta.status}`);
  }
  return (await resposta.json()) as BaseDados;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function filtrarCandidatos(candidatos: Candidato[], termo: string): Candidato[] {
  const busca = normalizar(termo);
  if (!busca) return candidatos;
  return candidatos.filter(
    (c) =>
      normalizar(c.nomeUrna).includes(busca) ||
      normalizar(c.nomeCompleto).includes(busca) ||
      String(c.numero).startsWith(busca) ||
      normalizar(c.partido.sigla).includes(busca),
  );
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
