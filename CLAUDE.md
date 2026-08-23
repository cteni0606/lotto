# lotto (UI) 작업 지침

- 이 저장소는 공개다. 추천 알고리즘·키·운영 문서를 절대 여기에 넣지 말 것 (백엔드는 별도 비공개 저장소)
- index.html이 곧 앱 (luckydaily.co.kr). 데이터·추천·인증은 전부 서버 API 호출
- 브랜치 흐름: dev(작업) → qa(검증) → main(라이브). dev/qa 푸시 시 /dev/·/qa/ 폴더로 자동 발행됨 — 해당 폴더를 직접 수정하지 말 것
- 릴리스는 오너 승인 후 qa→main 머지. index.html의 APP_VERSION을 작업 시작 시 올릴 것
- iOS Safari 호환: var 사용, 변수명 history 금지, setTimeout 콜백 try-catch
- lotto-update.json·scripts/는 주간 자동수집이 관리 — 수동 수정 금지
