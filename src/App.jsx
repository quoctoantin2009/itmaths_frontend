import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// 🟢 IMPORT CAPACITOR APP VÀ CORE
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// 🟢 IMPORT AXIOS ĐỂ GỌI API BACKEND VÀ CÁC COMPONENT MUI
import axiosClient from './services/axiosClient';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

import Navbar from './components/Navbar'; 
import AIChatWidget from './components/AIChatWidget';
import PublicResourcesPage from './pages/PublicResourcesPage';
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

// 🟢 [MỚI] IMPORT CÁC TRANG ĐẤU TRƯỜNG KAHOOT CLONE
import ArenaEntry from './pages/ArenaEntry';
import ArenaHost from './pages/ArenaHost';
import ArenaPlayer from './pages/ArenaPlayer';

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

  // 🟢 STATE CHO POPUP ÉP CẬP NHẬT
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

  // 🟢 KIỂM TRA PHIÊN BẢN TỪ BACKEND CỦA BẠN (ÉP CẬP NHẬT TỨC THÌ)
  useEffect(() => {
      const checkVersionFromServer = async () => {
          if (Capacitor.isNativePlatform()) {
              try {
                  // 1. Lấy thông tin ứng dụng đang chạy trong máy (versionCode)
                  const appInfo = await CapacitorApp.getInfo();
                  // build chính là versionCode trên Android
                  const currentVersionCode = parseInt(appInfo.build, 10); 

                  // 2. Gọi API lên Django hỏi bản mới nhất
                  const response = await axiosClient.get('/check-app-version/'); 
                  const { latest_version_code, force_update, store_url } = response.data;

                  // 3. So sánh: Nếu bản trong máy nhỏ hơn bản Server -> Hiện bảng ép cập nhật!
                  if (latest_version_code > currentVersionCode && force_update) {
                      setStoreUrl(store_url);
                      setShowForceUpdate(true); 
                  }
              } catch (e) {
                  console.error("Lỗi kiểm tra phiên bản từ Server:", e);
              }
          }
      };

      checkVersionFromServer();
  }, []);

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

  // 🟢 [CẬP NHẬT] Ẩn Navbar và Chatbot nếu đang ở trong Đấu trường (Để màn hình rộng như Kahoot)
  const shouldShowComponents = 
    !hideComponentsPaths.includes(location.pathname) && 
    !location.pathname.startsWith('/reset-password') &&
    !location.pathname.startsWith('/arena');

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
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* --- CÁC TRANG CẦN ĐĂNG NHẬP MỚI ĐƯỢC VÀO --- */}
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/history/:id" element={<PrivateRoute><ExamResultPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/classrooms" element={<PrivateRoute><ClassroomPage /></PrivateRoute>} />
          <Route path="/classrooms/:id" element={<PrivateRoute><ClassDetailPage /></PrivateRoute>} />
          <Route path="/topic/:topicId" element={<PrivateRoute><TopicDetailPage /></PrivateRoute>} />
          <Route path="/grade/:gradeId" element={<PrivateRoute><GradePage /></PrivateRoute>} />
          <Route path="/exams/:id" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
          <Route path="/exams" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
          <Route path="/video-player" element={<PrivateRoute><VideoPlayerPage /></PrivateRoute>} />
          <Route path="/pdf-viewer" element={<PrivateRoute><PDFViewerPage /></PrivateRoute>} />

          {/* 🟢 NHÓM ROUTE ĐẤU TRƯỜNG (MỚI) */}
          <Route path="/arena" element={<PrivateRoute><ArenaEntry /></PrivateRoute>} />
          <Route path="/arena/host/:pin" element={<PrivateRoute><ArenaHost /></PrivateRoute>} />
          <Route path="/arena/play/:pin" element={<PrivateRoute><ArenaPlayer /></PrivateRoute>} />

          {/* --- CÁC TRANG CÔNG KHAI --- */}
          <Route path="/tai-nguyen" element={<PublicResourcesPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {shouldShowComponents && <AIChatWidget />}

      {/* 🔥 GIAO DIỆN POPUP BẮT BUỘC CẬP NHẬT */}
      <Dialog 
        open={showForceUpdate} 
        disableEscapeKeyDown 
        sx={{ '& .MuiDialog-paper': { borderRadius: '15px', p: 1 } }}
      >
          <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem' }}>
              🚀 CẬP NHẬT QUAN TRỌNG
          </DialogTitle>
          <DialogContent>
              <DialogContentText sx={{ textAlign: 'center', color: '#333', fontSize: '1.1rem' }}>
                  Đã có phiên bản mới của <b>ITMaths</b> với nhiều đề thi và tính năng hấp dẫn hơn. 
                  Vui lòng cập nhật ngay để không bị gián đoạn việc học nhé!
              </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button 
                  variant="contained" 
                  color="error" 
                  size="large"
                  onClick={() => window.open(storeUrl, '_system')} 
                  sx={{ borderRadius: '30px', px: 4, py: 1.5, fontWeight: 'bold' }}
              >
                  CẬP NHẬT NGAY
              </Button>
          </DialogActions>
      </Dialog>

    </div>
  );
}

export default App;