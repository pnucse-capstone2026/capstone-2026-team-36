# 대사별 녹음 (로컬 전용)

소개 영상의 대사 43개를 하나씩 녹음하고, 틀린 대사만 다시 녹음한 뒤 한 파일로
합쳐 내려받는 페이지다. GitHub Pages 에는 올리지 않는다.

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory video
```

그다음 Chrome 에서 <http://127.0.0.1:8765/record/> 를 연다. `video/` 폴더 전체를
한 서버로 띄워야 발표 화면(`introduction/`)을 같은 origin 으로 불러온다.

- Space: 현재 대사 녹음 시작·정지. 녹음이 시작되면 위 발표 화면이 그 대사
  장면을 처음부터 다시 재생한다.
- ← →: 대사 이동, P: 방금 녹음한 것 다시 듣기, 삭제: 그 대사 녹음본만 삭제.
- 목록의 초록 숫자는 녹음 길이, 주황은 영상 구간보다 긴 경우다. 대사를 고친
  뒤에는 "대사 바뀜" 으로 표시된다.
- 저장할 때 녹음 앞뒤 0.3초(녹음을 켜고 끈 키·마우스 소리)와 그 바깥의 조용한
  부분을 잘라낸다. 이 기능이 생기기 전에 녹음한 것은 "예전 녹음본 앞뒤 다듬기"
  버튼으로 한 번에 다듬는다. 이미 다듬은 것은 다시 자르지 않는다.
- "마이크 잡음 억제" 를 켜면 Chrome 이 마이크 입력에서 배경 잡음을 줄이고 음량을
  고르게 한다(기본 켜짐). 이 설정은 켠 뒤에 새로 녹음하는 것부터 적용된다.
- 녹음본은 이 브라우저의 IndexedDB 에 남는다. 다른 브라우저나 시크릿 창에서는
  보이지 않는다.

내려받기 다섯 가지:

- 시간표 위치에 합친 wav: 각 클립을 영상 구간 시작 시각에 놓는다. 구간보다 긴
  클립은 다음 클립과 겹친다.
- 겹치지 않게 밀어서 합친 wav: 앞 클립이 끝나지 않았으면 0.25초 뒤로 민다.
  밀린 시작 시각을 `narration-pushed-starts.json` 으로 같이 내려받는다.
- 대사별 파일 전부: `cue-01.wav` … 형식으로 클립을 하나씩 내려받는다.
- 동영상 · 녹음 길이에 맞춰: Chrome 이 이 탭을 캡처하는 동안 대사마다 그
  장면을 띄우고 녹음본을 재생한 뒤, 녹음이 끝나면 0.5초 뒤에 다음 대사로
  넘어간다. 녹음본이 없는 대사는 영상 구간 길이만큼 보여 준다. 장면 애니메이션은
  원래 구간이 끝나면 마지막 모습에서 멈춰 있는다.
  `quantum-guardian-introduction.webm` 을 내려받는다.
- 동영상 · 영상 시간표대로: 영상을 원래 시간표로 재생하고 "시간표 위치에 합친"
  나레이션을 소리로 넣는다. 구간보다 긴 녹음은 다음 대사와 겹친다.
  `quantum-guardian-introduction-fixed.webm` 을 내려받는다.

두 방식 모두 화면 선택 창이 뜨면 이 탭을 고르고, 영상 길이만큼 기다린다.
녹화 중에는 다른 창을 위에 띄우지 말고 탭을 바꾸지 않는다.

이미 녹음한 것이나 합친 파일의 화이트 노이즈를 줄이려면 ffmpeg 의 FFT 잡음
제거 필터를 쓴다. `nf` 는 잡음 바닥(dB)이고, 잡음이 남으면 -20, 목소리가 뭉개지면
-30 쪽으로 조절한다. `highpass` 는 80 Hz 아래의 웅웅거림을 없앤다.

```powershell
# 합친 wav
ffmpeg -i narration-fixed.wav -af "highpass=f=80,afftdn=nf=-25" narration-clean.wav
# 내보낸 동영상의 소리만 정리 (화면은 그대로)
ffmpeg -i quantum-guardian-introduction.webm -c:v copy -af "highpass=f=80,afftdn=nf=-25" -c:a libopus quantum-guardian-introduction-clean.webm
```

mp4 가 필요하면:

```powershell
ffmpeg -i quantum-guardian-introduction.webm -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac quantum-guardian-introduction.mp4
```
