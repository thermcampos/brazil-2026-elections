import { aplicarFiltros, filtrarCandidatos } from "../data";
import type { Cargo, EstadoUsuario, Filtros } from "../types";
import { renderCard, type AcoesCard } from "./card";

export function renderSecao(
  cargo: Cargo,
  estado: EstadoUsuario,
  acoes: AcoesCard,
  obterFiltros: () => Filtros,
): HTMLElement {
  const secao = document.createElement("section");
  secao.className = "secao";
  secao.id = `cargo-${cargo.id}`;

  const cabecalho = document.createElement("div");
  cabecalho.className = "secao__cabecalho";
  const titulo = document.createElement("h2");
  titulo.textContent = cargo.nome;
  const total = document.createElement("span");
  total.className = "secao__total";
  total.textContent = `${cargo.candidatos.length} candidatos`;
  cabecalho.append(titulo, total);
  secao.appendChild(cabecalho);

  const botaoVer = document.createElement("button");
  botaoVer.type = "button";
  botaoVer.className = "botao botao--ver";
  botaoVer.textContent = "Ver candidatos";
  secao.appendChild(botaoVer);

  const corpo = document.createElement("div");
  corpo.className = "secao__corpo";
  corpo.hidden = true;
  secao.appendChild(corpo);

  let aberto = false;
  botaoVer.addEventListener("click", () => {
    aberto = !aberto;
    corpo.hidden = !aberto;
    botaoVer.textContent = aberto ? "Ocultar candidatos" : "Ver candidatos";
    if (aberto && !corpo.hasChildNodes()) {
      montarCorpo();
    }
  });

  function montarCorpo(): void {
    const busca = document.createElement("input");
    busca.type = "search";
    busca.className = "secao__busca";
    busca.placeholder = "Buscar por nome, número ou partido…";
    busca.setAttribute("aria-label", `Buscar candidato a ${cargo.nome}`);

    const grade = document.createElement("div");
    grade.className = "grade";

    const vazio = document.createElement("p");
    vazio.className = "secao__vazio";
    vazio.textContent = "Nenhum candidato encontrado.";
    vazio.hidden = true;

    function renderizarGrade(): void {
      const filtrados = aplicarFiltros(filtrarCandidatos(cargo.candidatos, busca.value), obterFiltros());
      grade.replaceChildren(
        ...filtrados.map((c) => renderCard(c, cargo.id, estado, acoes)),
      );
      vazio.hidden = filtrados.length > 0;
      total.textContent =
        filtrados.length === cargo.candidatos.length
          ? `${cargo.candidatos.length} candidatos`
          : `${filtrados.length} de ${cargo.candidatos.length} candidatos`;
    }

    busca.addEventListener("input", renderizarGrade);
    window.addEventListener("filtros-alterados", renderizarGrade);
    renderizarGrade();

    corpo.append(busca, grade, vazio);
  }

  return secao;
}
