# AQC 논문 한국어 번역본

[`../../AQC/main.tex`](../../AQC/main.tex)의 현재 활성 문서(첫 번째 `\\end{document}`까지)를 한국어로 번역한 LaTeX 문서다. 수식, 인용 키, 레이블과 원문의 미완성 구간을 유지했다.

빌드된 문서는 [main.pdf](main.pdf)에서 바로 볼 수 있다. 영어판은 [`../en`](../en)에 있다.

## 빌드

TeX Live의 한국어 지원 패키지가 설치된 환경에서 실행한다.

```sh
latexmk -pdfxe main.tex
```

NOLTA 스타일 파일과 참고문헌은 원문 디렉터리의 파일을 참조한다.

`AQC/**` 또는 `paper/ko/**`가 바뀌면 `Build Korean AQC paper` GitHub Actions workflow가 PDF를 검증하고 `aqc-paper-ko` artifact로 올린다. Actions 실행 화면의 **Artifacts**에서 내려받을 수 있다.
