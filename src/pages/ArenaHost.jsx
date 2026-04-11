import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { Box, Typography, Button, Grid, Paper, Chip } from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Tự động nhận diện WebSocket (Local/Production)
const getWSUrl = () => {
    const isLocal = window.location.hostname === 'localhost';
    const backendHost = isLocal ? '127.0.0.1:8000' : 'api.itmaths.vn';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${backendHost}/ws/arena/`;
};

function ArenaHost() {
    const { pin } = useParams();
    const navigate = useNavigate();

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(`${getWSUrl()}${pin}/`);

    const [status, setStatus] = useState('waiting'); 
    const [players, setPlayers] = useState([]);
    
    // Lưu câu hỏi thật do Server phát về
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQIdx, setCurrentQIdx] = useState(-1);

    useEffect(() => {
        if (lastJsonMessage) {
            const { event, player_name, score_earned, question, current_index } = lastJsonMessage;

            if (event === 'player_joined') {
                setPlayers(prev => {
                    if (prev.find(p => p.name === player_name)) return prev;
                    return [...prev, { name: player_name, score: 0 }];
                });
            } 
            else if (event === 'answer_received') {
                setPlayers(prev => prev.map(p => 
                    p.name === player_name ? { ...p, score: p.score + score_earned } : p
                ));
            }
            else if (event === 'show_question') {
                setCurrentQuestion(question);
                setCurrentQIdx(current_index);
                setStatus('playing');
            }
            else if (event === 'game_ended') {
                setStatus('podium');
            }
        }
    }, [lastJsonMessage]);

    const handleStartGame = () => {
        setStatus('playing');
        sendJsonMessage({ action: 'broadcast', event: 'game_started' }); 
        
        setTimeout(() => {
            sendJsonMessage({ action: 'host_next_question' });
        }, 3000);
    };

    const handleNextQuestion = () => {
        sendJsonMessage({ action: 'host_next_question' });
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
                        <Typography variant="body1" color="#333" mt={2}>Truy cập <b>itmaths.vn/#/arena</b> để vào phòng</Typography>
                    </Paper>

                    <Button 
                        variant="contained" color="success" size="large" 
                        startIcon={<PlayCircleFilledWhiteIcon />} 
                        onClick={handleStartGame}
                        disabled={players.length === 0}
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

            {/* 2. MÀN HÌNH ĐANG THI - GỠ MATHJAX */}
            {status === 'playing' && currentQuestion && (
                <Box textAlign="center" flex={1}>
                    <Typography variant="h4" color="#bdc3c7" mb={2}>Câu hỏi số {currentQIdx + 1}</Typography>
                    
                    <Paper sx={{ p: 5, mb: 4, borderRadius: 3, minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h3" color="black" fontWeight="bold">
                            {currentQuestion.text}
                        </Typography>
                    </Paper>
                    
                    <Button 
                        variant="contained" color="primary" size="large"
                        endIcon={<SkipNextIcon />}
                        onClick={handleNextQuestion}
                        sx={{ fontSize: '1.2rem', py: 1.5, px: 4, borderRadius: 5 }}
                    >
                        CÂU TIẾP THEO / XEM KẾT QUẢ
                    </Button>

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
                        <Paper key={i} sx={{ p: 3, mb: 2, width: '400px', display: 'flex', justifyContent: 'space-between', bgcolor: i === 0 ? '#f1c40f' : 'white', mx: 'auto' }}>
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