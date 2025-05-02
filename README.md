### 🐣branch 

- main ← dev ← feat or fix
- `feat/이름-featureName`
    - `feat/minho-Nav`
- bug fix: `fix/이름-내용`
- merge 이후 브랜치 삭제하기

<hr>

### 🐣commit 규칙

```
git commit -m "feat: commit message #이슈번호"
// e.g) feat: Auth context 훅 생성(#3)
```
```
// 주요
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서(주석) 수정
style: 레이아웃, 코드 스타일 등 수정
refact: 리팩토링 ex) 변수 이름 변경
design: 빌드 부분 혹은 패키지 매니저 수정사항
test : 테스트
release : 버전 릴리즈
merge: 병합

// 그 외
add: feat 이외의 부수적인 코드, 라이브러리 등을 추가한 경우
새로운 파일(Component나 Activity 등)을 생성한 경우도 포함

remove: 코드, 파일을 삭제한 경우, 필요 없는 주석 삭제도 포함

move: fix, refactor 등과 관계 없이 코드, 파일 등의 위치를 이동하는 작업만 수행한 경우

comment: 필요한 주석을 추가, 수정한 경우(❗필요 없는 주석을 삭제한 경우는 remove)

rename: 파일명 수정
```
<hr>

### 🐣 approve / merge

- 2명 이상 approve시 merge
- merge는 당사자가 직접!
- 디스코드 연결
- merge 후
    - PR merge 알림(디스코드 팀 봇)이 오면, 충돌을 방지하기 위해 fetch 또는 pull 해주세요!
    - 이후 PR을 올리는 팀원은 메인을 pull 했는지 확인 후 컨플릭트 해결하고 PR 요청합니다.
    - Merge된 브랜치는 삭제합니다.

<hr>

<br>

### Create Issue
![image](https://github.com/user-attachments/assets/f9702a6e-5e91-4f4e-8ff4-3449e7b6bd6c)