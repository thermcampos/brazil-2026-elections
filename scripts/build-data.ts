import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { Bem, Candidato, Cargo, CargoId, BaseDados, HistoricoEntry } from "../src/types";

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

console.log("Lendo histórico de candidaturas...");
const historico = [
  ...parseCsv(unzipTexto("historico_candidatura_2026.zip", `historico_candidatura_2026_${UF}.csv`)),
  ...parseCsv(unzipTexto("historico_candidatura_2026.zip", "historico_candidatura_2026_BRASIL.csv")),
];

interface RegistroHistorico {
  ano: number;
  cargo: string;
  local: string;
  partido: string;
  resultado: string;
  municipio: string | null;
}

const historicoPorSq = new Map<string, RegistroHistorico[]>();
for (const h of historico) {
  const sq = h["SQ_CANDIDATO_ATUAL"];
  const resultado = h["DS_SIT_TOT_TURNO"] ?? "";
  if (!sq || !resultado || resultado === "#NULO" || resultado === "#NE") continue;
  const municipal = h["TP_ABRANGENCIA_ELEICAO"] === "M";
  const lista = historicoPorSq.get(sq) ?? [];
  const chave = `${h["ANO_ELEICAO"]}|${h["DS_CARGO"]}|${municipal ? (h["NM_UE"] ?? "") : ""}|${resultado}`;
  if (lista.some((e) => `${e.ano}|${e.cargo}|${e.municipio ?? ""}|${e.resultado}` === chave)) continue;
  lista.push({
    ano: Number(h["ANO_ELEICAO"]),
    cargo: h["DS_CARGO"] ?? "",
    local: municipal ? limpo(h["NM_UE"] ?? "") ?? "" : h["SG_UF"] ?? "",
    partido: h["SG_PARTIDO"] ?? "",
    resultado,
    municipio: municipal ? limpo(h["NM_UE"] ?? "") : null,
  });
  historicoPorSq.set(sq, lista);
}
for (const [sq, lista] of historicoPorSq) {
  const finais = new Set(
    lista
      .filter((e) => e.resultado !== "2º turno")
      .map((e) => `${e.ano}|${e.cargo}|${e.local}`),
  );
  historicoPorSq.set(
    sq,
    lista
      .filter((e) => e.resultado !== "2º turno" || !finais.has(`${e.ano}|${e.cargo}|${e.local}`))
      .sort((a, b) => b.ano - a.ano),
  );
}

function eleito(resultado: string): boolean {
  return /ELEITO/i.test(resultado) && !/N[ÃA]O ELEITO/i.test(resultado.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
}

function mandatoAtual(registros: RegistroHistorico[]): string | null {
  for (const h of registros) {
    if (!eleito(h.resultado)) continue;
    const cargo = h.cargo.toUpperCase();
    if (h.ano === 2024 && /PREFEITO|VEREADOR/.test(cargo)) {
      return `${h.cargo} de ${h.local} (2025-2028)`;
    }
    if (h.ano === 2022 && /DEPUTADO/.test(cargo)) {
      return `${h.cargo} (${h.local}, 2023-2027)`;
    }
    if (h.ano === 2022 && /SENADOR/.test(cargo)) {
      return `${h.cargo} (${h.local}, 2023-2031)`;
    }
    if (h.ano === 2018 && /SENADOR/.test(cargo)) {
      return `${h.cargo} (${h.local}, 2019-2027)`;
    }
    if (h.ano === 2022 && /GOVERNADOR/.test(cargo) && !/VICE/.test(cargo)) {
      return `${h.cargo} (${h.local}, 2023-2026)`;
    }
    if (h.ano === 2022 && /PRESIDENTE/.test(cargo) && !/VICE/.test(cargo)) {
      return `${h.cargo} (2023-2026)`;
    }
  }
  return null;
}

console.log("Extraindo fotos e propostas...");
unzipPara(`foto_cand2026_${UF}_div.zip`, "public/fotos");
unzipPara(`proposta_governo_2026_${UF}.zip`, "public/propostas");
rmSync("public/fotos/leiame.pdf", { force: true });
rmSync(`public/propostas/${UF}/leiame.pdf`, { force: true });

const fotosPorSq = new Map<string, string>();
for (const arquivo of readdirSync("public/fotos")) {
  const match = arquivo.match(/^F\w\w(\d+)_div\.jpg$/i);
  if (match) fotosPorSq.set(match[1], `fotos/${arquivo}`);
}
const fotosPresidentes = new Map<string, string>();
if (existsSync("president-pics")) {
  for (const arquivo of readdirSync("president-pics")) {
    if (!arquivo.toLowerCase().endsWith(".jpg")) continue;
    mkdirSync("public/fotos/presidentes", { recursive: true });
    cpSync(join("president-pics", arquivo), join("public/fotos/presidentes", arquivo));
    fotosPresidentes.set(arquivo.replace(/\.jpg$/i, "").toLowerCase(), `fotos/presidentes/${arquivo}`);
  }
}

function fotoPresidente(nomeUrna: string): string | null {
  const base = nomeUrna.toLowerCase().trim().replace(/\s+/g, "-");
  const semAcento = base.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return fotosPresidentes.get(base) ?? fotosPresidentes.get(semAcento) ?? null;
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
  const registros = historicoPorSq.get(sq) ?? [];
  const historicoCandidato: HistoricoEntry[] = registros.map((h) => ({
    ano: h.ano,
    cargo: h.cargo,
    local: h.local,
    partido: h.partido,
    resultado: h.resultado,
  }));
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
    historico: historicoCandidato,
    mandato: mandatoAtual(registros),
    nota: null,
    foto: fotosPorSq.get(sq) ?? fotoPresidente(r["NM_URNA_CANDIDATO"] ?? ""),
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
