import React, { useState, useEffect } from "react";
import axiosClient from "../services/axiosClient"; // Dùng axiosClient cho chuẩn
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

  // 1. Khởi tạo AdMob
  useEffect(() => {
    const initAdMob = async () => {
        try { 
            await AdMob.initialize({ requestTrackingAuthorization: true, initializeForTesting: true }); 
        } catch (e) { 
            console.error("Lỗi Init AdMob:", e); 
        }
    };
    initAdMob();
  }, []);

  // 2. Hàm lấy dữ liệu lịch sử từ API
  const fetchHistory = () => {
    setLoading(true);
    // 🔥 Sử dụng đường dẫn đã khớp với backend urls.py
    axiosClient.get('/my-results/') 
    .then((res) => {
        setResults(res.data);
    })
    .catch((err) => {
        console.error("Lỗi tải lịch sử:", err);
        // Nếu lỗi 401 (hết hạn đăng nhập), điều hướng về trang login
        if (err.response && err.response.status === 401) {
            navigate('/login');
        }
    })
    .finally(() => setLoading(false));
  };

  // 3. Gọi nạp dữ liệu ngay khi vào trang
  useEffect(() => {
    fetchHistory();
  }, []);

  // 4. Xử lý xem chi tiết bài làm kèm quảng cáo Interstitial
  const handleReviewClick = async (resultId) => {
      setIsLoadingAd(true); 
      try {
          // Chuẩn bị và hiển thị quảng cáo
          await AdMob.prepareInterstitial({
             adId: 'ca-app-pub-3940256099942544/1033173712', 
             isTesting: true
          });
          await AdMob.showInterstitial();
      } catch (e) { 
          console.error("Lỗi quảng cáo hoặc môi trường không hỗ trợ:", e); 
      } finally {
          setIsLoadingAd(false); 
          // ✅ ĐẢM BẢO CHUYỂN ĐÚNG ROUTE ĐÃ KHAI BÁO TRONG APP.JSX
          navigate(`/history/${resultId}`); 
      }
  };

  // 5. Định dạng ngày tháng hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ thời gian";
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // 6. Màu sắc cho Chip điểm số
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
        
        {/* Backdrop hiển thị khi đang tải quảng cáo/dữ liệu */}
        <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}>
            <Box textAlign="center">
                <CircularProgress color="inherit" />
                <Typography sx={{mt: 2, fontWeight: 'bold'}}>Đang tải bài làm...</Typography>
            </Box>
        </Backdrop>

        <IconButton onClick={() => navigate('/')} sx={{ bgcolor: '#ede7f6', color: '#673ab7', mb: 2 }}>
            <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h5" sx={{ textAlign: 'center', color: '#4527a0', mb: 3, fontWeight: 'bold', textTransform: 'uppercase' }}>
            📜 LỊCH SỬ ÔN LUYỆN
        </Typography>

        {loading ? (
            <Box textAlign="center" mt={5}>
                <CircularProgress />
                <Typography sx={{ mt: 2, color: '#666' }}>Đang tìm bài làm của bạn...</Typography>
            </Box>
        ) : results.length === 0 ? (
            <Box textAlign="center" mt={5}>
                <Typography color="textSecondary" variant="h6">Bạn chưa hoàn thành bài thi nào.</Typography>
                <Button variant="text" onClick={() => navigate('/')} sx={{ mt: 1, fontWeight: 'bold' }}>Bắt đầu luyện tập ngay!</Button>
            </Box>
        ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #eee' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tên đề thi</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Điểm</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Xem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((item) => (
                            <TableRow key={item.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                        {item.exam_title || "Đề luyện tập"}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {formatDate(item.completed_at || item.created_at)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={item.score} 
                                        color={getScoreColor(item.score)} 
                                        size="small" 
                                        sx={{ fontWeight: 'bold', minWidth: '40px' }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        onClick={() => handleReviewClick(item.id)} 
                                        color="primary"
                                        sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
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