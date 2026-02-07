import React, { useState, useEffect } from "react";
import axiosClient from "../services/axiosClient"; // Sử dụng axiosClient có sẵn của bạn
import { useNavigate } from "react-router-dom"; 
import { 
    Backdrop, CircularProgress, Typography, Box, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AdMob } from '@capacitor-community/admob';

function HistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  useEffect(() => {
    // Khởi tạo AdMob và nạp dữ liệu ngay khi vào trang
    const initAdMob = async () => {
        try { await AdMob.initialize({ requestTrackingAuthorization: true, initializeForTesting: true }); } 
        catch (e) { console.error("Lỗi AdMob:", e); }
    };
    initAdMob();
    fetchHistory(); 
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    // 🔥 Gọi đúng endpoint đã khai báo trong urls.py qua axiosClient
    axiosClient.get('/my-results/') 
    .then((res) => {
        setResults(res.data);
    })
    .catch((err) => {
        console.error("Lỗi tải lịch sử:", err);
        if (err.response && err.response.status === 401) {
            navigate('/login');
        }
    })
    .finally(() => setLoading(false));
  };

  const handleReviewClick = async (resultId) => {
      setIsLoadingAd(true); 
      try {
          await AdMob.prepareInterstitial({
             adId: 'ca-app-pub-3940256099942544/1033173712', 
             isTesting: true
          });
          await AdMob.showInterstitial();
      } catch (e) {} 
      finally {
          setIsLoadingAd(false); 
          // Điều hướng đúng route /history/:id trong App.jsx
          navigate(`/history/${resultId}`);
      }
  };

  const formatDate = (dateString) => {
    if(!dateString) return "N/A";
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getScoreColor = (score) => {
      if (score >= 8) return 'success'; 
      if (score >= 5) return 'warning'; 
      return 'error'; 
  };

  const styles = {
    pageWrapper: {
        minHeight: '100vh', width: '100%', background: '#f4f6f8',
        padding: '10px', boxSizing: 'border-box',
        paddingTop: 'max(env(safe-area-inset-top), 40px)', paddingBottom: '20px'
    },
    container: {
        maxWidth: '900px', margin: '0 auto', padding: '20px',
        backgroundColor: 'white', borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: '80vh'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}><CircularProgress color="inherit" /></Backdrop>
        <IconButton onClick={() => navigate('/')} sx={{ bgcolor: '#ede7f6', color: '#673ab7', mb: 2 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" sx={{ textAlign: 'center', color: '#4527a0', mb: 3, fontWeight: 'bold' }}>📜 LỊCH SỬ LÀM BÀI</Typography>

        {loading ? (
            <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
        ) : results.length === 0 ? (
            <Box textAlign="center" mt={5}>
                <Typography color="textSecondary">Chưa có dữ liệu bài làm nào.</Typography>
                <Typography onClick={() => navigate('/')} sx={{color: '#673ab7', cursor:'pointer', mt: 1, fontWeight:'bold'}}>Luyện tập ngay!</Typography>
            </Box>
        ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{fontWeight:'bold'}}>Đề thi</TableCell>
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
                                    <Chip label={item.score} color={getScoreColor(item.score)} size="small" sx={{fontWeight:'bold'}} />
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