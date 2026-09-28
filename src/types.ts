export type CargoId =
  | "presidente"
  | "governador"
  | "senador"
  | "deputado-federal"
  | "deputado-estadual";

export interface Bem {
  tipo: string;
  descricao: string;
  valor: number;
}

export interface Partido {
  numero: number;
  sigla: string;
  nome: string;
}

export type PosicaoIdeologica =
  | "esquerda"
  | "centro-esquerda"
  | "centro"
  | "centro-direita"
  | "direita";

export interface EspectroPartido {
  bls: number | null;
  blsAno: number | null;
  posicao: PosicaoIdeologica | null;
  nota?: string;
}

export interface HistoricoEntry {
  ano: number;
  cargo: string;
  local: string;
  partido: string;
  resultado: string;
}

export interface SituacaoRegistro {
  julgamento: string;
  motivos: string[];
  processo: string | null;
}

export interface Candidato {
  sq: string;
  numero: number;
  nomeUrna: string;
  nomeCompleto: string;
  partido: Partido;
  coligacao: string | null;
  federacao: string | null;
  escolaridade: string;
  ocupacao: string;
  municipioNascimento: string | null;
  ufNascimento: string | null;
  regiao: string | null;
  idade: number | null;
  genero: string;
  corRaca: string;
  patrimonioTotal: number;
  bens: Bem[];
  redes: string[];
  historico: HistoricoEntry[];
  mandato: string | null;
  situacao: SituacaoRegistro | null;
  nota: string | null;
  espectro: EspectroPartido | null;
  foto: string | null;
  proposta: string | null;
}

export interface Cargo {
  id: CargoId;
  nome: string;
  digitos: number;
  candidatos: Candidato[];
}

export interface BaseDados {
  geradoEm: string;
  uf: string;
  cargos: Cargo[];
}

export interface EstadoUsuario {
  votos: Record<string, string>;
  favoritos: string[];
  notas: Record<string, string>;
}

export type FaixaPatrimonio =
  | "zero"
  | "ate-500-mil"
  | "ate-1-milhao"
  | "ate-2-milhoes"
  | "ate-3-milhoes"
  | "ate-5-milhoes"
  | "acima-5-milhoes";

export interface Filtros {
  partido: string | null;
  escolaridade: string | null;
  patrimonio: FaixaPatrimonio | null;
  regiao: string | null;
  espectro: PosicaoIdeologica | null;
  somenteFavoritos: boolean;
  somenteComProposta: boolean;
  somenteComNota: boolean;
}

export type CampoExclusao =
  | "partido"
  | "escolaridade"
  | "patrimonio"
  | "regiao"
  | "espectro";

export type OperacaoExclusao = "is" | "is-not";

export interface Exclusao {
  campo: CampoExclusao;
  operacao: OperacaoExclusao;
  valor: string;
}
