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
// 🔥 THÊM IMPORT CAPACITOR CORE
import { Capacitor } from '@capacitor/core';

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
    // 🔥 CẬP NHẬT: CHỈ KHỞI TẠO NẾU LÀ APP
    useEffect(() => {
        const initAdMob = async () => {
            if (Capacitor.isNativePlatform()) {
                try { await AdMob.initialize({ requestTrackingAuthorization: true }); } 
                catch (e) { console.error("Lỗi Init AdMob:", e); }
            }
        };
        initAdMob();
    }, []);

    // --- 2. HÀM XỬ LÝ QUẢNG CÁO TRƯỚC KHI CHUYỂN TRANG ---
    // 🔥 CẬP NHẬT: TÁCH LOGIC QUẢNG CÁO GIỮA APP VÀ WEB
    const handleActionWithAd = async (callback) => {
        if (Capacitor.isNativePlatform()) {
            setIsLoadingAd(true); 
            try {
                await AdMob.prepareInterstitial({
                   adId: 'ca-app-pub-2431317486483815/1826436807', 
                   isTesting: false
                });
                await AdMob.showInterstitial();
            } catch (e) {
                console.error("Lỗi QC hoặc mạng yếu:", e);
            } finally {
                setIsLoadingAd(false); 
                callback(); 
            }
        } else {
            // Nếu là Web, chạy thẳng callback chuyển trang
            callback();
        }
    };

    // --- 3. LOAD DATA ---
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await axiosClient.get(`/topics/${topicId}/exercises/`);
                // Thêm { numeric: true } để sắp xếp số đúng chuẩn tự nhiên
                const sortedExams = res.data.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));
                setExams(sortedExams);
            } catch (error) {
                console.error("Lỗi tải bài tập:", error);
            }
            setLoading(false);
        };
        fetchExams();
    }, [topicId]);

    // --- 4. HÀM BẤM LÀM BÀI ---
    const handleStartExam = (examId) => {
        handleActionWithAd(() => {
            // Gửi topicId qua cả URL và State
            navigate(`/exams/${examId}?topic=${topicId}`, {
                state: { 
                    topicTitle: topicTitle,
                    fromTopicId: topicId 
                } 
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