# 프론트엔드 친구 API 과제

## 로컬 실행

```powershell
cd C:\Users\Zero\zero_frontend2
npm ci
npm start
```

브라우저에서 http://localhost:3000 을 엽니다.
`.env`에 `REACT_APP_KAKAO_REST_API_KEY`가 있어야 하며,
카카오 개발자 설정에 `http://localhost:3000/login/oauth2/code/kakao`가 등록되어 있어야 합니다.
환경변수 파일과 실제 토큰은 Git에 올리지 않습니다.
개발 요청은 package.json의 proxy를 통해 기존 개발 서버로 전달됩니다.

## 연결한 API

| 기능 | 요청 | 응답 위치 |
| --- | --- | --- |
| 카카오 로그인 | POST /api/auth/kakao, { code } | result.accessToken |
| 로그아웃 | POST /api/auth/logout | isSuccess |
| 토큰 재발급 | POST /api/auth/reissue (쿠키 포함) | result 문자열 |
| 팔로잉 목록 | GET /api/follow/followings | result 배열 |
| 닉네임 검색 | GET /api/follow/search?nickname=입력값&page=0&size=10 | result.content 배열 |
| 팔로우 | POST /api/follow, { toUserId } | result 사용자 |
| 언팔로우 | DELETE /api/follow, data: { toUserId } | isSuccess |
| 팔로우 가능 사용자 | GET /api/follow?page=0&size=10 | result.content 배열 |

검색어가 없으면 자동 요청을 하지 않습니다.
'팔로우 가능한 사용자 보기'를 누르면 선택 기능인 사용자 목록을 조회합니다.
검색은 앞뒤 공백 제거, 300ms 대기, 이전 요청 취소, 이전/다음 페이지를 지원합니다.
팔로우와 언팔로우는 성공 응답 후에만 목록을 변경하고 검색 결과를 다시 조회합니다.
실패 시 목록을 유지하고 오류와 재시도 방법을 제공합니다.
공통 friendModel.js가 서버의 userName/introduction을 UI의 name/tag/bio로 변환합니다.

## 검증

```powershell
npm test -- --watchAll=false --runInBand
npm run build
```

자동 테스트: API를 모의 응답으로 대체한 19개 테스트.
로그인 state 검증, 인증 헤더, 재발급 요청 공유·재시도·실패,
로그아웃 이벤트/토큰 삭제, 목록·검색·팔로우·언팔로우의 성공/실패,
잘못된 응답, 중복 클릭, 페이지 이동, 늦은 검색 응답 무시를 확인합니다.
모의 테스트 통과는 실제 서버에서의 성공을 뜻하지 않습니다.

### 실제 계정으로 확인할 항목

1. 로그인 후 Network의 kakao 성공 응답과 홈 이동 확인.
2. 친구 화면에서 followings 성공 및 실제 사용자 표시 확인.
3. 실제 닉네임 검색 후 search의 nickname/page/size 및 result.content 확인.
4. 팔로우 클릭 후 POST 본문 toUserId, 왼쪽 목록 갱신, 새로고침 후 관계 유지 확인.
5. 언팔로우 모달 취소 시 관계 유지, 확인 시 DELETE 본문과 목록 제거 확인.
6. 같은 닉네임으로 다시 검색하여 언팔로우한 사용자를 다시 팔로우할 수 있는지 확인.
7. 로그아웃 후 로그인 화면 이동, 인증 정보 삭제 확인.

2026-11-03 조회한 개발 서버 /v3/api-docs에는 /api/follow/search가 노출되지 않았습니다.
프론트엔드는 제공된 과제 안내의 정확한 경로·파라미터·응답 구조를 사용합니다.
검색이 404/400이면 운영진에게 검색 API 배포 여부를 확인해야 합니다.
로그인한 실제 계정의 전체 서버 흐름은 자동 테스트에서 검증하지 않았습니다.
친구 상세 페이지의 캘린더·투두 API는 이번 연결 과제의 범위에 포함하지 않았습니다.

## 참고 자료

- 세션: https://app.notion.com/p/API-408e2a6ef56380838beceb5bba7a08a7
- 과제: https://app.notion.com/p/API-409e2a6ef563802eadace7150ebed004

제출 브랜치: friend-page-api-assignment
배포와 머지는 수행하지 않습니다.
