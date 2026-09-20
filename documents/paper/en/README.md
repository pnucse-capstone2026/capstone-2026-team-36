# AQC Paper (English)

English version of the AQC paper. Sections 1–2 reuse the original English text of
[`../../AQC/main.tex`](../../AQC/main.tex); Sections 3–5 are translated from the
Korean working document [`../ko/main.tex`](../ko/main.tex), which is where the
current formulation, proofs, and experimental results live.

The built document is available at [main.pdf](main.pdf).

## Build

Run in a TeX Live environment.

```sh
latexmk -pdfxe main.tex
```

The NOLTA style file and the bibliography are referenced from the original
directory (`../../AQC/`), and the figures are shared with the Korean version
(`../ko/fig/`) because their labels are already in English.

When `AQC/**`, `paper/ko/**`, or `paper/en/**` changes, the `Build English AQC
paper` GitHub Actions workflow verifies the PDF and uploads it as the
`aqc-paper-en` artifact, downloadable from **Artifacts** on the Actions run page.
