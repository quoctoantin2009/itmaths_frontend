import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../services/axiosClient'; 
import { 
    Container, Typography, Grid, Box, 
    CircularProgress, Backdrop, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { AdMob } from '@capacitor-community/admob'; 

// Import CSS
import './TopicDetail.css';

function TopicDetailPage() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Nhận thông tin từ trang trước
    const topicTitle = location.state?.topicTitle || "Chi tiết Chuyên đề";
    
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingAd, setIsLoadingAd] = useState(false);

    // --- 1. CONFIG ADMOB ---
    useEffect(() => {
        const initAdMob = async () => {
            try { await AdMob.initialize({ requestTrackingAuthorization: true, initializeForTesting: true }); } 
            catch (e) { console.error("Lỗi Init AdMob:", e); }
        };
        initAdMob();
    }, []);

    // --- 2. HÀM XỬ LÝ QUẢNG CÁO TRƯỚC KHI CHUYỂN TRANG ---
    const handleActionWithAd = async (callback) => {
        setIsLoadingAd(true); 
        try {
            await AdMob.prepareInterstitial({
               adId: 'ca-app-pub-3940256099942544/1033173712', 
               isTesting: true
            });
            await AdMob.showInterstitial();
        } catch (e) {
            console.error("Lỗi QC hoặc mạng yếu:", e);
        } finally {
            setIsLoadingAd(false); 
            callback(); 
        }
    };

    // --- 3. LOAD DATA ---
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await axiosClient.get(`/topics/${topicId}/exercises/`);
                // Sắp xếp đề thi theo tên A-Z
                const sortedExams = res.data.sort((a, b) => a.title.localeCompare(b.title));
                setExams(sortedExams);
            } catch (error) {
                console.error("Lỗi tải bài tập:", error);
            }
            setLoading(false);
        };
        fetchExams();
    }, [topicId]);

    // --- 4. HÀM BẤM LÀM BÀI (ĐÃ CẬP NHẬT LOGIC ĐIỀU HƯỚNG) ---
    const handleStartExam = (examId) => {
        handleActionWithAd(() => {
            // 🔥 QUAN TRỌNG: Gửi kèm tham số ?topic=... vào URL
            // Để ExamPage biết đường quay lại trang này khi làm xong
            navigate(`/exams/${examId}?topic=${topicId}`, {
                state: { topicTitle: topicTitle } // Gửi thêm title để hiển thị nếu cần
            });
        });
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" mt={10}>
            <CircularProgress sx={{color: '#8e24aa'}}/>
        </Box>
    );

    return (
        <div className="topic-container">
            
            {/* Loading Quảng cáo */}
            <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}>
               <Box textAlign="center">
                  <CircularProgress color="inherit" />
                  <Typography sx={{mt: 2, fontWeight: 'bold'}}>Đang tải bài thi...</Typography>
               </Box>
            </Backdrop>

            {/* STICKY HEADER */}
            <div className="topic-sticky-header">
                <IconButton onClick={() => navigate(-1)} className="btn-back-topic">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" className="topic-header-title">
                    {topicTitle}
                </Typography>
            </div>

            <Container maxWidth="md" sx={{ px: 2, pb: 5 }}>
                
                {exams.length === 0 ? (
                    <div className="empty-state-topic">
                        <AssignmentIcon sx={{ fontSize: 60, opacity: 0.3, mb: 1 }} />
                        <Typography>Chuyên đề này chưa có bài tập nào.</Typography>
                    </div>
                ) : (
                    <Grid container spacing={0}>
                        {exams.map((exam) => (
                            <Grid item xs={12} key={exam.id}>
                                <div className="exam-item-card" onClick={() => handleStartExam(exam.id)}>
                                    {/* Bên trái: Icon & Thông tin */}
                                    <Box display="flex" alignItems="center" flexGrow={1}>
                                        <div className="exam-icon-wrapper">
                                            <AssignmentIcon />
                                        </div>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" color="#333" lineHeight={1.2} mb={0.5}>
                                                {exam.title}
                                            </Typography>
                                            
                                            <Box display="flex" flexWrap="wrap" gap={1}>
                                                <div className="exam-meta-badge badge-time">
                                                    <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                    {exam.duration}'
                                                </div>
                                                <div className="exam-meta-badge badge-question">
                                                    <HelpOutlineIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                    {exam.questions ? exam.questions.length : '?'} câu
                                                </div>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Bên phải: Nút làm bài */}
                                    <button className="btn-do-exam">
                                        Làm bài
                                    </button>
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </div>
    );
}

export default TopicDetailPage;