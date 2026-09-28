import {
  ROTULOS_ESPECTRO,
  escolaridadesDisponiveis,
  partidosDisponiveis,
  regioesDisponiveis,
} from "../data";
import type { BaseDados, CampoExclusao, Exclusao, OperacaoExclusao } from "../types";
import { ROTULOS_PATRIMONIO } from "./filtros";

const ROTULOS_CAMPO: Record<CampoExclusao, string> = {
  partido: "Partido",
  escolaridade: "Escolaridade",
  patrimonio: "Patrimônio declarado",
  regiao: "Região de nascimento",
  espectro: "Posição do partido",
};

export interface AcoesExclusoes {
  aoMudar: (exclusoes: Exclusao[]) => void;
}

export function renderExclusoes(
  dados: BaseDados,
  exclusoes: Exclusao[],
  acoes: AcoesExclusoes,
): HTMLElement {
  const painel = document.createElement("div");
  painel.className = "exclusoes";

  const cabecalho = document.createElement("div");
  cabecalho.className = "exclusoes__cabecalho";
  const titulo = document.createElement("h2");
  titulo.textContent = "Exclusões";
  const botaoAdicionar = document.createElement("button");
  botaoAdicionar.type = "button";
  botaoAdicionar.className = "botao botao--adicionar-exclusao";
  botaoAdicionar.textContent = "Adicionar exclusão";
  cabecalho.append(titulo, botaoAdicionar);

  const lista = document.createElement("div");
  lista.className = "exclusoes__lista";

  const vazio = document.createElement("p");
  vazio.className = "exclusoes__vazio";
  vazio.textContent = "Nenhuma exclusão adicionada.";

  painel.append(cabecalho, lista, vazio);

  function opcoesValor(campo: CampoExclusao): [string, string][] {
    switch (campo) {
      case "partido":
        return partidosDisponiveis(dados).map((partido) => [
          partido.sigla,
          partido.sigla.toLowerCase() === partido.nome.toLowerCase()
            ? partido.sigla
            : `${partido.sigla} — ${partido.nome}`,
        ]);
      case "escolaridade":
        return escolaridadesDisponiveis(dados).map((escolaridade) => [escolaridade, escolaridade]);
      case "patrimonio":
        return Object.entries(ROTULOS_PATRIMONIO);
      case "regiao":
        return [
          ...regioesDisponiveis(dados).map((regiao): [string, string] => [regiao, regiao]),
          ["__fora__", "Fora de SC"],
        ];
      case "espectro":
        return Object.entries(ROTULOS_ESPECTRO);
    }
  }

  function montarLinha(exclusao: Exclusao): HTMLElement {
    const linha = document.createElement("div");
    linha.className = "exclusoes__linha";

    const selectCampo = document.createElement("select");
    selectCampo.setAttribute("aria-label", "Campo da exclusão");
    for (const [valor, rotulo] of Object.entries(ROTULOS_CAMPO)) {
      selectCampo.appendChild(new Option(rotulo, valor));
    }
    selectCampo.value = exclusao.campo;

    const selectOperacao = document.createElement("select");
    selectOperacao.setAttribute("aria-label", "Operação da exclusão");
    selectOperacao.appendChild(new Option("é", "is"));
    selectOperacao.appendChild(new Option("não é", "is-not"));
    selectOperacao.value = exclusao.operacao;

    const selectValor = document.createElement("select");
    selectValor.setAttribute("aria-label", "Valor da exclusão");

    function preencherValores(): void {
      selectValor.replaceChildren();
      for (const [valor, rotulo] of opcoesValor(exclusao.campo)) {
        selectValor.appendChild(new Option(rotulo, valor));
      }
      selectValor.value = exclusao.valor;
    }
    preencherValores();

    selectCampo.addEventListener("change", () => {
      exclusao.campo = selectCampo.value as CampoExclusao;
      exclusao.valor = opcoesValor(exclusao.campo)[0]?.[0] ?? "";
      preencherValores();
      acoes.aoMudar(exclusoes);
    });
    selectOperacao.addEventListener("change", () => {
      exclusao.operacao = selectOperacao.value as OperacaoExclusao;
      acoes.aoMudar(exclusoes);
    });
    selectValor.addEventListener("change", () => {
      exclusao.valor = selectValor.value;
      acoes.aoMudar(exclusoes);
    });

    const botaoRemover = document.createElement("button");
    botaoRemover.type = "button";
    botaoRemover.className = "botao exclusoes__remover";
    botaoRemover.textContent = "✕";
    botaoRemover.title = "Remover exclusão";
    botaoRemover.addEventListener("click", () => {
      exclusoes.splice(exclusoes.indexOf(exclusao), 1);
      renderizar();
      acoes.aoMudar(exclusoes);
    });

    linha.append(selectCampo, selectOperacao, selectValor, botaoRemover);
    return linha;
  }

  function renderizar(): void {
    lista.replaceChildren(...exclusoes.map(montarLinha));
    vazio.hidden = exclusoes.length > 0;
  }

  botaoAdicionar.addEventListener("click", () => {
    const campo: CampoExclusao = "partido";
    exclusoes.push({ campo, operacao: "is-not", valor: opcoesValor(campo)[0]?.[0] ?? "" });
    renderizar();
    acoes.aoMudar(exclusoes);
  });

  renderizar();
  return painel;
}
