import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { Box, Typography, Button, Grid, Paper, CircularProgress } from '@mui/material';

// 🟢 CẤU HÌNH TỰ ĐỘNG NHẬN DIỆN ĐƯỜNG DẪN WEBSOCKET
const getWSUrl = () => {
    const isLocal = window.location.hostname === 'localhost';
    const backendHost = isLocal ? '127.0.0.1:8000' : 'itmaths-backend.onrender.com';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${backendHost}/ws/arena/`;
};

function ArenaPlayer() {
    const { pin } = useParams();
    const navigate = useNavigate();
    
    const playerName = localStorage.getItem('username') || 'Người chơi_' + Math.floor(Math.random() * 1000);

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(`${getWSUrl()}${pin}/`, {
        onOpen: () => console.log('✅ Đã kết nối WebSocket Đấu trường'),
        onClose: () => console.log('❌ Đã ngắt kết nối WebSocket'),
        shouldReconnect: (closeEvent) => true,
    });

    const [status, setStatus] = useState('waiting');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // ⏱️ Quản lý thời gian

    // BÁO DANH KHI VÀO PHÒNG
    useEffect(() => {
        if (readyState === 1) {
            sendJsonMessage({
                action: 'player_join',
                player_name: playerName
            });
        }
    }, [readyState, sendJsonMessage, playerName]);

    // XỬ LÝ LỆNH TỪ SERVER
    useEffect(() => {
        if (lastJsonMessage) {
            console.log("📩 Lệnh mới từ Server:", lastJsonMessage);
            const { event, question, time_limit } = lastJsonMessage;

            switch (event) {
                case 'game_started':
                    setStatus('get_ready');
                    break;
                case 'show_question':
                    setStatus('playing');
                    setCurrentQuestion(question);
                    setHasAnswered(false);
                    setTimeLeft(time_limit || 15); // Nhận thời gian từ giáo viên
                    break;
                case 'game_ended':
                    setStatus('podium');
                    break;
                default:
                    break;
            }
        }
    }, [lastJsonMessage]);

    // ĐỒNG HỒ ĐẾM NGƯỢC TRÊN ĐIỆN THOẠI
    useEffect(() => {
        if (status === 'playing' && timeLeft > 0 && !hasAnswered) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, status, hasAnswered]);

    // HÀNH ĐỘNG TRẢ LỜI
    const handleAnswer = (selectedIndex) => {
        if (hasAnswered) return;
        setHasAnswered(true);

        const isCorrect = true; // Tạm thời mặc định đúng để test điểm
        const earned = Math.floor(Math.random() * 200) + 800; 
        setScore(prev => prev + earned);

        sendJsonMessage({
            action: 'submit_answer',
            player_name: playerName,
            is_correct: isCorrect,
            score_earned: earned,
            answer_index: selectedIndex
        });
    };

    const colorPalette = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
    const shapes = ['▲', '◆', '●', '■'];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', p: 2, display: 'flex', flexDirection: 'column' }}>
            
            {/* THANH TOP BAR: HIỆN ĐIỂM VÀ ĐỒNG HỒ */}
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="#333">{playerName}</Typography>
                
                {status === 'playing' && (
                    <Box sx={{ bgcolor: '#333', color: '#fff', px: 2, py: 0.5, borderRadius: 5, fontWeight: 'bold' }}>
                        ⏱ {timeLeft}s
                    </Box>
                )}

                <Typography variant="subtitle1" fontWeight="900" color="primary">{score} đ</Typography>
            </Paper>

            {/* TRẠNG THÁI 1: CHỜ GIÁO VIÊN */}
            {status === 'waiting' && (
                <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <CircularProgress size={60} thickness={5} sx={{ mb: 4, color: '#333' }} />
                    <Typography variant="h5" fontWeight="bold" textAlign="center" color="#333">
                        Đã vào phòng!<br/>Đợi giáo viên bắt đầu...
                    </Typography>
                </Box>
            )}

            {/* TRẠNG THÁI 1.5: CHUẨN BỊ */}
            {status === 'get_ready' && (
                <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="h3" fontWeight="900" color="#333" className="animate-pulse">
                        CHUẨN BỊ...
                    </Typography>
                </Box>
            )}

            {/* TRẠNG THÁI 2: ĐANG HIỆN NỘI DUNG VÀ NÚT BẤM */}
            {status === 'playing' && currentQuestion && (
                <Box flex={1} display="flex" flexDirection="column">
                    {/* Hiển thị câu hỏi nếu có */}
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Typography variant="h6" fontWeight="bold" textAlign="center">
                            {currentQuestion.text || "Hãy chọn đáp án đúng!"}
                        </Typography>
                    </Paper>

                    {hasAnswered ? (
                        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="h5" fontWeight="bold" color="#7f8c8d" textAlign="center">
                                Đã ghi nhận!<br/>Hãy nhìn lên màn hình chính.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1.5} sx={{ flex: 1 }}>
                            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
                                <Grid item xs={6} key={idx} sx={{ display: 'flex' }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleAnswer(idx)}
                                        sx={{
                                            bgcolor: colorPalette[idx],
                                            '&:hover': { bgcolor: colorPalette[idx], filter: 'brightness(0.9)' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            textTransform: 'none',
                                            boxShadow: '0 5px 0 rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>{shapes[idx]}</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {String.fromCharCode(65 + idx)}. {opt}
                                        </Typography>
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            {/* TRẠNG THÁI 3: KẾT THÚC GAME */}
            {status === 'podium' && (
                <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <Typography variant="h4" fontWeight="900" mb={1} color="#333">KẾT THÚC!</Typography>
                    <Typography variant="h6" color="#666" textAlign="center" mb={4}>Xem thứ hạng trên Tivi.</Typography>
                    <Button variant="contained" size="large" sx={{ bgcolor: '#333', borderRadius: 2 }} onClick={() => navigate('/arena')}>
                        QUAY VỀ
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default ArenaPlayer;