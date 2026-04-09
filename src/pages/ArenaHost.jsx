import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { Box, Typography, Button, Grid, Paper, Chip } from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// 🟢 CẤU HÌNH ĐƯỜNG DẪN WEBSOCKET (Đổi thành ws://127.0.0.1:8000 nếu bạn test trên máy tính ở nhà)
// Vì trang web của bạn dùng https://api.itmaths.vn nên WebSocket phải là wss://
const WS_BASE_URL = 'wss://api.itmaths.vn/ws/arena/'; 
// LƯU Ý: NẾU ĐANG CHẠY MÁY NHÀ BẰNG LỆNH runserver, BẠN HÃY SỬA THÀNH:
// const WS_BASE_URL = 'ws://127.0.0.1:8000/ws/arena/';

function ArenaHost() {
    const { pin } = useParams();
    const navigate = useNavigate();

    // Kết nối vào đường ống WebSocket của phòng này
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(`${WS_BASE_URL}${pin}/`);

    const [status, setStatus] = useState('waiting'); // waiting, playing, podium
    const [players, setPlayers] = useState([]);
    const [currentQIdx, setCurrentQIdx] = useState(-1);

    // Dữ liệu giả lập (Dummy Data) để test luồng Kahoot
    const dummyQuestions = [
        { id: 1, type: 'MCQ', content: 'Đạo hàm của hàm số y = x^2 là gì?', time_limit: 15, options: ['y = x', 'y = 2x', 'y = x^3', 'y = 2'] },
        { id: 2, type: 'MCQ', content: 'Tích phân của 2x dx bằng bao nhiêu?', time_limit: 15, options: ['x^2 + C', 'x + C', '2x^2', '2'] }
    ];

    // Lắng nghe tin nhắn từ Server (Học sinh vào phòng, nộp bài)
    useEffect(() => {
        if (lastJsonMessage) {
            const { event, player_name, score_earned } = lastJsonMessage;

            if (event === 'player_joined') {
                // Có học sinh nhập đúng mã PIN và bay vào phòng
                setPlayers(prev => [...prev, { name: player_name, score: 0 }]);
            } 
            else if (event === 'answer_received') {
                // Học sinh vừa bấm đáp án, cộng điểm bí mật cho học sinh đó
                setPlayers(prev => prev.map(p => 
                    p.name === player_name ? { ...p, score: p.score + score_earned } : p
                ));
            }
        }
    }, [lastJsonMessage]);

    // Bấm nút BẮT ĐẦU TRẬN ĐẤU
    const handleStartGame = () => {
        setStatus('playing');
        sendJsonMessage({ action: 'start_game' }); // Báo cho đt học sinh chuyển màn hình
        handleNextQuestion(0);
    };

    // Bấm nút CÂU TIẾP THEO
    const handleNextQuestion = (index) => {
        if (index < dummyQuestions.length) {
            setCurrentQIdx(index);
            // Bắn dữ liệu câu hỏi xuống điện thoại học sinh
            sendJsonMessage({
                action: 'next_question',
                question_data: dummyQuestions[index],
                time_limit: dummyQuestions[index].time_limit
            });
        } else {
            // Hết câu hỏi -> Chuyển sang màn hình vinh danh
            setStatus('podium');
            sendJsonMessage({ action: 'end_game' });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#2c3e50', color: 'white', p: 3, display: 'flex', flexDirection: 'column' }}>
            
            {/* THANH TOP BAR */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">ITMaths Host</Typography>
                <Chip label={`Sĩ số: ${players.length}`} color="warning" sx={{ fontSize: '1.2rem', fontWeight: 'bold', p: 2 }} />
            </Box>

            {/* 1. MÀN HÌNH CHỜ (LOBBY) */}
            {status === 'waiting' && (
                <Box textAlign="center" flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Paper sx={{ p: 4, bgcolor: '#f1c40f', borderRadius: 4, mb: 5, minWidth: '300px' }}>
                        <Typography variant="h6" color="#333" fontWeight="bold">Mã PIN Tham Gia</Typography>
                        <Typography variant="h1" fontWeight="900" color="black" sx={{ letterSpacing: '10px' }}>{pin}</Typography>
                        <Typography variant="body1" color="#333" mt={2}>Truy cập <b>itmaths.vn/arena</b> để vào phòng</Typography>
                    </Paper>

                    <Button 
                        variant="contained" color="success" size="large" 
                        startIcon={<PlayCircleFilledWhiteIcon />} 
                        onClick={handleStartGame}
                        disabled={players.length === 0} // Có ít nhất 1 người mới cho chơi
                        sx={{ fontSize: '1.5rem', py: 2, px: 5, borderRadius: 10, boxShadow: '0 0 20px rgba(46, 204, 113, 0.6)' }}
                    >
                        BẮT ĐẦU TRẬN ĐẤU
                    </Button>

                    <Grid container spacing={2} mt={5} justifyContent="center" maxWidth="800px">
                        {players.map((p, idx) => (
                            <Grid item key={idx}>
                                <Typography variant="h5" sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 3, py: 1, borderRadius: 2, fontWeight: 'bold' }}>
                                    {p.name}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* 2. MÀN HÌNH ĐANG THI */}
            {status === 'playing' && currentQIdx >= 0 && (
                <Box textAlign="center" flex={1}>
                    <Typography variant="h4" color="#bdc3c7" mb={2}>Câu hỏi số {currentQIdx + 1}</Typography>
                    <Paper sx={{ p: 5, mb: 4, borderRadius: 3 }}>
                        <Typography variant="h3" color="black" fontWeight="bold">
                            {dummyQuestions[currentQIdx].content}
                        </Typography>
                    </Paper>
                    
                    <Button 
                        variant="contained" color="primary" size="large"
                        endIcon={<SkipNextIcon />}
                        onClick={() => handleNextQuestion(currentQIdx + 1)}
                        sx={{ fontSize: '1.2rem', py: 1.5, px: 4, borderRadius: 5 }}
                    >
                        {currentQIdx === dummyQuestions.length - 1 ? 'XEM KẾT QUẢ' : 'CÂU TIẾP THEO'}
                    </Button>

                    {/* Bảng xếp hạng tạm thời cập nhật liên tục */}
                    <Box mt={5} maxWidth="600px" mx="auto" textAlign="left" bgcolor="rgba(0,0,0,0.3)" p={3} borderRadius={3}>
                        <Typography variant="h6" color="#f1c40f" mb={2}>Bảng điểm trực tiếp:</Typography>
                        {players.sort((a,b) => b.score - a.score).map((p, i) => (
                            <Box key={i} display="flex" justifyContent="space-between" borderBottom="1px solid rgba(255,255,255,0.1)" py={1}>
                                <Typography variant="h6">#{i+1} {p.name}</Typography>
                                <Typography variant="h6" fontWeight="bold">{p.score} điểm</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* 3. MÀN HÌNH VINH DANH (PODIUM) */}
            {status === 'podium' && (
                <Box textAlign="center" flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <EmojiEventsIcon sx={{ fontSize: '10rem', color: '#f1c40f', mb: 2 }} />
                    <Typography variant="h2" fontWeight="900" color="#f1c40f" mb={4}>NHÀ VÔ ĐỊCH</Typography>
                    
                    {players.sort((a,b) => b.score - a.score).slice(0,3).map((p, i) => (
                        <Paper key={i} sx={{ p: 3, mb: 2, width: '400px', display: 'flex', justifyContent: 'space-between', bgcolor: i === 0 ? '#f1c40f' : 'white' }}>
                            <Typography variant="h4" color="black" fontWeight="bold">#{i+1} {p.name}</Typography>
                            <Typography variant="h4" color="black">{p.score}</Typography>
                        </Paper>
                    ))}

                    <Button variant="outlined" color="inherit" sx={{ mt: 5 }} onClick={() => navigate('/arena')}>
                        Thoát Đấu Trường
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default ArenaHost;