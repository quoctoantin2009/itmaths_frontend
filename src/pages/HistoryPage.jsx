import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import { 
    Backdrop, CircularProgress, Typography, Box, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';

// IMPORT ADMOB
import { AdMob } from '@capacitor-community/admob';

const API_BASE_URL = "http://127.0.0.1:8000/api";

function HistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  useEffect(() => {
    const initAdMob = async () => {
        try { await AdMob.initialize({ requestTrackingAuthorization: true, initializeForTesting: true }); } 
        catch (e) { console.error("Lỗi Init AdMob:", e); }
    };
    initAdMob();
  }, []);

  const fetchHistory = () => {
    const token = localStorage.getItem("accessToken");
    
    // Nếu không có token thì đá về login ngay
    if (!token) {
        navigate('/login');
        return;
    }

    setLoading(true);
    axios.get(`${API_BASE_URL}/api/my-results/`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
        setResults(res.data);
        setLoading(false);
    })
    .catch((err) => {
        console.error("Lỗi tải lịch sử:", err);
        setLoading(false);

        // XỬ LÝ KHI TOKEN HẾT HẠN HOẶC LỖI
        if (err.response && err.response.status === 401) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem('accessToken'); // Xóa token hỏng
            localStorage.removeItem('refreshToken');
            navigate('/login'); // Chuyển về trang đăng nhập
        }
    });
  };

  // Gọi hàm fetchHistory mỗi khi vào trang (Mount)
  useEffect(() => {
    fetchHistory();

    const handleExamSubmitted = () => {
        console.log("♻️ Phát hiện bài thi mới -> Đang cập nhật lịch sử...");
        setTimeout(() => { fetchHistory(); }, 1500);
    };
    window.addEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted);
    return () => { window.removeEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted); };
  }, []);

  const handleReviewClick = async (resultId) => {
      setIsLoadingAd(true); 
      try {
          await AdMob.prepareInterstitial({
             adId: 'ca-app-pub-3940256099942544/1033173712', 
             isTesting: true
          });
          await AdMob.showInterstitial();
      } catch (e) { console.error("Lỗi QC:", e); } 
      finally {
          setIsLoadingAd(false); 
          navigate(`/review/${resultId}`);
      }
  };

  const formatDate = (dateString) => {
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
        minHeight: '100vh', width: '100%',
        background: '#f4f6f8',
        padding: '10px', boxSizing: 'border-box',
        fontFamily: "'Segoe UI', sans-serif",
        
        // 🟢 [SỬA LỖI] Đẩy nội dung xuống để tránh Tai thỏ / Status Bar
        paddingTop: 'max(env(safe-area-inset-top), 40px)', 
        paddingBottom: '20px'
    },
    container: {
        maxWidth: '900px', margin: '0 auto', padding: '20px',
        backgroundColor: 'white', borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: '80vh',
        position: 'relative'
    },
    title: {
        textAlign: 'center', color: '#4527a0', marginBottom: '20px',
        fontWeight: 'bold', textTransform: 'uppercase', marginTop: '10px'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}>
            <Box textAlign="center">
                <CircularProgress color="inherit" />
                <Typography sx={{mt: 2, fontWeight: 'bold'}}>Đang tải lại bài làm...</Typography>
            </Box>
        </Backdrop>

        <Box display="flex" alignItems="center">
            <IconButton 
                onClick={() => navigate('/')} 
                sx={{ 
                    bgcolor: '#ede7f6', color: '#673ab7', 
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: '#d1c4e9' }
                }}
            >
                <ArrowBackIcon />
            </IconButton>
        </Box>
        
        <Typography variant="h5" style={styles.title}>📜 Lịch Sử Làm Bài</Typography>

        {loading && <p style={{textAlign:'center', color:'#666'}}>⏳ Đang tải dữ liệu...</p>}

        {!loading && results.length === 0 ? (
            <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>
                <p style={{fontSize: '18px'}}>Bạn chưa làm bài thi nào cả.</p>
                <Typography onClick={() => navigate('/')} sx={{color: '#673ab7', fontWeight: 'bold', cursor:'pointer'}}>
                    Làm bài ngay!
                </Typography>
            </div>
        ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
                <Table>
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
                                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                        {item.exam_title || "Đề thi không tên"}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {formatDate(item.completed_at)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={item.score} 
                                        color={getScoreColor(item.score)} 
                                        size="small" 
                                        sx={{fontWeight:'bold', minWidth: '40px'}}
                                    />
                                    <Typography variant="caption" display="block" mt={0.5}>
                                        {item.correct_answers}/{item.total_questions} câu
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleReviewClick(item.id)}
                                        sx={{bgcolor: '#e3f2fd', '&:hover':{bgcolor:'#bbdefb'}}}
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