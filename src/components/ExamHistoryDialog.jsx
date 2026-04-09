import React, { useState, useEffect, useRef } from 'react';
import { 
    Dialog, DialogContent, Button, Typography, Box, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, 
    Chip, CircularProgress, AppBar, Toolbar, Slide, Backdrop, TextField, 
    DialogTitle, DialogActions, Snackbar, Alert 
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FeedbackIcon from '@mui/icons-material/Feedback';
import axiosClient from '../services/axiosClient'; 
import QuestionCard from './QuestionCard'; 
import { AdMob } from '@capacitor-community/admob';
// 🔥 THÊM IMPORT CAPACITOR CORE
import { Capacitor } from '@capacitor/core'; 

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const formatDate = (dateString) => {
    if (!dateString) return "---";
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};

export default function ExamHistoryDialog({ customId }) {
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoadingAd, setIsLoadingAd] = useState(false);

    // State chi tiết
    const [viewMode, setViewMode] = useState('list'); 
    const [currentResultId, setCurrentResultId] = useState(null);
    const [currentExamId, setCurrentExamId] = useState(null);
    const [detailQuestions, setDetailQuestions] = useState([]);
    const [detailUserAnswers, setDetailUserAnswers] = useState({});
    const [detailExamTitle, setDetailExamTitle] = useState("");
    const [currentTotalScore, setCurrentTotalScore] = useState(0); 

    // STATE ĐIỂM THÀNH PHẦN
    const [scoreDetails, setScoreDetails] = useState({ p1: 0, p2: 0, p3: 0 });

    const contentRef = useRef(null);

    // State cho Feedback & Toast
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackContent, setFeedbackContent] = useState("");
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    // 🔥 CẬP NHẬT 1: CHỈ INIT ADMOB TRÊN NỀN TẢNG NATIVE
    useEffect(() => {
        const initAdMob = async () => {
            if (Capacitor.isNativePlatform()) {
                try { await AdMob.initialize({ requestTrackingAuthorization: true }); } 
                catch (e) { console.error("Lỗi Init AdMob:", e); }
            }
        };
        initAdMob();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axiosClient.get('/my-results/'); 
            setHistory(res.data);
        } catch (error) { console.error("Lỗi lấy lịch sử:", error); }
    };

    useEffect(() => {
        const handleExamSubmitted = () => {
            setTimeout(() => { fetchHistory(); }, 1500); 
        };
        window.addEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted);
        return () => window.removeEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted);
    }, []);

    useEffect(() => {
        if (viewMode === 'detail' && contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [viewMode]);

    const handleOpen = () => {
        setOpen(true);
        setViewMode('list'); 
        fetchHistory(); 
    };

    // 🔥 CẬP NHẬT 2: CHỈ SHOW ADMOB KHI BẤM XEM CHI TIẾT NẾU LÀ APP NATIVE
    const handleViewDetail = async (resultId, examId, examTitle, totalScore) => {
        if (Capacitor.isNativePlatform()) {
            setIsLoadingAd(true);
            try {
                await AdMob.prepareInterstitial({
                    adId: 'ca-app-pub-2431317486483815/1826436807', 
                    isTesting: false
                });
                await AdMob.showInterstitial();
            } catch (e) {
                console.error("Lỗi hiển thị quảng cáo: ", e);
            } finally {
                setIsLoadingAd(false);
            }
        }

        setLoading(true);

        try {
            const resResult = await axiosClient.get(`/history/${resultId}/`);
            let userAns = resResult.data.detail_answers;
            if (typeof userAns === 'string') {
                try { userAns = JSON.parse(userAns); } catch(e) {}
            }
            userAns = userAns || {};
            setDetailUserAnswers(userAns);

            const resQuestions = await axiosClient.get(`/exams/${examId}/questions/`);
            const qData = resQuestions.data;
            setDetailQuestions(qData);
            
            // [LOGIC TÍNH ĐIỂM] 
            let p1 = 0, p2 = 0, p3 = 0;
            qData.forEach(q => {
                const ans = userAns[q.id];
                if (!ans) return;
                
                if (q.question_type === 'MCQ') {
                    if (q.choices.find(c => c.is_correct && c.content === ans)) p1 += 0.25;
                } else if (q.question_type === 'TF') {
                    let sub = 0;
                    q.choices.forEach(c => { 
                        if (ans[c.id] === (c.is_correct ? "true" : "false")) sub++; 
                    });
                    if (sub === 1) p2 += 0.1; else if (sub === 2) p2 += 0.25; else if (sub === 3) p2 += 0.5; else if (sub === 4) p2 += 1.0;
                } else if (q.question_type === 'SHORT') {
                    const uVal = parseFloat(String(ans).replace(',','.'));
                    const cVal = parseFloat(String(q.short_answer_correct).replace(',','.'));
                    if (Math.abs(uVal - cVal) < 0.001) p3 += 0.5;
                }
            });
            setScoreDetails({ p1, p2, p3 });
            
            setDetailExamTitle(examTitle);
            setCurrentResultId(resultId);
            setCurrentExamId(examId);
            setCurrentTotalScore(totalScore); 
            setViewMode('detail'); 
        } catch (error) {
            setToast({ open: true, message: 'Không thể tải chi tiết bài làm.', severity: 'error' });
        } finally { setLoading(false); }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setDetailQuestions([]);
        setDetailUserAnswers({});
    };

    const handleSendFeedback = async () => {
        if (!feedbackContent.trim()) return;
        setIsSendingFeedback(true);
        try {
            await axiosClient.post('/feedbacks/', {
                exam: currentExamId,
                content: `[Phản hồi từ Lịch sử bài làm ID: ${currentResultId}] - Nội dung: ${feedbackContent}`
            });
            setToast({ open: true, message: 'Cảm ơn bạn! Góp ý đã được gửi.', severity: 'success' });
            setFeedbackOpen(false);
            setFeedbackContent("");
        } catch (e) {
            setToast({ open: true, message: 'Lỗi gửi góp ý.', severity: 'error' });
        } finally { setIsSendingFeedback(false); }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?")) return;
        try {
            await axiosClient.delete('/my-results/');
            setHistory([]);
            setToast({ open: true, message: 'Đã xóa lịch sử.', severity: 'success' });
        } catch (error) { 
            setToast({ open: true, message: 'Lỗi xóa lịch sử.', severity: 'error' });
        }
    };

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast({ ...toast, open: false });
    };

    return (
        <>
            <Button id={customId} variant="outlined" startIcon={<HistoryIcon />} onClick={handleOpen} sx={{ mr: 1, textTransform: 'none', borderRadius: 2 }}>Lịch sử</Button>

            <Dialog open={open} onClose={() => setOpen(false)} fullScreen TransitionComponent={Transition}>
                <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}>
                    <Box textAlign="center">
                        <CircularProgress color="inherit" />
                        <Typography sx={{mt: 2, fontWeight: 'bold'}}>Đang tải dữ liệu bài làm...</Typography>
                    </Box>
                </Backdrop>

                <AppBar sx={{ position: 'relative', bgcolor: viewMode === 'list' ? '#673ab7' : '#4527a0', paddingTop: 'env(safe-area-inset-top)' }}>
                    <Toolbar> 
                        {viewMode === 'detail' ? (
                            <IconButton edge="start" color="inherit" onClick={handleBackToList}><ArrowBackIcon /></IconButton>
                        ) : (
                            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)}><CloseIcon /></IconButton>
                        )}
                        <Typography sx={{ ml: 2, flex: 1, fontWeight: 'bold' }} variant="h6">
                            {viewMode === 'list' ? '📜 Lịch sử ôn luyện' : `Chi tiết: ${detailExamTitle}`}
                        </Typography>
                        {viewMode === 'list' && history.length > 0 && (
                            <Button color="inherit" onClick={handleClearHistory} startIcon={<DeleteSweepIcon />}>Xóa</Button>
                        )}
                    </Toolbar>
                </AppBar>

                <DialogContent ref={contentRef} sx={{ bgcolor: '#f5f5f5', p: viewMode === 'detail' ? 2 : 2 }}>
                    {viewMode === 'list' ? (
                        history.length === 0 ? (
                            <Box textAlign="center" py={10}><Typography color="textSecondary">Chưa có dữ liệu bài làm nào.</Typography></Box>
                        ) : (
                            <TableContainer component={Paper} elevation={3}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#eeeeee' }}>
                                        <TableRow>
                                            <TableCell><b>Tên đề</b></TableCell>
                                            <TableCell align="center"><b>Điểm</b></TableCell>
                                            <TableCell align="center"><b>Xem</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {history.map((item) => (
                                            <TableRow key={item.id} hover onClick={() => handleViewDetail(item.id, item.exam, item.exam_title, item.score)} sx={{ cursor: 'pointer' }}>
                                                <TableCell sx={{fontWeight:'bold', color: '#3f51b5'}}>
                                                    {item.exam_title || "Bài tập"}
                                                    <div style={{fontSize:'0.7rem', color:'#666', fontWeight:'normal'}}>{formatDate(item.created_at)}</div>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={`${item.score}`} color={item.score >= 5 ? "success" : "error"} size="small" sx={{fontWeight:'bold'}} />
                                                </TableCell>
                                                <TableCell align="center"><IconButton size="small" color="primary"><VisibilityIcon /></IconButton></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    ) : (
                        <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
                            {loading ? <Box textAlign="center" mt={5}><CircularProgress /></Box> : (
                                <>
                                    <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden', borderRadius: 2, border: '1px solid #ddd' }}>
                                        <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, textAlign: 'center', borderBottom: '1px solid #c8e6c9' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="#2e7d32">KẾT QUẢ BÀI LÀM</Typography>
                                        </Box>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableBody>
                                                    <TableRow hover>
                                                        <TableCell align="center" sx={{ fontWeight: 400 }}>Phần I (Trắc nghiệm)</TableCell>
                                                        <TableCell align="center"><b>{scoreDetails.p1.toFixed(2)}</b></TableCell>
                                                    </TableRow>
                                                    <TableRow hover>
                                                        <TableCell align="center" sx={{ fontWeight: 400 }}>Phần II (Đúng/Sai)</TableCell>
                                                        <TableCell align="center"><b>{scoreDetails.p2.toFixed(2)}</b></TableCell>
                                                    </TableRow>
                                                    <TableRow hover>
                                                        <TableCell align="center" sx={{ fontWeight: 400 }}>Phần III (Điền đáp án)</TableCell>
                                                        <TableCell align="center"><b>{scoreDetails.p3.toFixed(2)}</b></TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ bgcolor: '#fff9c4' }}>
                                                        <TableCell align="right"><b>TỔNG ĐIỂM:</b></TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="h6" fontWeight="bold" color="#d32f2f">
                                                                {currentTotalScore}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>

                                    {detailQuestions.map((q, index) => (
                                        <QuestionCard key={q.id} question={q} index={index} userAnswer={detailUserAnswers[q.id]} onAnswerChange={() => {}} isSubmitted={true} />
                                    ))}
                                    
                                    <Box sx={{ mt: 4, mb: 4, p: 2, textAlign: 'center', bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontWeight: 400 }}>
                                            Bạn phát hiện lỗi trong đề thi này?
                                        </Typography>
                                        <Button 
                                            variant="outlined" color="warning" size="small" startIcon={<FeedbackIcon />}
                                            onClick={() => setFeedbackOpen(true)}
                                            sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 400 }}
                                        >
                                            Góp ý nội dung đề thi
                                        </Button>
                                    </Box>

                                    <Box textAlign="center" mt={3} mb={5}>
                                        <Button variant="contained" onClick={handleBackToList} startIcon={<ArrowBackIcon />}>Quay lại danh sách</Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Góp ý nội dung</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Mô tả lỗi hoặc góp ý..." type="text" fullWidth multiline rows={4} variant="outlined" value={feedbackContent} onChange={(e) => setFeedbackContent(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setFeedbackOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleSendFeedback} variant="contained" color="primary" disabled={isSendingFeedback || !feedbackContent.trim()}>
                        {isSendingFeedback ? "Đang gửi..." : "Gửi"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', boxShadow: 3 }}>{toast.message}</Alert>
            </Snackbar>
        </>
    );
}