import { writeFileSync } from 'node:fs';

const DATASET_URL =
  'https://dataverse.harvard.edu/api/datasets/:persistentId/?persistentId=doi:10.7910/DVN/6KVTUV';
const ESTIMATES_FILENAME = 'bls9_estimates_partiespresidents_long.tab';

type Posicao = 'esquerda' | 'centro-esquerda' | 'centro' | 'centro-direita' | 'direita';

interface EspectroEntry {
  bls: number | null;
  blsAno: number | null;
  posicao: Posicao | null;
  nota?: string;
}

function bucket(v: number): Posicao {
  if (v <= -0.5) return 'esquerda';
  if (v < -0.15) return 'centro-esquerda';
  if (v <= 0.15) return 'centro';
  if (v < 0.5) return 'centro-direita';
  return 'direita';
}

const ALIAS: Record<string, string> = {
  CIDADANIA: 'CID',
  SOLIDARIEDADE: 'SD',
  REPUBLICANOS: 'REP',
  PRD: 'PTB',
  AGIR: 'PRN',
};

const NOTAS: Record<string, string> = {
  PRD: 'sem medicao propria; usa PTB 2021 (PRD nasceu da fusao PTB + Patriota em 2023; o Patriota nao foi avaliado)',
  AGIR: 'linhagem PJ -> PRN -> PTC -> AGIR; ultima medicao BLS do PRN em 1993',
  PSTU: 'ultima medicao BLS de 1993',
  PV: 'ultima medicao BLS de 2017',
  REDE: 'ultima medicao BLS de 2017',
};

const SEM_DADOS = 'sem dados no BLS9 (partido novo, sem bancada federal ou nunca avaliado)';

interface Estimate {
  ano: number;
  bls: number;
}

async function main() {
  const datasetRes = await fetch(DATASET_URL);
  if (!datasetRes.ok) throw new Error(`Dataverse API: HTTP ${datasetRes.status}`);
  const dataset = await datasetRes.json();
  const files = dataset.data.latestVersion.files as { dataFile: { id: number; filename: string } }[];
  const file = files.find((f) => f.dataFile.filename === ESTIMATES_FILENAME);
  if (!file) throw new Error(`${ESTIMATES_FILENAME} nao encontrado no dataset`);

  const tabRes = await fetch(`https://dataverse.harvard.edu/api/access/datafile/${file.dataFile.id}`);
  if (!tabRes.ok) throw new Error(`Download: HTTP ${tabRes.status}`);
  const lines = (await tabRes.text()).trim().split('\n');

  const latest = new Map<string, Estimate>();
  for (const line of lines.slice(1)) {
    const [year, party, ideo] = line.split('\t');
    const p = party.replace(/^"|"$/g, '');
    const y = Number(year);
    const cur = latest.get(p);
    if (!cur || y > cur.ano) latest.set(p, { ano: y, bls: Math.round(Number(ideo) * 1000) / 1000 });
  }

  const candidatos = JSON.parse(
    (await import('node:fs')).readFileSync('public/data/candidatos.json', 'utf8'),
  );
  const siglas = new Set<string>();
  for (const cargo of candidatos.cargos) {
    for (const c of cargo.candidatos) siglas.add(c.partido.sigla);
  }

  const out: Record<string, EspectroEntry> = {};
  for (const sigla of [...siglas].sort()) {
    if (sigla === 'UNIÃO') {
      const psl = latest.get('PSL');
      const dem = latest.get('DEM');
      const v = Math.round((((psl?.bls ?? 0) + (dem?.bls ?? 0)) / 2) * 1000) / 1000;
      out[sigla] = {
        bls: v,
        blsAno: 2021,
        posicao: bucket(v),
        nota: `media heuristica PSL (${psl?.bls}) e DEM (${dem?.bls}) 2021, partidos que se fundiram no UNIAO`,
      };
      continue;
    }
    const est = latest.get(ALIAS[sigla] ?? sigla);
    if (est) {
      const entry: EspectroEntry = { bls: est.bls, blsAno: est.ano, posicao: bucket(est.bls) };
      if (NOTAS[sigla]) entry.nota = NOTAS[sigla];
      out[sigla] = entry;
    } else {
      out[sigla] = { bls: null, blsAno: null, posicao: null, nota: SEM_DADOS };
    }
  }

  writeFileSync('public/data/espectro.json', JSON.stringify(out, null, 2) + '\n');
  console.log(`espectro.json gerado com ${Object.keys(out).length} partidos`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
