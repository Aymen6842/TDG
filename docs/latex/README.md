# Tawer Management — PFE Report (LaTeX / Overleaf)

LaTeX source for the *Design and Implementation of Tawer Management* PFE report.

## Compiling

**Compile with XeLaTeX or LuaLaTeX — not pdfLaTeX.** The document uses
`fontspec` and keeps unicode characters as-is (arrows `→`, the multiplication
sign `×`, em dashes `—`, and French accents `é à ç`). Only XeLaTeX/LuaLaTeX
render these correctly; pdfLaTeX will error on them.

**No emoji in the sources.** Latin Modern has no glyphs for ✅/⚠ — XeLaTeX
silently drops them. Use the `\pass` (green checkmark) and `\warn` (amber `!`)
macros from `main.tex` in acceptance/result cells instead.

```bash
# from this folder
latexmk -xelatex main.tex
# or, without latexmk:
xelatex main.tex   # run twice so the TOC / lists of figures & tables resolve
xelatex main.tex
```

On **Overleaf**: Menu → Settings → *Compiler* → **XeLaTeX** (or LuaLaTeX).

Run the compiler **twice** on a clean build so `\tableofcontents`,
`\listoffigures`, and `\listoftables` populate.

## Folder layout

```
latex/
├── main.tex          Master file: preamble, packages, macros, \input order.
├── frontmatter.tex   Title page, outstanding-items table, Résumé/Abstract,
│                     auto TOC + lists, glossary. (this session)
├── ch1.tex           Chapter 1                 ─┐
├── ch2.tex           Chapter 2                  │
├── ch3-part1.tex     Chapter 3 (part 1)         │ produced by the
├── ch3-part2.tex     Chapter 3 (part 2)         │ parallel sessions
├── ch4.tex           Chapter 4                  │
├── conclusion.tex    Conclusion & Perspectives  │
├── annex.tex         Annex A                    ─┘
├── README.md         This file.
├── diagrams-src/     54 PlantUML sources, named fig_N_M.puml (e.g. fig_3_17.puml).
└── figures/          Rendered images + screenshots go here (see below).
```

`main.tex` `\input`s the content files in reading order:
`frontmatter → ch1 → ch2 → ch3-part1 → ch3-part2 → ch4 → conclusion → annex`.

Nothing in the `.tex` files needs hand-editing to bring images in — just drop
the rendered files into `figures/` (see the auto-detect note below).

## Rendering the diagrams

The 54 UML/architecture diagrams live as PlantUML sources in `diagrams-src/`,
named `fig_N_M.puml` (matching figure numbers 1.1 … 4.6). Render them to PNG
into `figures/`:

```bash
# from this folder — needs plantuml (and Java) on PATH
plantuml -tpng -o ../figures diagrams-src/*.puml
```

This writes `figures/fig_N_M.png` for each source. Alternatively, use the
**PlantUML extension for VS Code** (open a `.puml`, *Export Current Diagram* →
PNG) and save the result into `figures/` under the same `fig_N_M` name.

## Screenshots

UI screenshots are referenced by the **P-numbers** from the Outstanding Author
Items table (the Placeholder Register — P-07 … P-33). Drop each screenshot into
`figures/` named `screenshot_PXX.png` (e.g. `screenshot_P17.png` for the Kanban
board).

## How the figure auto-detect works

Figures are inserted with the `\reportfigure{<path-without-extension>}{caption}{label}`
macro. For each figure it:

1. tries `<path>.pdf`, then
2. tries `<path>.png`, and
3. if **neither exists**, renders a loud purple **“FIGURE PENDING”** box in the
   PDF showing the expected filename and the caption.

So a missing image never breaks the build — you just see the pending box while
scrolling. Add the correctly-named file to `figures/`, recompile, and the box
is silently replaced by the real image. No `.tex` edits required.
