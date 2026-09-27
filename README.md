# Eleições 2026 · Santa Catarina — Meu Guia de Voto

Landing page em frontend puro (Vite + TypeScript + HTML + CSS, sem framework) para
comparar candidatos às Eleições 2026 em Santa Catarina e à Presidência da República,
com dados abertos do TSE. Suas escolhas ("Meu voto" e favoritos) ficam salvas apenas
no `localStorage` do navegador, sem login e sem backend.

## Como rodar

```bash
npm install
npm run build:data   # gera public/data/candidatos.json a partir dos zips do TSE
npm run dev          # ambiente de desenvolvimento
npm run build        # build de produção em dist/
```

Os arquivos `.zip` do TSE devem estar na raiz do projeto (não são versionados).

## Estrutura

```
scripts/build-data.ts      # pipeline: CSVs (latin-1, ';') -> JSON estático
public/data/               # JSON gerado com todos os candidatos
public/fotos/              # fotos dos candidatos (SC)
public/propostas/          # propostas de governo em PDF (SC)
src/
  main.ts                  # bootstrap e orquestração
  types.ts                 # tipos compartilhados (Candidato, Cargo, etc.)
  data.ts                  # carregamento do JSON, busca e formatação
  storage.ts               # votos e favoritos no localStorage
  ui/card.ts               # card do candidato (resumo + detalhes)
  ui/secao.ts              # seção por cargo (botão, busca, grade)
  ui/colinha.ts            # resumo final "Minha colinha"
  style.css
```

## Cobertura dos dados

| Cargo             | Candidatos | Fotos | Propostas (PDF) |
| ----------------- | ---------- | ----- | --------------- |
| Presidente        | 14         | —     | —               |
| Governador        | 8          | ✓     | ✓               |
| Senador           | 13         | ✓     | —               |
| Deputado Federal  | 231        | ✓     | —               |
| Deputado Estadual | 414        | ✓     | —               |

Fotos e propostas só existem nos arquivos do TSE para SC. Para atualizar os dados,
baixe novamente os zips do TSE e rode `npm run build:data`.
