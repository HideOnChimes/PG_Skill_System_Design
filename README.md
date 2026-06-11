# system-design-pg

Skill para **Claude Code** que gera documentação de design de sistemas em um conjunto pronto de arquivos: **`.md`** (doc com 9 seções), **`.mmd`** (diagrama de classes Mermaid, layout ELK) e **`.pdf`** renderizado — sem PNG, saída limpa.

Peça um design qualquer e a skill produz os três arquivos automaticamente.

---

## Instalar

**Windows (PowerShell 5.1+):**
```powershell
irm https://raw.githubusercontent.com/HideOnChimes/PG_Skill_System_Design/main/install.ps1 | iex
```

**macOS / Linux / WSL / Git Bash:**
```bash
curl -fsSL https://raw.githubusercontent.com/HideOnChimes/PG_Skill_System_Design/main/install.sh | bash
```

Leva ~30s. Seguro rodar de novo (sobrescreve a versão antiga).

### Pré-requisitos
- **Node ≥ 18** — <https://nodejs.org>
- **Chrome ou Edge** instalado (o renderer usa o navegador do sistema; não baixa Chromium)

O instalador copia a skill para `~/.claude/skills/system-design-pg/` e roda o `npm install` do renderer.

---

## Usar

Abra uma nova sessão do Claude Code em qualquer projeto e peça:

> "Faça o design de um sistema de autenticação com JWT e refresh token — quero o md, diagrama e PDF."

A skill dispara sozinha (pelo `description` no frontmatter) e gera os arquivos.

---

## Atualizar

Rode o mesmo comando de instalação de novo — ele sobrescreve com a versão mais recente.

## Desinstalar

Apague a pasta:
```bash
rm -rf ~/.claude/skills/system-design-pg     # macOS/Linux
```
```powershell
Remove-Item -Recurse -Force "$HOME\.claude\skills\system-design-pg"   # Windows
```

---

## Estrutura do repo

```
system-design-pg/
├── install.ps1                     # instalador Windows
├── install.sh                      # instalador Unix
└── skill/
    └── system-design-pg/           # a skill em si (vai pra ~/.claude/skills/)
        ├── SKILL.md
        ├── references/
        └── scripts/                # md2pdf.js + doc.css (renderer)
```

> **Observação:** as skills instaladas em `~/.claude/skills/` **não aparecem** na aba *Customize* do Claude Code (essa aba lista só plugins de marketplace). A skill fica ativa de forma invisível — confirme com `/help` numa sessão nova.
