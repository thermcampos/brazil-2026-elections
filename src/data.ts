import type { BaseDados, Candidato, Filtros } from "./types";

export async function carregarDados(): Promise<BaseDados> {
  const resposta = await fetch("data/candidatos.json");
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar dados: ${resposta.status}`);
  }
  const dados = (await resposta.json()) as BaseDados;
  const notas = await carregarNotas();
  for (const cargo of dados.cargos) {
    for (const candidato of cargo.candidatos) {
      candidato.nota = notas[candidato.sq] ?? null;
    }
  }
  return dados;
}

async function carregarNotas(): Promise<Record<string, string>> {
  try {
    const resposta = await fetch("data/notas.json");
    if (!resposta.ok) return {};
    return (await resposta.json()) as Record<string, string>;
  } catch {
    return {};
  }
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

const FAIXAS_PATRIMONIO: Record<string, [number, number]> = {
  zero: [0, 0],
  "ate-500-mil": [0, 500_000],
  "ate-1-milhao": [500_000, 1_000_000],
  "ate-2-milhoes": [1_000_000, 2_000_000],
  "ate-3-milhoes": [2_000_000, 3_000_000],
  "ate-5-milhoes": [3_000_000, 5_000_000],
  "acima-5-milhoes": [5_000_000, Infinity],
};

export function aplicarFiltros(candidatos: Candidato[], filtros: Filtros): Candidato[] {
  let resultado = candidatos;
  if (filtros.escolaridade) {
    resultado = resultado.filter((c) => c.escolaridade === filtros.escolaridade);
  }
  if (filtros.patrimonio) {
    const [min, max] = FAIXAS_PATRIMONIO[filtros.patrimonio];
    resultado =
      filtros.patrimonio === "zero"
        ? resultado.filter((c) => c.patrimonioTotal === 0)
        : resultado.filter((c) => c.patrimonioTotal > min && c.patrimonioTotal <= max);
  }
  return resultado;
}

export function escolaridadesDisponiveis(dados: BaseDados): string[] {
  const valores = new Set<string>();
  for (const cargo of dados.cargos) {
    for (const candidato of cargo.candidatos) {
      valores.add(candidato.escolaridade);
    }
  }
  return [...valores].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
