import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import MathJax from 'react-mathjax2'; // 🟢 Thêm thư viện Toán học

const getWSUrl = () => {
    const isLocal = window.location.hostname === 'localhost';
    const backendHost = isLocal ? '127.0.0.1:8000' : 'itmaths-backend.onrender.com';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${backendHost}/ws/arena/`;
};

function ArenaPlayer() {
    const { pin } = useParams();
    const navigate = useNavigate();
    
    // 🟢 Ưu tiên hiển thị Họ tên đầy đủ
    const getDisplayName = () => {
        const firstName = localStorage.getItem('first_name');
        const lastName = localStorage.getItem('last_name');
        const username = localStorage.getItem('username');
        if (firstName || lastName) return `${lastName || ''} ${firstName || ''}`.trim();
        return username || 'Người chơi';
    };

    const playerName = getDisplayName();

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(`${getWSUrl()}${pin}/`, {
        onOpen: () => console.log('✅ Kết nối Đấu trường'),
        shouldReconnect: () => true,
    });

    const [status, setStatus] = useState('waiting');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (readyState === 1) {
            sendJsonMessage({ action: 'player_join', player_name: playerName });
        }
    }, [readyState, sendJsonMessage, playerName]);

    useEffect(() => {
        if (lastJsonMessage) {
            const { event, question, time_limit } = lastJsonMessage;
            switch (event) {
                case 'game_started': setStatus('get_ready'); break;
                case 'show_question':
                    setStatus('playing');
                    setCurrentQuestion(question);
                    setHasAnswered(false);
                    setTimeLeft(time_limit || 15);
                    break;
                case 'game_ended': setStatus('podium'); break;
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if (status === 'playing' && timeLeft > 0 && !hasAnswered) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, status, hasAnswered]);

    const handleAnswer = (idx) => {
        if (hasAnswered) return;
        setHasAnswered(true);
        const earned = Math.floor(Math.random() * 200) + 800; 
        setScore(prev => prev + earned);
        sendJsonMessage({
            action: 'submit_answer',
            player_name: playerName,
            is_correct: true,
            score_earned: earned,
            answer_index: idx
        });
    };

    const colorPalette = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
    const shapes = ['▲', '◆', '●', '■'];

    return (
        <MathJax.Context input='tex'>
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', p: 2, display: 'flex', flexDirection: 'column' }}>
                
                {/* TOP BAR */}
                <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{playerName}</Typography>
                    {status === 'playing' && <Box sx={{ bgcolor: '#333', color: '#fff', px: 2, py: 0.5, borderRadius: 5 }}>⏱ {timeLeft}s</Box>}
                    <Typography variant="subtitle1" fontWeight="900" color="primary">{score} đ</Typography>
                </Paper>

                {status === 'waiting' && <Box flex={1} display="flex" justifyContent="center" alignItems="center"><CircularProgress/></Box>}

                {/* GIAO DIỆN CHƠI - XẾP DỌC & LATEX */}
                {status === 'playing' && currentQuestion && (
                    <Box flex={1} display="flex" flexDirection="column" gap={2}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <MathJax.Text text={currentQuestion.text || "Hãy chọn đáp án!"} />
                        </Paper>

                        {!hasAnswered ? (
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {currentQuestion.options.map((opt, idx) => (
                                    <Button
                                        key={idx}
                                        fullWidth
                                        variant="contained"
                                        onClick={() => handleAnswer(idx)}
                                        sx={{
                                            bgcolor: colorPalette[idx],
                                            '&:hover': { bgcolor: colorPalette[idx], filter: 'brightness(0.9)' },
                                            justifyContent: 'flex-start',
                                            borderRadius: 3,
                                            p: 2,
                                            gap: 2,
                                            textTransform: 'none'
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight="bold">{shapes[idx]}</Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {String.fromCharCode(65 + idx)}. <MathJax.Text text={opt} />
                                        </Typography>
                                    </Button>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="h5" textAlign="center" color="textSecondary" mt={5}>Đã ghi nhận đáp án!</Typography>
                        )}
                    </Box>
                )}

                {/* KẾT THÚC - NÚT QUAY VỀ MỚI */}
                {status === 'podium' && (
                    <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={3}>
                        <Typography variant="h3" fontWeight="900">KẾT THÚC!</Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/arena')}
                            sx={{ bgcolor: '#2d3436', color: '#fff', px: 5, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                        >
                            Quay về
                        </Button>
                    </Box>
                )}
            </Box>
        </MathJax.Context>
    );
}

export default ArenaPlayer;