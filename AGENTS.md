# Instruções para agentes

Siga também as convenções do `CLAUDE.md`.

## Atualizar o custo de IA no README

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
