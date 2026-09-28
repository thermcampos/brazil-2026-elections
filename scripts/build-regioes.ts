import { writeFileSync } from "node:fs";

const UF_ID = 42;
const BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

interface RegiaoIntermediaria {
  id: number;
  nome: string;
}

interface Municipio {
  id: number;
  nome: string;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’‘]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function buscar<T>(url: string): Promise<T> {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Falha ao buscar ${url}: ${resposta.status}`);
  return (await resposta.json()) as T;
}

console.log("Buscando regiões intermediárias de SC no IBGE...");
const regioes = await buscar<RegiaoIntermediaria[]>(`${BASE}/estados/${UF_ID}/regioes-intermediarias`);

const mapa: Record<string, { nome: string; regiao: string }> = {};
for (const regiao of regioes) {
  const municipios = await buscar<Municipio[]>(`${BASE}/regioes-intermediarias/${regiao.id}/municipios`);
  for (const municipio of municipios) {
    mapa[normalizar(municipio.nome)] = { nome: municipio.nome, regiao: regiao.nome };
  }
  console.log(`  ${regiao.nome}: ${municipios.length} municípios`);
}

writeFileSync("scripts/regioes-sc.json", JSON.stringify(mapa, null, 2) + "\n");
console.log(`scripts/regioes-sc.json gerado com ${Object.keys(mapa).length} municípios.`);
