# Fluxo padrão deste repositório

- Após **cada mudança**, commitar e dar push para `origin main` (não esperar o usuário pedir).
- Sempre desabilitar assinatura GPG no commit: `git -c commit.gpgsign=false commit ...`.

# Comandos

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (rode após mudanças para validar)
- `npx tsc --noEmit` — typecheck
- `npm run build:data` — regenera `public/data/candidatos.json` a partir dos zips do TSE na raiz
- `npm run build:espectro` — regenera `public/data/espectro.json` (posição ideológica por partido, fonte BLS); metodologia e limitações em `docs/espectro-ideologico.md`

# Convenções

- Todo o conteúdo visível ao usuário (UI, textos, dados exibidos) em português brasileiro.
- Frontend puro: Vite + TypeScript + HTML + CSS, sem framework.
- Dados: JSON estático em `public/data/` + `localStorage` para escolhas do usuário. Sem backend, sem login.
- Tipos compartilhados em `src/types.ts`.
- Notas manuais sobre candidatos ficam em `public/data/notas.json` (mapa `SQ_CANDIDATO` → texto).
- `public/data/espectro.json`: mapa sigla do partido → `{ bls, blsAno, posicao, nota? }`; `posicao` é `null` quando o partido não tem medição no BLS.
