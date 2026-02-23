import React, { useState, useEffect } from "react";
import axiosClient from "../services/axiosClient"; 
import { useNavigate } from "react-router-dom"; 
import { 
    Backdrop, CircularProgress, Typography, Box, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AdMob } from '@capacitor-community/admob';
// 🔥 THÊM IMPORT CAPACITOR CORE
import { Capacitor } from '@capacitor/core';

function HistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  // 🔥 CẬP NHẬT 1: CHỈ KHỞI TẠO ADMOB TRÊN APP NATIVE
  useEffect(() => {
    const initAdMob = async () => {
        if (Capacitor.isNativePlatform()) {
            try { await AdMob.initialize({ requestTrackingAuthorization: true }); } catch (e) { console.error("Lỗi Init AdMob:", e); }
        }
    };
    initAdMob();
    fetchHistory(); 
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    axiosClient.get('/history/') 
    .then((res) => {
        setResults(res.data);
    })
    .catch((err) => {
        console.error("Lỗi tải lịch sử:", err);
        if (err.response?.status === 401) navigate('/login');
    })
    .finally(() => setLoading(false));
  };

  // 🔥 CẬP NHẬT 2: TÁCH LOGIC QUẢNG CÁO
  const handleReviewClick = async (resultId) => {
      if (Capacitor.isNativePlatform()) {
          // Nền tảng App: Bật loading, chờ hiện quảng cáo AdMob rồi mới chuyển trang
          setIsLoadingAd(true); 
          try {
              await AdMob.prepareInterstitial({ adId: 'ca-app-pub-3940256099942544/1033173712', isTesting: true });
              await AdMob.showInterstitial();
          } catch (e) {
              console.error("Lỗi show quảng cáo:", e);
          } finally {
              setIsLoadingAd(false); 
              navigate(`/history/${resultId}`);
          }
      } else {
          // Nền tảng Web: Chuyển thẳng tới trang chi tiết luôn, không bị xoay loading chặn lại
          navigate(`/history/${resultId}`);
      }
  };

  const formatDate = (dateString) => {
    if(!dateString) return "---";
    return new Date(dateString).toLocaleDateString('vi-VN', { 
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#f4f6f8', padding: '10px', boxSizing: 'border-box', paddingTop: 'max(env(safe-area-inset-top), 40px)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: '80vh' }}>
        
        <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}><CircularProgress color="inherit" /></Backdrop>
        <IconButton onClick={() => navigate('/')} sx={{ bgcolor: '#ede7f6', color: '#673ab7', mb: 2 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" sx={{ textAlign: 'center', color: '#4527a0', mb: 3, fontWeight: 'bold' }}>📜 LỊCH SỬ LÀM BÀI</Typography>

        {loading ? (
            <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
        ) : results.length === 0 ? (
            <Box textAlign="center" mt={5}><Typography color="textSecondary">Chưa có bài làm nào.</Typography></Box>
        ) : (
            <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{fontWeight:'bold'}}>Tên đề thi</TableCell>
                            <TableCell align="center" sx={{fontWeight:'bold'}}>Điểm</TableCell>
                            <TableCell align="center" sx={{fontWeight:'bold'}}>Xem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((item) => (
                            <TableRow key={item.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary">{item.exam_title}</Typography>
                                    <Typography variant="caption" color="textSecondary">{formatDate(item.created_at)}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label={item.score} color={item.score >= 5 ? 'success' : 'error'} size="small" sx={{fontWeight:'bold'}} />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleReviewClick(item.id)} sx={{bgcolor: '#e3f2fd'}}><VisibilityIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;