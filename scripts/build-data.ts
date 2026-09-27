import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Bem, Candidato, Cargo, CargoId, BaseDados } from "../src/types";

const UF = "SC";
const ANO_ELEICAO = 2026;

const CARGOS: { id: CargoId; nome: string; digitos: number; codigo: number; fonte: "SC" | "BRASIL" }[] = [
  { id: "presidente", nome: "Presidente", digitos: 2, codigo: 1, fonte: "BRASIL" },
  { id: "governador", nome: "Governador", digitos: 2, codigo: 3, fonte: "SC" },
  { id: "senador", nome: "Senador", digitos: 3, codigo: 5, fonte: "SC" },
  { id: "deputado-federal", nome: "Deputado Federal", digitos: 4, codigo: 6, fonte: "SC" },
  { id: "deputado-estadual", nome: "Deputado Estadual", digitos: 5, codigo: 7, fonte: "SC" },
];

const SITUACOES_INVALIDAS = /CASSAD|INDEFERID|RENUNCI|FALECID|ANULAD|IMPUGNAD/i;

function unzipTexto(zip: string, entrada: string): string {
  const buf = execFileSync("unzip", ["-p", zip, entrada], { maxBuffer: 1 << 30 });
  return new TextDecoder("latin1").decode(buf);
}

function unzipPara(zip: string, destino: string): void {
  mkdirSync(destino, { recursive: true });
  execFileSync("unzip", ["-o", "-q", zip, "-d", destino]);
}

function parseCsv(texto: string): Record<string, string>[] {
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const cabecalho = splitLinha(linhas[0]);
  return linhas.slice(1).map((linha) => {
    const campos = splitLinha(linha);
    const registro: Record<string, string> = {};
    cabecalho.forEach((coluna, i) => {
      registro[coluna] = campos[i] ?? "";
    });
    return registro;
  });
}

function splitLinha(linha: string): string[] {
  const campos: string[] = [];
  const regex = /"([^"]*)"|([^;]+)|(?:;(?=;|$))/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(linha)) !== null) {
    campos.push(match[1] ?? match[2] ?? "");
  }
  return campos;
}

function parseValor(valor: string): number {
  const limpo = valor.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : 0;
}

function idade(dtNascimento: string): number | null {
  const match = dtNascimento.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const [, dia, mes, ano] = match;
  const nascimento = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const referencia = new Date(ANO_ELEICAO, 9, 4);
  let anos = referencia.getFullYear() - nascimento.getFullYear();
  const antesMes = referencia.getMonth() < nascimento.getMonth();
  const mesmoDia = referencia.getMonth() === nascimento.getMonth() && referencia.getDate() < nascimento.getDate();
  if (antesMes || mesmoDia) anos -= 1;
  return anos >= 0 && anos < 130 ? anos : null;
}

function limpo(valor: string): string | null {
  const v = valor.trim();
  if (!v || v === "#NULO" || v === "#NE" || v === "-1" || v === "-3" || v === "-4") return null;
  return v;
}

console.log("Lendo candidatos...");
const candSC = parseCsv(unzipTexto("consulta_cand_2026.zip", `consulta_cand_2026_${UF}.csv`));
const candBR = parseCsv(unzipTexto("consulta_cand_2026.zip", "consulta_cand_2026_BRASIL.csv"));

console.log("Lendo bens...");
const bens = [
  ...parseCsv(unzipTexto("bem_candidato_2026.zip", `bem_candidato_2026_${UF}.csv`)),
  ...parseCsv(unzipTexto("bem_candidato_2026.zip", "bem_candidato_2026_BRASIL.csv")),
];
const bensPorSq = new Map<string, Bem[]>();
for (const b of bens) {
  const sq = b["SQ_CANDIDATO"];
  const valor = parseValor(b["VR_BEM_CANDIDATO"] ?? "");
  if (!sq || valor === 0) continue;
  const lista = bensPorSq.get(sq) ?? [];
  lista.push({ tipo: b["DS_TIPO_BEM_CANDIDATO"] ?? "", descricao: b["DS_BEM_CANDIDATO"] ?? "", valor });
  bensPorSq.set(sq, lista);
}

console.log("Lendo redes sociais...");
const redes = [
  ...parseCsv(unzipTexto("rede_social_candidato_2026.zip", `rede_social_candidato_2026_${UF}.csv`)),
  ...parseCsv(unzipTexto("rede_social_candidato_2026.zip", "rede_social_candidato_2026_BRASIL.csv")),
];
const redesPorSq = new Map<string, string[]>();
for (const r of redes) {
  const sq = r["SQ_CANDIDATO"];
  const url = (r["DS_URL"] ?? "").trim().toLowerCase();
  if (!sq || !url) continue;
  const lista = redesPorSq.get(sq) ?? [];
  if (!lista.includes(url)) lista.push(url);
  redesPorSq.set(sq, lista);
}

console.log("Extraindo fotos e propostas...");
unzipPara(`foto_cand2026_${UF}_div.zip`, "public/fotos");
unzipPara(`proposta_governo_2026_${UF}.zip`, "public/propostas");

const fotosPorSq = new Map<string, string>();
for (const arquivo of readdirSync("public/fotos")) {
  const match = arquivo.match(/^F\w\w(\d+)_div\.jpg$/i);
  if (match) fotosPorSq.set(match[1], `fotos/${arquivo}`);
}
const propostasPorSq = new Map<string, string>();
for (const arquivo of readdirSync(join("public/propostas", UF))) {
  const match = arquivo.match(/^\d{4}\w\w(\d+)_\d+\.pdf$/i);
  if (match && !propostasPorSq.has(match[1])) {
    propostasPorSq.set(match[1], `propostas/${UF}/${arquivo}`);
  }
}

function montarCandidato(r: Record<string, string>): Candidato {
  const sq = r["SQ_CANDIDATO"];
  const listaBens = (bensPorSq.get(sq) ?? []).sort((a, b) => b.valor - a.valor);
  return {
    sq,
    numero: Number(r["NR_CANDIDATO"]),
    nomeUrna: r["NM_URNA_CANDIDATO"] ?? "",
    nomeCompleto: r["NM_CANDIDATO"] ?? "",
    partido: {
      numero: Number(r["NR_PARTIDO"]),
      sigla: r["SG_PARTIDO"] ?? "",
      nome: r["NM_PARTIDO"] ?? "",
    },
    coligacao: limpo(r["NM_COLIGACAO"] ?? ""),
    federacao: limpo(r["NM_FEDERACAO"] ?? ""),
    escolaridade: r["DS_GRAU_INSTRUCAO"] ?? "",
    ocupacao: limpo(r["DS_OCUPACAO"] ?? "") ?? "Não informada",
    idade: idade(r["DT_NASCIMENTO"] ?? ""),
    genero: r["DS_GENERO"] ?? "",
    corRaca: r["DS_COR_RACA"] ?? "",
    patrimonioTotal: listaBens.reduce((total, b) => total + b.valor, 0),
    bens: listaBens,
    redes: redesPorSq.get(sq) ?? [],
    foto: fotosPorSq.get(sq) ?? null,
    proposta: propostasPorSq.get(sq) ?? null,
  };
}

const fontes: Record<"SC" | "BRASIL", Record<string, string>[]> = { SC: candSC, BRASIL: candBR };

const cargos: Cargo[] = CARGOS.map((cargo) => {
  const candidatos = fontes[cargo.fonte]
    .filter((r) => Number(r["CD_CARGO"]) === cargo.codigo)
    .filter((r) => !SITUACOES_INVALIDAS.test(r["DS_SITUACAO_CANDIDATURA"] ?? ""))
    .map(montarCandidato)
    .sort((a, b) => a.nomeUrna.localeCompare(b.nomeUrna, "pt-BR"));
  console.log(`  ${cargo.nome}: ${candidatos.length} candidatos`);
  return { id: cargo.id, nome: cargo.nome, digitos: cargo.digitos, candidatos };
});

const base: BaseDados = {
  geradoEm: new Date().toISOString(),
  uf: UF,
  cargos,
};

mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/candidatos.json", JSON.stringify(base));
console.log("public/data/candidatos.json gerado.");
