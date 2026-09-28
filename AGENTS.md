# Fluxo padrão deste repositório

- Após **cada mudança**, commitar e dar push para `origin main` (não esperar o usuário pedir).
- Sempre desabilitar assinatura GPG no commit: `git -c commit.gpgsign=false commit ...`.

# Comandos

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (rode após mudanças para validar)
- `npx tsc --noEmit` — typecheck
- `npm run build:data` — regenera `public/data/candidatos.json` a partir dos zips do TSE na raiz

# Convenções

- Todo o conteúdo visível ao usuário (UI, textos, dados exibidos) em português brasileiro.
- Frontend puro: Vite + TypeScript + HTML + CSS, sem framework.
- Dados: JSON estático em `public/data/` + `localStorage` para escolhas do usuário. Sem backend, sem login.
- Tipos compartilhados em `src/types.ts`.
- Notas manuais sobre candidatos ficam em `public/data/notas.json` (mapa `SQ_CANDIDATO` → texto).

# Atualizar o custo de IA no README

Antes do **último commit** de cada sessão de trabalho, atualize a seção
"Custo de desenvolvimento (IA)" do `README.md` com o total acumulado e a
data/hora da atualização. O valor sai do banco SQLite do Crush:

```bash
python3 -c "
import sqlite3
db = sqlite3.connect('file:.crush/crush.db?mode=ro', uri=True)
print(db.execute('SELECT ROUND(SUM(cost),2) FROM sessions').fetchone()[0])"
```

Atualize no README apenas o valor total e a linha "Última atualização"
(formato `AAAA-MM-DD HH:MM (-03)`). Não é necessário detalhar por sessão.
