import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogContent, Button, Typography, Box, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, 
    Chip, CircularProgress, AppBar, Toolbar, Slide, Backdrop
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import QuestionCard from './QuestionCard'; 

// 🟢 [IMPORT] THƯ VIỆN QUẢNG CÁO
import { AdMob } from '@capacitor-community/admob';

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP (Đã cập nhật về link chính thức)
const API_BASE_URL = "https://api.itmaths.vn/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};

export default function ExamHistoryDialog({ customId }) {
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState([]);
    
    // Loading thông thường
    const [loading, setLoading] = useState(false);
    
    // 🟢 Loading khi tải quảng cáo
    const [isLoadingAd, setIsLoadingAd] = useState(false);

    // State cho phần chi tiết
    const [viewMode, setViewMode] = useState('list'); 
    const [detailQuestions, setDetailQuestions] = useState([]);
    const [detailUserAnswers, setDetailUserAnswers] = useState({});
    const [detailExamTitle, setDetailExamTitle] = useState("");

    const getAuthHeader = () => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // 🟢 1. KHỞI TẠO ADMOB
    useEffect(() => {
        const initAdMob = async () => {
            try {
                await AdMob.initialize({ requestTrackingAuthorization: true, initializeForTesting: true });
            } catch (e) { console.error("Lỗi Init AdMob History:", e); }
        };
        initAdMob();
    }, []);

    // Tải danh sách lịch sử
    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/history/`, {
                headers: getAuthHeader()
            });
            setHistory(res.data);
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
        }
    };

    // Lắng nghe sự kiện nộp bài để tự cập nhật
    useEffect(() => {
        const handleExamSubmitted = () => {
            console.log("♻️ Dialog phát hiện bài mới -> Đang tải lại lịch sử...");
            setTimeout(() => {
                fetchHistory(); 
            }, 1500); 
        };

        window.addEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted);
        return () => {
            window.removeEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted);
        };
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setViewMode('list'); 
        fetchHistory(); 
    };

    // 🟢 2. XỬ LÝ XEM CHI TIẾT (CÓ QUẢNG CÁO)
    const handleViewDetail = async (resultId, examId, examTitle) => {
        // Bật màn hình chờ loading quảng cáo
        setIsLoadingAd(true);

        try {
            // A. Tải & Hiện Quảng Cáo
            await AdMob.prepareInterstitial({
                adId: 'ca-app-pub-3940256099942544/1033173712', // ID Test
                isTesting: true
            });
            await AdMob.showInterstitial();
        } catch (e) {
            console.error("Lỗi QC History:", e);
            // Lỗi quảng cáo vẫn cho đi tiếp
        }

        // B. Sau khi tắt quảng cáo (hoặc lỗi) -> Mới tải dữ liệu
        setLoading(true); // Loading nội bộ của box chi tiết
        setIsLoadingAd(false); // Tắt màn hình chờ toàn cục

        try {
            // Lấy chi tiết bài làm
            const resResult = await axios.get(`${API_BASE_URL}/api/history/${resultId}/`, {
                headers: getAuthHeader()
            });
            
            let userAns = resResult.data.detail_answers;
            if (typeof userAns === 'string') {
                try { userAns = JSON.parse(userAns); } catch(e) {}
            }
            setDetailUserAnswers(userAns || {});

            // Lấy nội dung câu hỏi
            const resQuestions = await axios.get(`${API_BASE_URL}/api/exams/${examId}/questions/`);
            
            setDetailQuestions(resQuestions.data);
            setDetailExamTitle(examTitle);
            
            setViewMode('detail'); 
        } catch (error) {
            console.error(error);
            alert("Không thể tải chi tiết bài làm.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setDetailQuestions([]);
        setDetailUserAnswers({});
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử làm bài không?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/history/`, { headers: getAuthHeader() });
            setHistory([]);
        } catch (error) { alert("Lỗi khi xóa lịch sử"); }
    };

    return (
        <>
            <Button 
                id={customId}
                variant="outlined" 
                startIcon={<HistoryIcon />} 
                onClick={handleOpen}
                sx={{ mr: 1, textTransform: 'none', borderRadius: 2 }}
            >
                Lịch sử
            </Button>

            <Dialog 
                open={open} 
                onClose={() => setOpen(false)} 
                fullScreen 
                TransitionComponent={Transition}
            >
                {/* 🟢 Màn hình đen xoay vòng khi tải Quảng Cáo */}
                <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}>
                    <Box textAlign="center">
                        <CircularProgress color="inherit" />
                        <Typography sx={{mt: 2, fontWeight: 'bold'}}>Đang tải dữ liệu bài làm...</Typography>
                    </Box>
                </Backdrop>

                <AppBar 
                    sx={{ 
                        position: 'relative', 
                        bgcolor: viewMode === 'list' ? '#673ab7' : '#4527a0',
                        paddingTop: 'env(safe-area-inset-top)', 
                        height: 'auto' 
                    }}
                >
                    <Toolbar sx={{ minHeight: '64px' }}> 
                        {viewMode === 'detail' ? (
                            <IconButton edge="start" color="inherit" onClick={handleBackToList} aria-label="close">
                                <ArrowBackIcon />
                            </IconButton>
                        ) : (
                            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                        )}
                        
                        <Typography sx={{ ml: 2, flex: 1, fontSize: '1.1rem', fontWeight: 'bold' }} variant="h6" component="div">
                            {viewMode === 'list' ? '📜 Lịch sử ôn luyện' : `Chi tiết: ${detailExamTitle}`}
                        </Typography>

                        {viewMode === 'list' && history.length > 0 && (
                            <Button autoFocus color="inherit" onClick={handleClearHistory} startIcon={<DeleteSweepIcon />}>
                                Xóa
                            </Button>
                        )}
                    </Toolbar>
                </AppBar>

                <DialogContent sx={{ bgcolor: '#f5f5f5', p: viewMode === 'detail' ? 0 : 2, paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    {viewMode === 'list' && (
                        <>
                            {history.length === 0 ? (
                                <Box textAlign="center" py={10}>
                                    <Typography color="textSecondary" variant="h6">Chưa có dữ liệu bài làm nào.</Typography>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, mt: 1 }}>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#eeeeee' }}>
                                            <TableRow>
                                                <TableCell><b>Tên đề</b></TableCell>
                                                <TableCell align="center"><b>Điểm</b></TableCell>
                                                <TableCell align="center"><b>KQ</b></TableCell>
                                                <TableCell align="center"><b>Xem</b></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {history.map((item) => (
                                                <TableRow 
                                                    key={item.id} 
                                                    hover 
                                                    // 🟢 Bấm vào dòng cũng hiện quảng cáo
                                                    onClick={() => handleViewDetail(item.id, item.exam, item.exam_title)}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell sx={{fontWeight:'bold', color: '#3f51b5', fontSize:'0.95rem'}}>
                                                        {item.exam_title || "Bài tập"}
                                                        <br/>
                                                        <span style={{fontSize:'0.75rem', color:'#666', fontWeight:'normal'}}>{formatDate(item.created_at)}</span>
                                                    </TableCell>
                                                    
                                                    <TableCell align="center">
                                                        <Chip 
                                                            label={`${item.score}`} 
                                                            color={item.score >= 5 ? "success" : "error"} 
                                                            size="small" 
                                                            sx={{fontWeight:'bold'}}
                                                        />
                                                    </TableCell>
                                                    
                                                    <TableCell align="center" sx={{fontSize:'0.85rem'}}>
                                                        {item.correct_answers}/{item.total_questions}
                                                    </TableCell>
                                                    
                                                    <TableCell align="center">
                                                        <IconButton size="small" color="primary"><VisibilityIcon /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}

                    {viewMode === 'detail' && (
                        <Box sx={{ maxWidth: '100%', margin: '0 auto', py: 2, px: 1 }}>
                            {loading ? (
                                <Box textAlign="center" mt={5}><CircularProgress /></Box>
                            ) : (
                                <>
                                    <Paper sx={{ p: 2, mb: 2, textAlign: 'center', bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                        <Typography variant="body1" fontSize="0.95rem">
                                            Dưới đây là bài làm chi tiết. <br/>
                                            Màu <b style={{color:'green'}}>Xanh</b> là Đúng, màu <b style={{color:'red'}}>Đỏ</b> là Sai.
                                        </Typography>
                                    </Paper>

                                    {detailQuestions.map((q, index) => (
                                        <QuestionCard 
                                            key={q.id} 
                                            question={q} 
                                            index={index} 
                                            userAnswer={detailUserAnswers[q.id]} 
                                            onAnswerChange={() => {}} 
                                            isSubmitted={true} 
                                        />
                                    ))}

                                    <Box textAlign="center" mt={3} mb={5}>
                                        <Button variant="contained" onClick={handleBackToList} startIcon={<ArrowBackIcon />} sx={{borderRadius: '20px', px: 3}}>
                                            Quay lại danh sách
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}