import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage/MainPage';
import LoginPage from './pages/LoginPage/Loginpage';
import FriendPage from './pages/FriendPage/FriendPage';
import ProtectedRoute from './routes/ProtectRoute';
import FriendDetailPage from './pages/FriendPage/FriendDetailPage';
import MyPage from './pages/MyPage/MyPage';
import { Routes, Route, useLocation } from 'react-router-dom';

// 최상위 컴포넌트 - index.js에서 BrowserRouter로 감싸서 렌더링됨
// URL에 따라 Routes가 해당 페이지 보여줌
function App() {
  const location = useLocation();   // 지금 URL 정보 (예: pathname = "/login")

  // 로그인 페이지면 Header/Footer 숨김
  const isLoginPage = 
    location.pathname === '/login' ||
    location.pathname === '/login/oauth2/code/kakao';

  return (
    <div>
      {/* 로그인 페이지 아닐 때만 Header */}
      {!isLoginPage && <Header />}

      {/* URL 경로별로 페이지 매칭
          /            → 메인
          /login       → 로그인
          /friends     → 친구 목록
          /friends/:id → 친구 상세 (id는 동적, FriendList에서 navigate로 들어옴)
          /mypage      → 마이페이지 */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/oauth2/code/kakao" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/friends" element={<FriendPage />} />
          <Route path="/friends/:id" element={<FriendDetailPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>

      {/* 로그인 페이지 아닐 때만 Footer */}
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;