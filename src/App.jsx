import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// 🟢 IMPORT CAPACITOR APP ĐỂ XỬ LÝ NÚT BACK
import { App as CapacitorApp } from '@capacitor/app';

import Navbar from './components/Navbar'; 
import AIChatWidget from './components/AIChatWidget';

// Import các trang cũ
import HomePage from './pages/HomePage';
import GradePage from './pages/GradePage';
import ExamPage from './pages/ExamPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HistoryPage from './pages/HistoryPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import PDFViewerPage from './pages/PDFViewerPage';

// 🟢 IMPORT CÁC TRANG QUẢN LÝ LỚP HỌC & CHI TIẾT
import ProfilePage from './pages/ProfilePage';
import ClassroomPage from './pages/ClassroomPage';
import ClassDetailPage from './pages/ClassDetailPage';
import TopicDetailPage from './pages/TopicDetailPage'; 
import ExamResultPage from './pages/ExamResultPage'; 

// 🔥 [MỚI] IMPORT TRANG CHÍNH SÁCH BẢO MẬT (Chỉ định rõ đuôi .jsx)
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx'; 

// --- 1. COMPONENT BẢO VỆ (Private Route) ---
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    return token ? children : <Navigate to="/login" replace />;
};

// --- 2. COMPONENT CÔNG KHAI (Public Route) ---
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    return token ? <Navigate to="/" replace /> : children;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🟢 XỬ LÝ NÚT BACK VẬT LÝ TRÊN ANDROID
  useEffect(() => {
    const setupBackButton = async () => {
        try {
            await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                if (location.pathname === '/' || location.pathname === '/login') {
                    CapacitorApp.exitApp();
                } 
                else {
                    window.history.back();
                }
            });
        } catch (e) {
            console.log("Không phải môi trường Mobile App:", e);
        }
    };
    setupBackButton();

    return () => {
        CapacitorApp.removeAllListeners();
    };
  }, [location.pathname, navigate]);

  const hideComponentsPaths = [
    '/login', 
    '/register', 
    '/forgot-password',
    '/reset-password'
  ];

  const shouldShowComponents = !hideComponentsPaths.includes(location.pathname) && !location.pathname.startsWith('/reset-password');

  return (
    <div className="App" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fff0f5 0%, #e1bee7 100%)',
        backgroundAttachment: 'fixed',
        display: 'flex',       
        flexDirection: 'column'
    }}>

      {shouldShowComponents && <Navbar />} 
      
      <div style={{ flex: 1, width: '100%' }}> 
        <Routes>
          {/* 🔥 [CẬP NHẬT] THAY ĐỔI ĐƯỜNG DẪN MỚI ĐỂ TRÁNH CACHE */}
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />

          {/* Dự phòng cho link cũ (nếu muốn) */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* --- CÁC TRANG CẦN ĐĂNG NHẬP MỚI ĐƯỢC VÀO --- */}
          <Route path="/" element={
              <PrivateRoute>
                  <HomePage />
              </PrivateRoute>
          } />
          
          <Route path="/history" element={
              <PrivateRoute>
                  <HistoryPage />
              </PrivateRoute>
          } />

          <Route path="/history/:id" element={
              <PrivateRoute>
                  <ExamResultPage />
              </PrivateRoute>
          } />

          <Route path="/profile" element={
              <PrivateRoute>
                  <ProfilePage />
              </PrivateRoute>
          } />

          <Route path="/classrooms" element={
              <PrivateRoute>
                  <ClassroomPage />
              </PrivateRoute>
          } />

          <Route path="/classrooms/:id" element={
              <PrivateRoute>
                  <ClassDetailPage />
              </PrivateRoute>
          } />

          <Route path="/topic/:topicId" element={
              <PrivateRoute>
                  <TopicDetailPage />
              </PrivateRoute>
          } />

          <Route path="/grade/:gradeId" element={
              <PrivateRoute>
                  <GradePage />
              </PrivateRoute>
          } />
          
          <Route path="/exams/:id" element={
              <PrivateRoute>
                  <ExamPage />
              </PrivateRoute>
          } />
          <Route path="/exams" element={
              <PrivateRoute>
                  <ExamPage />
              </PrivateRoute>
          } />

          <Route path="/video-player" element={
              <PrivateRoute>
                  <VideoPlayerPage />
              </PrivateRoute>
          } />
          <Route path="/pdf-viewer" element={
              <PrivateRoute>
                  <PDFViewerPage />
              </PrivateRoute>
          } />

          {/* --- CÁC TRANG CÔNG KHAI --- */}
          <Route path="/login" element={
              <PublicRoute>
                  <LoginPage />
              </PublicRoute>
          } />
          <Route path="/register" element={
              <PublicRoute>
                  <RegisterPage />
              </PublicRoute>
          } />
          <Route path="/forgot-password" element={
              <PublicRoute>
                  <ForgotPasswordPage />
              </PublicRoute>
          } />
          
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {shouldShowComponents && <AIChatWidget />}

    </div>
  );
}

export default App;