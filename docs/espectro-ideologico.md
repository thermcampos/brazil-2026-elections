# Espectro ideológico dos partidos

Fonte: **Brazilian Legislative Surveys (BLS)**, de César Zucco (FGV) e Timothy Power (Oxford). O BLS pergunta aos próprios deputados federais onde se posicionam na escala esquerda–direita e agrega as respostas por partido e por legislatura.

## Dados utilizados

- Estimativas de posição ideológica de partidos e presidentes, baseadas nas ondas 1–9 do BLS (1990–2021):
  Zucco & Power, *Replication Data for: The Ideology of Brazilian Parties and Presidents*,
  [doi:10.7910/DVN/6KVTUV](https://doi.org/10.7910/DVN/6KVTUV) (CC0), arquivo `bls9_estimates_partiespresidents_long.tab`.
  Coluna `Ideo`: ponto ideal reescalonado (negativo = esquerda, positivo = direita), com erro padrão em `Ideo.se`.
- Dados brutos das ondas: [doi:10.7910/DVN/WM9IZ8](https://doi.org/10.7910/DVN/WM9IZ8).
- O dado mais recente publicado é a onda de 2021. Uma 10ª onda foi aplicada, mas ainda não depositada.

## Como o mapeamento é gerado

`npm run build:espectro` baixa as estimativas do Dataverse, pega a medição mais recente de cada partido e gera `public/data/espectro.json`, cobrindo todas as siglas presentes em `candidatos.json`.

Faixas de classificação (sobre o valor `bls`):

| Faixa | Posição |
|---|---|
| ≤ -0,5 | esquerda |
| -0,5 a -0,15 | centro-esquerda |
| -0,15 a 0,15 | centro |
| 0,15 a 0,5 | centro-direita |
| ≥ 0,5 | direita |

## Casos especiais e limitações

- **UNIÃO**: média heurística entre PSL (0,803) e DEM (0,431) de 2021, partidos que se fundiram no União Brasil. Não é medição própria.
- **PRD**: usa PTB 2021 como proxy. O PRD nasceu da fusão PTB + Patriota (registro TSE nov/2023); o Patriota nunca foi avaliado no BLS.
- **AGIR**: linhagem PJ → PRN → PTC → AGIR; usa PRN 1993 (medição muito antiga, tratar com cautela).
- **PSTU** (1993), **PV** e **REDE** (2017): medições antigas por ausência de bancada em ondas recentes.
- **Sem dados**: AVANTE (ex-PTdoB), DC, DEMOCRATA, MISSÃO (partido novo do MBL, registro 2025), PCB, PCO, PRTB e UP nunca foram avaliados no BLS (sem bancada federal ou partidos novos). Para esses, `posicao` é `null` e a classificação precisa ser curadoria manual, se desejada.
- O BLS mede o **partido** (posição mediana da bancada federal), não o candidato individual. Dissidentes dentro de um partido serão classificados pelo partido.

## Fontes das linhagens partidárias

- PRD (fusão PTB + Patriota): [Agência Brasil, 09/11/2023](https://agenciabrasil.ebc.com.br/justica/noticia/2023-11/tse-aprova-criacao-do-prd-resultado-de-fusao-entre-ptb-e-patriota)
- MISSÃO (partido novo, MBL): [TSE, nov/2025](https://www.tse.jus.br/comunicacao/noticias/2025/Novembro/tse-aprova-registro-e-homologa-estatuto-do-partido-missao)
- AGIR (ex-PTC): [TSE, mar/2022](https://www.tse.jus.br/comunicacao/noticias/2022/Marco/tse-aprova-alteracao-e-partido-trabalhista-cristao-passa-a-se-chamar-agir)
- AVANTE (ex-PTdoB): [Wikipédia](https://pt.wikipedia.org/wiki/Avante_(partido_pol%C3%ADtico))
