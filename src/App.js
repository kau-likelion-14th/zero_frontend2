import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage/MainPage';
import {Routes, Route} from 'react-router-dom';


function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>

      <Footer /> {/* 👈 이거 추가 */}
    </div>
  );
}

export default App;

