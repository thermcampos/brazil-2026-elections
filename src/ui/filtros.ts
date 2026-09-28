import { escolaridadesDisponiveis, partidosDisponiveis, regioesDisponiveis, ROTULOS_ESPECTRO } from "../data";
import type { BaseDados, FaixaPatrimonio, Filtros, PosicaoIdeologica } from "../types";

export const ROTULOS_PATRIMONIO: Record<FaixaPatrimonio, string> = {
  zero: "Zerado",
  "ate-500-mil": "Até R$ 500 mil",
  "ate-1-milhao": "Até R$ 1 milhão",
  "ate-2-milhoes": "Até R$ 2 milhões",
  "ate-3-milhoes": "Até R$ 3 milhões",
  "ate-5-milhoes": "Até R$ 5 milhões",
  "acima-5-milhoes": "Acima de R$ 5 milhões",
};

export interface AcoesFiltros {
  aoMudar: (filtros: Filtros) => void;
}

export function renderFiltros(dados: BaseDados, filtros: Filtros, acoes: AcoesFiltros): HTMLElement {
  const barra = document.createElement("div");
  barra.className = "filtros";

  const grupoPartido = document.createElement("label");
  grupoPartido.className = "filtros__grupo";
  const rotuloPartido = document.createElement("span");
  rotuloPartido.textContent = "Partido";
  const selectPartido = document.createElement("select");
  selectPartido.appendChild(new Option("Todos", ""));
  for (const partido of partidosDisponiveis(dados)) {
    const rotulo =
      partido.sigla.toLowerCase() === partido.nome.toLowerCase()
        ? partido.sigla
        : `${partido.sigla} — ${partido.nome}`;
    selectPartido.appendChild(new Option(rotulo, partido.sigla));
  }
  selectPartido.value = filtros.partido ?? "";
  selectPartido.addEventListener("change", () => {
    filtros.partido = selectPartido.value || null;
    acoes.aoMudar(filtros);
  });
  grupoPartido.append(rotuloPartido, selectPartido);

  const grupoEscolaridade = document.createElement("label");
  grupoEscolaridade.className = "filtros__grupo";
  const rotuloEscolaridade = document.createElement("span");
  rotuloEscolaridade.textContent = "Escolaridade";
  const selectEscolaridade = document.createElement("select");
  selectEscolaridade.appendChild(new Option("Todas", ""));
  for (const escolaridade of escolaridadesDisponiveis(dados)) {
    selectEscolaridade.appendChild(new Option(escolaridade, escolaridade));
  }
  selectEscolaridade.value = filtros.escolaridade ?? "";
  selectEscolaridade.addEventListener("change", () => {
    filtros.escolaridade = selectEscolaridade.value || null;
    acoes.aoMudar(filtros);
  });
  grupoEscolaridade.append(rotuloEscolaridade, selectEscolaridade);

  const grupoPatrimonio = document.createElement("label");
  grupoPatrimonio.className = "filtros__grupo";
  const rotuloPatrimonio = document.createElement("span");
  rotuloPatrimonio.textContent = "Patrimônio declarado";
  const selectPatrimonio = document.createElement("select");
  selectPatrimonio.appendChild(new Option("Todos", ""));
  for (const [valor, rotulo] of Object.entries(ROTULOS_PATRIMONIO)) {
    selectPatrimonio.appendChild(new Option(rotulo, valor));
  }
  selectPatrimonio.value = filtros.patrimonio ?? "";
  selectPatrimonio.addEventListener("change", () => {
    filtros.patrimonio = (selectPatrimonio.value || null) as FaixaPatrimonio | null;
    acoes.aoMudar(filtros);
  });
  grupoPatrimonio.append(rotuloPatrimonio, selectPatrimonio);

  const grupoRegiao = document.createElement("label");
  grupoRegiao.className = "filtros__grupo";
  const rotuloRegiao = document.createElement("span");
  rotuloRegiao.textContent = "Região de nascimento";
  const selectRegiao = document.createElement("select");
  selectRegiao.appendChild(new Option("Todas", ""));
  for (const regiao of regioesDisponiveis(dados)) {
    selectRegiao.appendChild(new Option(regiao, regiao));
  }
  selectRegiao.appendChild(new Option("Fora de SC", "__fora__"));
  selectRegiao.value = filtros.regiao ?? "";
  selectRegiao.addEventListener("change", () => {
    filtros.regiao = selectRegiao.value || null;
    acoes.aoMudar(filtros);
  });
  grupoRegiao.append(rotuloRegiao, selectRegiao);

  const grupoEspectro = document.createElement("label");
  grupoEspectro.className = "filtros__grupo";
  const rotuloEspectro = document.createElement("span");
  rotuloEspectro.textContent = "Posição do partido";
  const selectEspectro = document.createElement("select");
  selectEspectro.appendChild(new Option("Todas", ""));
  for (const [valor, rotulo] of Object.entries(ROTULOS_ESPECTRO)) {
    selectEspectro.appendChild(new Option(rotulo, valor));
  }
  selectEspectro.value = filtros.espectro ?? "";
  selectEspectro.addEventListener("change", () => {
    filtros.espectro = (selectEspectro.value || null) as PosicaoIdeologica | null;
    acoes.aoMudar(filtros);
  });
  grupoEspectro.append(rotuloEspectro, selectEspectro);

  const grupoFavoritos = document.createElement("label");
  grupoFavoritos.className = "filtros__grupo filtros__grupo--checkbox";
  const checkboxFavoritos = document.createElement("input");
  checkboxFavoritos.type = "checkbox";
  checkboxFavoritos.checked = filtros.somenteFavoritos;
  checkboxFavoritos.addEventListener("change", () => {
    filtros.somenteFavoritos = checkboxFavoritos.checked;
    acoes.aoMudar(filtros);
  });
  const rotuloFavoritos = document.createElement("span");
  rotuloFavoritos.textContent = "Com estrelas";
  grupoFavoritos.append(checkboxFavoritos, rotuloFavoritos);

  barra.append(grupoPartido, grupoEspectro, grupoEscolaridade, grupoPatrimonio, grupoRegiao, grupoFavoritos);
  return barra;
}
