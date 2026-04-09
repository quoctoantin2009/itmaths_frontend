import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { Box, Typography, Button, Grid, Paper, CircularProgress } from '@mui/material';

// 🟢 CẤU HÌNH ĐƯỜNG DẪN WEBSOCKET (Nhớ phải giống hệt bên ArenaHost)
const WS_BASE_URL = 'wss://api.itmaths.vn/ws/arena/'; 
// LƯU Ý: NẾU CHẠY LOCAL THÌ ĐỔI THÀNH: const WS_BASE_URL = 'ws://127.0.0.1:8000/ws/arena/';

function ArenaPlayer() {
    const { pin } = useParams();
    const navigate = useNavigate();
    // Lấy tên học sinh từ bộ nhớ, nếu chưa có thì lấy tên mặc định
    const playerName = localStorage.getItem('username') || 'Khách_' + Math.floor(Math.random() * 1000);

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(`${WS_BASE_URL}${pin}/`);

    const [status, setStatus] = useState('waiting');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [score, setScore] = useState(0);

    // BƯỚC 1: Vừa mở màn hình lên là tự động "Gõ cửa" báo với Host là em đã vào
    useEffect(() => {
        sendJsonMessage({
            action: 'player_join',
            player_name: playerName
        });
    }, [sendJsonMessage, playerName]);

    // BƯỚC 2: Dỏng tai nghe lệnh từ Tivi của Giáo viên
    useEffect(() => {
        if (lastJsonMessage) {
            const { event, question } = lastJsonMessage;

            if (event === 'game_started') {
                setStatus('get_ready');
            }
            else if (event === 'show_question') {
                setStatus('playing');
                setCurrentQuestion(question);
                setHasAnswered(false); // Mở khóa nút bấm cho câu mới
            }
            else if (event === 'game_ended') {
                setStatus('podium');
            }
        }
    }, [lastJsonMessage]);

    // BƯỚC 3: Học sinh bấm nút trả lời
    const handleAnswer = (selectedIndex) => {
        if (hasAnswered) return;
        setHasAnswered(true); // Khóa nút lại, tránh bấm 2 lần

        // Ghi chú: Chỗ này thực tế sẽ check với đáp án đúng, tạm thời fix cứng để test
        const isCorrect = true; 
        const earned = Math.floor(Math.random() * 200) + 800; // Điểm ngẫu nhiên từ 800-1000
        setScore(prev => prev + earned);

        // Bắn điểm lên tivi cho Thầy Cô
        sendJsonMessage({
            action: 'submit_answer',
            player_name: playerName,
            is_correct: isCorrect,
            score_earned: earned
        });
    };

    // Bảng màu chuẩn của Kahoot (Đỏ, Lam, Vàng, Lục)
    const colorPalette = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
    const shapes = ['▲', '◆', '●', '■'];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f2f2f2', p: 2, display: 'flex', flexDirection: 'column' }}>
            {/* THANH TOP BAR CỦA HỌC SINH */}
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

            {/* TRẠNG THÁI 1.5: CHUẨN BỊ (Lúc GV vừa bấm Start) */}
            {status === 'get_ready' && (
                <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="h3" fontWeight="900" color="#333">
                        CHUẨN BỊ...
                    </Typography>
                </Box>
            )}

            {/* TRẠNG THÁI 2: ĐANG LÀM BÀI (HIỆN NÚT BẤM TO) */}
            {status === 'playing' && currentQuestion && (
                <Box flex={1} display="flex" flexDirection="column">
                    {hasAnswered ? (
                        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                            <Typography variant="h4" fontWeight="bold" color="#7f8c8d" textAlign="center">
                                Đang chờ những người khác...
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={1} sx={{ flex: 1 }}>
                            {currentQuestion.options && currentQuestion.options.map((opt, idx) => (
                                <Grid item xs={6} key={idx} sx={{ display: 'flex' }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleAnswer(idx)}
                                        sx={{
                                            bgcolor: colorPalette[idx % 4],
                                            '&:hover': { bgcolor: colorPalette[idx % 4], filter: 'brightness(0.8)' },
                                            fontSize: '4rem',
                                            borderRadius: 2,
                                            boxShadow: '0 6px 0 rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {shapes[idx % 4]}
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
                    <Typography variant="h6" color="#666" textAlign="center">Nhìn lên tivi để xem bạn đứng thứ mấy nhé.</Typography>
                    <Button variant="contained" size="large" sx={{ mt: 4, bgcolor: '#333' }} onClick={() => navigate('/arena')}>
                        QUAY VỀ SẢNH
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default ArenaPlayer;