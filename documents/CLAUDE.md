# CLAUDE.md

MR2S papers — the AQC/NOLTA submission (`AQC/`), its Korean and English
versions (`paper/ko`, `paper/en`), and an internal report (`report/`).

## Instructions

This repository's agent instructions live in [`AGENTS.md`](AGENTS.md). Read it
first; it links the workflow, testing, and Git documents under `.agents/docs/`.

Read [`.agents/docs/project.md`](.agents/docs/project.md) before non-trivial
work. This repository holds LaTeX, not code: build with `latexmk -pdfxe
main.tex` (XeLaTeX is required for `kotex`), and keep `paper/ko` and `paper/en`
in sync.
