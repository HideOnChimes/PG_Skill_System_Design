# PG_Skill_System_Design

A **Claude Code** skill that turns a system idea into a polished documentation set: a Markdown design doc (**`.md`**, 9 sections), a Mermaid class diagram (**`.mmd`**, ELK layout) and a print-ready **`.pdf`** — diagram embedded as vector SVG, no PNG, clean output.

Just describe a system and the skill produces all three files automatically.

---

## Install (one command)

**Windows (PowerShell 5.1+):**
```powershell
irm https://raw.githubusercontent.com/HideOnChimes/PG_Skill_System_Design/main/install.ps1 | iex
```

**macOS / Linux / WSL / Git Bash:**
```bash
curl -fsSL https://raw.githubusercontent.com/HideOnChimes/PG_Skill_System_Design/main/install.sh | bash
```

Takes ~30s. Safe to re-run (overwrites the old version).

### Requirements
- **Node ≥ 18** — <https://nodejs.org>
- **Chrome or Edge** installed (the renderer uses your system browser; it does **not** download Chromium)

The installer copies the skill to `~/.claude/skills/system-design-pg/` and runs the renderer's `npm install`.

---

## Usage

Open a **new** Claude Code session in any project. Two ways to trigger it:

**1. Automatic (recommended)** — just describe the system. Claude detects the skill from its description and fires it on its own:

> "Design a token-bucket rate limiter library for an API gateway — I want the doc, class diagram and a PDF."

**2. Explicit** — force it with the slash command, then your idea:

```
/system-design-pg design an inventory system for a Unity game with stackable items and save persistence
```

Either way you get three files per system (`<slug>.md`, `<slug>.mmd`, `<slug>.pdf`). Pass several ideas at once and it produces one file set per system.

---

## Output

| File | What it is |
|---|---|
| `<slug>.md` | The design doc (9 sections). Source of truth — the diagram lives inside it as a ` ```mermaid ` fence. |
| `<slug>.mmd` | The class diagram alone, extracted by the render script. Renders on GitHub / VS Code. |
| `<slug>.pdf` | Print-ready doc with the diagram embedded as **vector SVG**. |

The `.mmd` and `.pdf` are generated from the `.md`, so the diagram never drifts out of sync with the prose.

---

## Update

Run the same install command again — it overwrites with the latest version.

## Uninstall

```bash
rm -rf ~/.claude/skills/system-design-pg          # macOS/Linux
```
```powershell
Remove-Item -Recurse -Force "$HOME\.claude\skills\system-design-pg"   # Windows
```

---

## Repo layout

```
PG_Skill_System_Design/
├── install.ps1                     # Windows installer
├── install.sh                      # Unix installer
└── skill/
    └── system-design-pg/           # the skill itself (lands in ~/.claude/skills/)
        ├── SKILL.md
        ├── references/
        └── scripts/                # md2pdf.js + doc.css (renderer)
```

> **Note:** skills installed under `~/.claude/skills/` do **not** show up in Claude Code's *Customize* tab (that tab only lists marketplace plugins). The skill is active but invisible there — confirm with `/help` in a new session, or just describe a system and watch it fire.
