# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Todo 및 카카오 로그인 환경 설정

### 로컬

`npm ci`와 `npm start`를 실행합니다. 프론트의 `.env.local`에
`REACT_APP_KAKAO_REST_API_KEY`를 설정합니다. 로컬 Spring API에 연결하려면
같은 파일에 `REACT_APP_API_URL=http://localhost:8080`을 설정합니다.
생략하면 CRA가 `package.json`에 지정된 개발 API로 상대 경로 요청을 프록시합니다.

로컬 Spring 실행 환경에는 아래 값을 사용합니다. 카카오 Developers의
REST API 키 설정에도 동일한 콜백 URI를 등록합니다.

```dotenv
KAKAO_REDIRECT_URI=http://localhost:3000/login/oauth2/code/kakao
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=Lax
```

### Netlify

1. GitHub 프론트 저장소를 Netlify에 연결합니다. `netlify.toml`이 빌드,
   React 경로 새로고침, 동일 출처의 `/api/*` 프록시를 설정합니다.
2. Netlify의 Builds 범위에 `REACT_APP_KAKAO_REST_API_KEY`를 설정합니다.
   Functions 범위에는 TLS가 활성화된 Spring 서버의 출처를
   `LTE_API_ORIGIN=https://<백엔드-호스트>`로 설정합니다.
   로그인 요청과 인증 쿠키는 이 HTTPS 연결을 통해 전달됩니다.
3. 카카오 Developers에서 Netlify 사이트 출처를 웹 도메인으로,
   아래의 전체 콜백 URI를 REST API 키의 리디렉션 URI로 등록합니다.
4. 백엔드 GitHub Actions의 기존 `LTE_ENV`에서 아래 항목을 수정하고,
   Elastic Beanstalk 배포 워크플로를 다시 실행합니다.

```dotenv
KAKAO_REDIRECT_URI=https://<Netlify-사이트>/login/oauth2/code/kakao
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=None
```

5. Netlify 배포 후 카카오 로그인과 새로고침, Todo 생성·상세·수정·삭제,
   완료 토글에 따른 캘린더 변경을 확인합니다. 루틴은 저장 후 상세를 다시 열어
   기간·요일을 확인하고, 반복 날짜 중 하나를 삭제해 다른 날짜가 유지되는지 확인합니다.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
