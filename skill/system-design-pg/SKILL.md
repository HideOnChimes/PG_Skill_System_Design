---
name: system-design-pg
description: >-
  Design a software system end-to-end into a polished deliverable doc set: a
  Markdown design doc (.md), a Mermaid class diagram (.mmd), and a print-ready
  PDF (.pdf) — with the diagram embedded as vector SVG, no PNG. Use this whenever
  the user wants to DESIGN or ARCHITECT a system, module, tool, service, or
  feature and wants real files out of it — e.g. "faça o design do sistema X",
  "design a system for…", "cria a doc de arquitetura com diagrama e pdf",
  "system design pg", or references this exact md+mmd+pdf format. Handles one
  idea or several (one file set per system). Don't just answer inline — produce
  the files and render the PDF.
---

# System Design PG

Turn a system idea into a documentation set that looks hand-crafted: one design
doc per system, each with an embedded UML-style class diagram, exported to PDF.

**Per system you produce three files** (same base slug):

| File | What it is |
|---|---|
| `<slug>.md` | The design doc. Source of truth. Diagram lives inside it as a ` ```mermaid ` fence. |
| `<slug>.mmd` | The class diagram alone (extracted by the render script). Renders on GitHub / VS Code. |
| `<slug>.pdf` | Print-ready doc with the diagram embedded as **vector SVG**. No PNG anywhere. |

The `.mmd` and `.pdf` are *generated* from the `.md` — you author one source (the
doc, with the diagram fenced inside it) and the script emits the other two. That
keeps the diagram from drifting out of sync with the prose.

## When the user gives you an idea

1. **Scope it.** If the idea is concrete enough to design, go. If it's missing
   something load-bearing — the domain, the rough scale, the main components, or
   the platform — ask 2–3 short questions first. Don't over-interview; a good
   design doc can state its assumptions explicitly (the template has a place for
   that) rather than block on every unknown.

2. **One system or several?** A single idea can decompose into multiple systems
   (like a "host + plugins" suite, or "API + worker + store"). When it does,
   make one file set per system and pick a short `kebab-case` slug for each.

3. **Pick an output folder.** Default to a `design/` folder in the current
   directory unless the user says otherwise. Put every system's files there.

## Authoring the doc

Write `<slug>.md` following the section structure in
[references/doc-structure.md](references/doc-structure.md). That file is the
contract for *what goes in the doc* — read it before writing. It covers the
header meta-table, the one-line lead, and the nine sections (context → scope →
architecture → class reference → flows → trade-offs → integration → how-to-use →
what-to-revisit).

Inside section 3 (Arquitetura), embed **exactly one** class diagram as a fenced
` ```mermaid ` block. Write that diagram per
[references/mermaid-style.md](references/mermaid-style.md) — it explains the ELK
layout, clean signatures (descriptions live in the doc's tables, *not* crammed
into the boxes), stereotypes, and relationship arrows that keep the diagram
readable instead of a tangle of crossing lines.

Match the reader's language. If the user writes in Portuguese, write the doc in
Portuguese (the template and example are pt-BR).

## Rendering to .mmd + .pdf

Once the `.md` files exist, run the render script once over the folder:

```bash
node "<skill-dir>/scripts/md2pdf.js" design/
```

You can also pass individual files: `node .../md2pdf.js a.md b.md`. For each
`.md` the script:

- extracts the ` ```mermaid ` fence(s) into `<slug>.mmd`,
- renders the diagram to inline SVG and builds a styled `<slug>.pdf`,
- cleans up every temp file — **no `.png`, no `.html`, no `.svg` left behind**.

**First run bootstraps itself**: if `scripts/node_modules` is missing it runs
`npm install` there (markdown-it + mermaid-cli + the ELK layout plugin). It does
*not* download Chromium — it drives the **Chrome or Edge already on the machine**.
Requirements: Node ≥ 18 and Chrome/Edge installed. If the browser isn't in a
standard location, set `CHROME_PATH` to the executable before running.

After rendering, verify one PDF actually looks right before declaring done — a
quick screenshot of the page or opening it. The diagram is the part most likely
to need a layout nudge.

## Delivering

Hand back the three files per system and state the one-line regen command
(`node .../md2pdf.js design/`) so the user can rebuild after editing a `.md`.
Don't paste the whole doc into chat — the files are the deliverable; summarize
what each system covers and any assumptions you made.

## Notes

- The render toolchain (script, CSS, deps) lives in `scripts/`. Treat
  `scripts/doc.css` as the house style — tweak it there if the user wants a
  different look, and it applies to every PDF.
- Keep the diagram boxes lean. If lines still overlap, the usual cause is
  descriptions stuffed into the boxes — move them to the doc tables and let ELK
  breathe. See the mermaid reference.
