import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { Box, Typography, Button, Grid, Paper, CircularProgress } from '@mui/material';

// 🟢 CẤU HÌNH TỰ ĐỘNG NHẬN DIỆN ĐƯỜNG DẪN WEBSOCKET
const getWSUrl = () => {
    const isLocal = window.location.hostname === 'localhost';
    // Thay 'itmaths-backend.onrender.com' bằng domain chuẩn của Render nếu bạn không dùng custom domain cho backend
    const backendHost = isLocal ? '127.0.0.1:8000' : 'itmaths-backend.onrender.com';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${backendHost}/ws/arena/`;
};

function ArenaPlayer() {
    const { pin } = useParams();
    const navigate = useNavigate();
    
    // Lấy tên học sinh từ bộ nhớ, nếu chưa có thì lấy tên mặc định
    const playerName = localStorage.getItem('username') || 'Người chơi_' + Math.floor(Math.random() * 1000);

    // Khởi tạo kết nối WebSocket
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(`${getWSUrl()}${pin}/`, {
        onOpen: () => console.log('✅ Đã kết nối WebSocket Đấu trường'),
        onClose: () => console.log('❌ Đã ngắt kết nối WebSocket'),
        shouldReconnect: (closeEvent) => true, // Tự động kết nối lại nếu rớt mạng
    });

    const [status, setStatus] = useState('waiting');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [score, setScore] = useState(0);

    // BƯỚC 1: Vừa mở màn hình lên và Socket sẵn sàng là tự động báo danh với Host
    useEffect(() => {
        if (readyState === 1) { // 1 là trạng thái OPEN
            sendJsonMessage({
                action: 'player_join',
                player_name: playerName
            });
        }
    }, [readyState, sendJsonMessage, playerName]);

    // BƯỚC 2: XỬ LÝ LỆNH TỪ GIÁO VIÊN (LẮP RÁP BƯỚC 2 GIÚP BẠN)
    useEffect(() => {
        if (lastJsonMessage) {
            console.log("📩 Lệnh mới từ Server:", lastJsonMessage);
            const { event, question } = lastJsonMessage;

            switch (event) {
                case 'game_started':
                    setStatus('get_ready');
                    break;
                case 'show_question':
                    setStatus('playing');
                    setCurrentQuestion(question);
                    setHasAnswered(false); // Mở khóa nút cho câu hỏi mới
                    break;
                case 'game_ended':
                    setStatus('podium');
                    break;
                default:
                    break;
            }
        }
    }, [lastJsonMessage]);

    // BƯỚC 3: Học sinh bấm nút trả lời
    const handleAnswer = (selectedIndex) => {
        if (hasAnswered) return;
        setHasAnswered(true); // Khóa nút ngay lập tức

        // Logic check đáp án (Tạm thời test nên mặc định đúng)
        const isCorrect = true; 
        const earned = Math.floor(Math.random() * 200) + 800; 
        setScore(prev => prev + earned);

        // Bắn tín hiệu trả lời lên Server để Host cập nhật sĩ số/điểm số
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
        <Box sx={{ minHeight: '100vh', bgcolor: '#f2f2f2', p: 2, display: 'flex', flexDirection: 'column' }}>
            {/* THANH THÔNG TIN NGƯỜI CHƠI */}
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="#333">{playerName}</Typography>
                <Typography variant="h6" color="#333" fontWeight="900" bgcolor="#e0e0e0" px={2} py={0.5} borderRadius={2}>
                    {score}
                </Typography>
            </Paper>

            {/* TRẠNG THÁI 1: CHỜ GIÁO VIÊN BẮT ĐẦU */}
            {status === 'waiting' && (
                <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <CircularProgress size={60} thickness={5} sx={{ mb: 4, color: '#333' }} />
                    <Typography variant="h5" fontWeight="bold" textAlign="center" color="#333">
                        Bạn đã vào phòng!<br/>Hãy nhìn lên màn hình của Thầy/Cô.
                    </Typography>
                </Box>
            )}

            {/* TRẠNG THÁI 1.5: CHUẨN BỊ */}
            {status === 'get_ready' && (
                <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="h3" fontWeight="900" color="#333">
                        CHUẨN BỊ...
                    </Typography>
                </Box>
            )}

            {/* TRẠNG THÁI 2: ĐANG HIỆN NÚT BẤM */}
            {status === 'playing' && (
                <Box flex={1} display="flex" flexDirection="column">
                    {hasAnswered ? (
                        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="h4" fontWeight="bold" color="#7f8c8d" textAlign="center">
                                Đã ghi nhận đáp án!<br/>Đợi câu tiếp theo nhé.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1} sx={{ flex: 1 }}>
                            {[0, 1, 2, 3].map((idx) => (
                                <Grid item xs={6} key={idx} sx={{ display: 'flex' }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleAnswer(idx)}
                                        sx={{
                                            bgcolor: colorPalette[idx],
                                            '&:hover': { bgcolor: colorPalette[idx], filter: 'brightness(0.8)' },
                                            fontSize: '4rem',
                                            borderRadius: 2,
                                            boxShadow: '0 6px 0 rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {shapes[idx]}
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
                    <Typography variant="h4" fontWeight="900" mb={2} color="#333">Trận đấu kết thúc!</Typography>
                    <Typography variant="h6" color="#666" textAlign="center">Xem kết quả trên màn hình chính.</Typography>
                    <Button variant="contained" size="large" sx={{ mt: 4, bgcolor: '#333' }} onClick={() => navigate('/arena')}>
                        THOÁT
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default ArenaPlayer;