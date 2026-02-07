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
import axiosClient from '../services/axiosClient'; // 🔥 Sử dụng axiosClient cho chuẩn Token và URL
import QuestionCard from './QuestionCard'; 
import { AdMob } from '@capacitor-community/admob';

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
    const [detailQuestions, setDetailQuestions] = useState([]);
    const [detailUserAnswers, setDetailUserAnswers] = useState({});
    const [detailExamTitle, setDetailExamTitle] = useState("");

    useEffect(() => {
        const initAdMob = async () => {
            try {
                await AdMob.initialize({ requestTrackingAuthorization: true });
            } catch (e) { console.error("Lỗi Init AdMob:", e); }
        };
        initAdMob();
    }, []);

    // 🔥 Sửa lỗi gọi sai URL: Bỏ "/api" dư thừa vì axiosClient đã có sẵn
    const fetchHistory = async () => {
        try {
            const res = await axiosClient.get('/my-results/'); 
            setHistory(res.data);
        } catch (error) {
            console.error("Lỗi lấy lịch sử:", error);
        }
    };

    useEffect(() => {
        const handleExamSubmitted = () => {
            setTimeout(() => { fetchHistory(); }, 1500); 
        };
        window.addEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted);
        return () => window.removeEventListener('ITMATHS_EXAM_SUBMITTED', handleExamSubmitted);
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setViewMode('list'); 
        fetchHistory(); 
    };

    const handleViewDetail = async (resultId, examId, examTitle) => {
        setIsLoadingAd(true);
        try {
            await AdMob.prepareInterstitial({
                adId: 'ca-app-pub-3940256099942544/1033173712', 
                isTesting: true
            });
            await AdMob.showInterstitial();
        } catch (e) { console.error("Lỗi QC:", e); }

        setIsLoadingAd(false);
        setLoading(true);

        try {
            // 🔥 Gọi đúng route detail đã khai báo ở backend
            const resResult = await axiosClient.get(`/history/${resultId}/`);
            
            let userAns = resResult.data.detail_answers;
            if (typeof userAns === 'string') {
                try { userAns = JSON.parse(userAns); } catch(e) {}
            }
            setDetailUserAnswers(userAns || {});

            const resQuestions = await axiosClient.get(`/exams/${examId}/questions/`);
            
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
        if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?")) return;
        try {
            await axiosClient.delete('/my-results/');
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

                <DialogContent sx={{ bgcolor: '#f5f5f5', p: viewMode === 'detail' ? 0 : 2 }}>
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
                                            <TableRow key={item.id} hover onClick={() => handleViewDetail(item.id, item.exam, item.exam_title)} sx={{ cursor: 'pointer' }}>
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
                        <Box sx={{ p: 1 }}>
                            {loading ? <Box textAlign="center" mt={5}><CircularProgress /></Box> : (
                                <>
                                    {detailQuestions.map((q, index) => (
                                        <QuestionCard key={q.id} question={q} index={index} userAnswer={detailUserAnswers[q.id]} onAnswerChange={() => {}} isSubmitted={true} />
                                    ))}
                                    <Box textAlign="center" mt={3} mb={5}>
                                        <Button variant="contained" onClick={handleBackToList} startIcon={<ArrowBackIcon />}>Quay lại danh sách</Button>
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