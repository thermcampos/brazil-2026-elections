import "./style.css";
import { carregarDados } from "./data";
import { alternarFavorito, carregarEstado, definirVoto, limparEscolhas } from "./storage";
import type { BaseDados, CargoId, EstadoUsuario } from "./types";
import { renderColinha } from "./ui/colinha";
import { renderSecao } from "./ui/secao";

async function iniciar(): Promise<void> {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) return;

  let dados: BaseDados;
  try {
    dados = await carregarDados();
  } catch {
    app.innerHTML = "<p class=\"erro\">Não foi possível carregar os dados dos candidatos.</p>";
    return;
  }

  let estado: EstadoUsuario = carregarEstado();

  function atualizarCards(cargoId: CargoId): void {
    const secao = document.querySelector(`#cargo-${cargoId}`);
    if (!secao) return;
    for (const card of secao.querySelectorAll<HTMLElement>(".card")) {
      const sq = card.dataset.sq ?? "";
      const votado = estado.votos[cargoId] === sq;
      const favorito = estado.favoritos.includes(sq);
      card.classList.toggle("card--votado", votado);
      const botaoVoto = card.querySelector<HTMLButtonElement>(".botao--voto, .botao--votado");
      if (botaoVoto) {
        botaoVoto.className = votado ? "botao botao--votado" : "botao botao--voto";
        botaoVoto.textContent = votado ? "✓ Meu voto" : "Meu voto";
      }
      const botaoFav = card.querySelector<HTMLButtonElement>(".botao--favorito");
      if (botaoFav) {
        botaoFav.classList.toggle("ativo", favorito);
        botaoFav.textContent = favorito ? "★" : "☆";
        botaoFav.title = favorito ? "Remover dos favoritos" : "Adicionar aos favoritos";
      }
    }
  }

  function atualizarColinha(): void {
    const antiga = document.querySelector("#colinha");
    const nova = renderColinha(dados, estado, { aoLimpar });
    antiga?.replaceWith(nova);
  }

  function aoLimpar(): void {
    if (!confirm("Limpar todos os seus votos e favoritos?")) return;
    estado = limparEscolhas();
    for (const cargo of dados.cargos) atualizarCards(cargo.id);
    atualizarColinha();
  }

  const acoes = {
    aoVotar: (cargo: CargoId, sq: string) => {
      estado = definirVoto(cargo, sq);
      atualizarCards(cargo);
      atualizarColinha();
    },
    aoFavoritar: (sq: string) => {
      estado = alternarFavorito(sq);
      for (const cargo of dados.cargos) atualizarCards(cargo.id);
    },
  };

  const secoes = dados.cargos.map((cargo) => renderSecao(cargo, estado, acoes));
  const colinha = renderColinha(dados, estado, { aoLimpar });
  app.replaceChildren(...secoes, colinha);
}

iniciar();
