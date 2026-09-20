# Project Agent Instructions

## Scope and Precedence

This file is the repository-level entrypoint for coding agents.

Read `.agents/docs/project.md` before non-trivial work. Repository-specific
commands, constraints, and narrower instructions take precedence over these
template defaults.

## Project Workflow

For non-trivial work, follow:

- `.agents/docs/workflow.md`
- `.agents/docs/testing.md`

For tracked Git work, follow:

- `.agents/docs/issue.md`
- `.agents/docs/branch.md`
- `.agents/docs/commit.md`
- `.agents/docs/pull-request.md`

For published releases, follow:

- `.agents/docs/release.md`

Use project-local skills when installed and applicable. Skill instructions
define their own triggers, formats, and output paths.

This repository holds LaTeX documents, not source code. Testing means the PDF
compiles; review means the claims hold.

## Project Structure & Module Organization

`AQC/` holds the original submission (`main.tex`), the NOLTA style file
(`nolta2025.sty`), the license PDF, and `Fig_MaiDinhCong/`. `paper/ko/` is the
Korean working document and the place where the current formulation, proofs,
and experimental results live; its figures are in `paper/ko/fig/` with English
labels. `report/` is a separate internal report with its own `references.bib`
and figures. A figure is shared by every document that includes it, so check
each one before committing a figure change.

## Editing Rules

`paper/ko/main.tex` leads. When the formulation, a proof, or a number changes,
change it there first. Preserve equation numbers, `\label` names, and citation
keys when translating or restructuring — those are the anchors that keep
versions of the paper comparable. Keep academic terms with their English gloss
in the Korean text, as the existing sections do. Do not edit
`AQC/nolta2025.sty` to make content fit; cut or rewrite instead.

Every reported number and figure must be traceable to the experiment that
produced it. When a result changes, name the experiment and configuration that
produced the new value in the pull request rather than editing the number
alone.

## Build Commands

Build any document with `latexmk -pdfxe main.tex` from its directory. XeLaTeX is
required — the Korean sources use `kotex` and will not compile under pdfLaTeX.
Pushes and pull requests touching `AQC/**` or `paper/ko/**` run the
`Build Korean AQC paper` workflow, which compiles with TeX Live 2026 and
uploads the `aqc-paper-ko` artifact. Build locally before pushing; a broken
`\ref` or a missing figure only surfaces at compile time.

## Committed Output

`paper/ko/main.pdf` and `report/main.pdf` are tracked even though most LaTeX
auxiliaries are ignored. Refresh the committed PDF in the same pull request as a
substantive source change so the readable version does not drift, and keep
auxiliary files (`.aux`, `.log`, `.fls`, `.xdv`, `.bbl`) out of commits —
`.gitignore` already covers them.

## Commit & Pull Request Guidelines

History uses Conventional Commit prefixes with Korean subjects, such as
`docs: 영어판 논문 추가` and
`refactor: 흐름 보존 항 제거 — APSP 최소화 방향화로 주제 일원화`. Branch names
are `<tag>/<slug>`, for example `feat/ko-paper-sections` or
`fix/ko-paper-author-list`. Pull requests should say which sections changed and
confirm that the build workflow passed.
