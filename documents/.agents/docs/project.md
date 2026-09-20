# Project Context

Fill this document during project initialization. Agents must verify commands against repository configuration before running them.

## Overview

- Product: the MR2S paper set — the AQC/NOLTA submission, its Korean working
  document, and an internal report.
- Repository: https://github.com/quantum-guardians/documents
- Primary users: the MR2S authors and paper reviewers.
- Core domain: quantum-annealing (QUBO) optimization of pedestrian-network edge
  direction for crowd-crush prevention.
- Runtime environment: LaTeX. CI uses `xu-cheng/latex-action@v4` with
  `latexmk_use_xelatex` and TeX Live 2026.

## Architecture

- Entry points: `AQC/main.tex` (original submission), `paper/ko/main.tex`
  (Korean working document), `report/main.tex` (report).
- Main modules: `AQC/nolta2025.sty` is the shared NOLTA style;
  `AQC/Fig_MaiDinhCong/` and `paper/ko/fig/` hold figures; `report/` keeps its
  own figures and `references.bib`.
- Dependency direction: `paper/ko` includes `../../AQC/nolta2025`, so the style
  file governs every document that uses it. `paper/ko/main.tex` carries the
  current formulation, proofs, and results.
- External systems: GitHub Actions builds the Korean PDF and uploads it as the
  `aqc-paper-ko` artifact.
- Persistent data: the built `main.pdf` files are committed alongside sources.

## Commands

| Purpose | Command |
|---|---|
| Install dependencies | A TeX Live install with Korean support (`kotex`) |
| Run locally | `latexmk -pdfxe main.tex` from `paper/ko`, `AQC`, or `report` |
| Format | TODO — none configured |
| Lint | TODO — none configured |
| Type-check | Not applicable |
| Unit tests | Not applicable; the build itself is the check |
| Integration tests | The `Build Korean AQC paper` workflow |
| Build | `latexmk -pdfxe main.tex` (XeLaTeX is required for `kotex`) |

## Constraints

- Supported platforms: any TeX Live 2026 environment with XeLaTeX.
- Compatibility requirements: the NOLTA style and page limits govern layout —
  do not alter `AQC/nolta2025.sty` to fit content. Korean sources need `kotex`
  and XeLaTeX; pdfLaTeX will not compile them.
- Performance constraints: none.
- Security or privacy requirements: author affiliations and contact details are
  published; keep unreleased numbers out until the corresponding experiment is
  reproducible.

## Ownership

- Maintainers: Yunseong <me@yunseong.dev>; paper authors listed in each
  `main.tex`
- Sensitive modules: `AQC/nolta2025.sty`, author and affiliation blocks,
  results tables and figures
- Changes requiring explicit review: claims, numbers, and figures — every
  reported value must be traceable to the experiment that produced it.
