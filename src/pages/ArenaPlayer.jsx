import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { 
    Box, Typography, Button, Paper, CircularProgress, 
    TextField, Radio, RadioGroup, FormControlLabel, FormControl 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const getWSUrl = () => {
    if (import.meta.env && import.meta.env.DEV) {
        return 'ws://127.0.0.1:8000/ws/arena/';
    }
    return 'wss://api.itmaths.vn/ws/arena/';
};

const latexDelimiters = [
    {left: '$$', right: '$$', display: true},
    {left: '$', right: '$', display: false},
    {left: '\\(', right: '\\)', display: false},
    {left: '\\[', right: '\\]', display: true},
];

const formatLatexText = (text) => {
    if (text === null || text === undefined) return "Hãy chọn đáp án!";
    let res = String(text).replace(/\\textif{/g, '\\textit{');
    const parts = res.split(/(\$\$?|\\\[|\\\]|\\\(|\\\))/); 
    let inMath = false;
    for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (['$', '$$', '\\[', '\\]', '\\(', '\\)'].includes(p)) {
            inMath = !inMath; 
        } else if (!inMath) {
            parts[i] = p.replace(/\\textbf{([^}]+)}/g, '$\\textbf{$1}$');
            parts[i] = parts[i].replace(/\\textit{([^}]+)}/g, '$\\textit{$1}$');
        }
    }
    return parts.join('');
};

function ArenaPlayer() {
    const { pin } = useParams();
    const navigate = useNavigate();
    
    const getDisplayName = () => {
        const firstName = localStorage.getItem('first_name');
        const lastName = localStorage.getItem('last_name');
        const username = localStorage.getItem('username');
        if (firstName || lastName) return `${lastName || ''} ${firstName || ''}`.trim();
        return username || 'Người chơi';
    };

    const playerName = getDisplayName();

    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(`${getWSUrl()}${pin}/`, {
        shouldReconnect: () => true,
    });

    const [status, setStatus] = useState('waiting');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(15);

    const [shortAnswer, setShortAnswer] = useState('');
    const [tfAnswers, setTfAnswers] = useState({});

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
                    setTimeLeft(time_limit || 20);
                    setTotalTime(time_limit || 20);
                    setShortAnswer('');
                    setTfAnswers({});
                    break;
                case 'game_ended': setStatus('podium'); break;
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if (status === 'playing' && timeLeft > 0 && !hasAnswered) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !hasAnswered && status === 'playing') {
            submitFinalAnswer('TIMEOUT', 0);
        }
    }, [timeLeft, status, hasAnswered]);

    const submitFinalAnswer = (answerData, baseScore = 500) => {
        setHasAnswered(true);
        let earned = 0;
        if (answerData !== 'TIMEOUT') {
            const speedBonus = Math.floor((timeLeft / totalTime) * 500);
            earned = baseScore + speedBonus;
            setScore(prev => prev + earned);
        }
        sendJsonMessage({ action: 'submit_answer', player_name: playerName, answer_data: answerData, score_earned: earned });
    };

    const handleMCQAnswer = (idx) => submitFinalAnswer(`OPTION_${idx}`, 500);
    const handleShortAnswerSubmit = () => { if (shortAnswer.trim()) submitFinalAnswer(shortAnswer, 1000); };
    const handleTFSubmit = () => {
        if (Object.keys(tfAnswers).length < (currentQuestion.options?.length || 4)) return alert('Vui lòng chọn Đúng/Sai cho tất cả các ý!');
        submitFinalAnswer(tfAnswers, 1000); 
    };

    const colorPalette = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
    const shapes = ['▲', '◆', '●', '■'];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ bgcolor: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1" fontWeight="bold" color="#2c3e50">{playerName}</Typography>
                {status === 'playing' && (
                    <Box sx={{ bgcolor: timeLeft <= 5 ? '#e74c3c' : '#34495e', color: '#fff', px: 2, py: 0.5, borderRadius: 5, fontWeight: 'bold' }}>⏱ {timeLeft}s</Box>
                )}
                <Box sx={{ bgcolor: '#f1c40f', px: 2, py: 0.5, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="900" color="black">{score} đ</Typography>
                </Box>
            </Box>

            {status === 'waiting' && (
                <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <CircularProgress size={60} sx={{ color: '#4a148c', mb: 3 }} />
                    <Typography variant="h5" color="#4a148c" fontWeight="bold">Bạn đã vào phòng!</Typography>
                </Box>
            )}
            
            {status === 'get_ready' && (
                <Box flex={1} display="flex" justifyContent="center" alignItems="center" bgcolor="#3498db">
                    <Typography variant="h3" fontWeight="900" color="white">CHUẨN BỊ...</Typography>
                </Box>
            )}

            {status === 'playing' && currentQuestion && (
                <Box flex={1} display="flex" flexDirection="column" p={2} gap={2}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <Typography variant="body1" fontWeight="bold" fontSize="1.2rem" sx={{ lineHeight: 1.5 }}>
                            <Latex delimiters={latexDelimiters}>{formatLatexText(currentQuestion.text)}</Latex>
                        </Typography>
                    </Paper>

                    {/* 🟢 GIAO DIỆN CHỜ HOẶC HẾT GIỜ CHO HỌC SINH */}
                    {!hasAnswered && timeLeft > 0 ? (
                        <Box flex={1} display="flex" flexDirection="column" gap={2}>
                            {currentQuestion.type === 'MCQ' && currentQuestion.options.map((opt, idx) => (
                                <Button key={idx} fullWidth variant="contained" onClick={() => handleMCQAnswer(idx)} sx={{ bgcolor: colorPalette[idx], '&:hover': { bgcolor: colorPalette[idx], filter: 'brightness(0.9)' }, justifyContent: 'flex-start', borderRadius: 3, p: 2, gap: 2, textTransform: 'none' }}>
                                    <Typography variant="h5" fontWeight="bold">{shapes[idx]}</Typography>
                                    <Typography variant="body1" fontWeight="bold" fontSize="1.1rem" textAlign="left">
                                        {String.fromCharCode(65 + idx)}. <Latex delimiters={latexDelimiters}>{formatLatexText(opt)}</Latex>
                                    </Typography>
                                </Button>
                            ))}

                            {currentQuestion.type === 'TF' && (
                                <Box display="flex" flexDirection="column" gap={1.5}>
                                    {currentQuestion.options.map((opt, idx) => (
                                        <Paper key={idx} sx={{ p: 2, borderRadius: 2, borderLeft: '5px solid #3498db' }}>
                                            <Typography variant="body1" mb={1} fontWeight="bold" sx={{ lineHeight: 1.5 }}>
                                                Ý {String.fromCharCode(65 + idx)}: <Latex delimiters={latexDelimiters}>{formatLatexText(opt)}</Latex>
                                            </Typography>
                                            <FormControl component="fieldset">
                                                <RadioGroup row value={tfAnswers[idx] || ''} onChange={(e) => setTfAnswers({...tfAnswers, [idx]: e.target.value})}>
                                                    <FormControlLabel value="T" control={<Radio color="success"/>} label={<Typography color="green" fontWeight="bold">Đúng</Typography>} />
                                                    <FormControlLabel value="F" control={<Radio color="error"/>} label={<Typography color="red" fontWeight="bold">Sai</Typography>} />
                                                </RadioGroup>
                                            </FormControl>
                                        </Paper>
                                    ))}
                                    <Button variant="contained" size="large" endIcon={<SendIcon />} onClick={handleTFSubmit} sx={{ mt: 2, py: 2, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: 3, bgcolor: '#8e44ad' }}>CHỐT ĐÁP ÁN</Button>
                                </Box>
                            )}

                            {currentQuestion.type === 'SHORT' && (
                                <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center', mt: 2, border: '2px solid #27ae60' }}>
                                    <Typography variant="h6" mb={2} color="textSecondary">Nhập kết quả của bạn:</Typography>
                                    <TextField fullWidth variant="outlined" placeholder="VD: 12.5 hoặc -5" value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} inputProps={{ style: { textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }, inputMode: 'numeric' }} sx={{ mb: 3 }} />
                                    <Button fullWidth variant="contained" size="large" endIcon={<SendIcon />} onClick={handleShortAnswerSubmit} sx={{ py: 2, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: 3, bgcolor: '#27ae60' }}>GỬI KẾT QUẢ</Button>
                                </Paper>
                            )}
                        </Box>
                    ) : (
                        <Paper sx={{ 
                            p: 5, textAlign: 'center', borderRadius: 3, mt: 5, 
                            bgcolor: timeLeft === 0 ? '#e74c3c' : '#ecf0f1', 
                            color: timeLeft === 0 ? 'white' : 'inherit' 
                        }}>
                            <Typography variant="h4" mb={2}>{timeLeft === 0 ? '⏰' : '⏳'}</Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {timeLeft === 0 ? "HẾT GIỜ!" : "Đã ghi nhận đáp án!"}
                            </Typography>
                            {timeLeft === 0 && (
                                <Typography variant="h6" mt={3} fontWeight="bold" sx={{ animation: 'pulse 2s infinite' }}>
                                    👀 Hãy nhìn lên màn hình của Giáo viên để xem đáp án nhé!
                                </Typography>
                            )}
                        </Paper>
                    )}
                </Box>
            )}

            {status === 'podium' && (
                <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={3} bgcolor="#2c3e50" color="white">
                    <Typography variant="h3" fontWeight="900" color="#f1c40f">KẾT THÚC!</Typography>
                    <Typography variant="h5">Tổng điểm của bạn:</Typography>
                    <Typography variant="h1" fontWeight="900" color="#2ecc71">{score}</Typography>
                    <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', mt: 4 }} onClick={() => navigate('/arena')}>Rời phòng</Button>
                </Box>
            )}
        </Box>
    );
}

export default ArenaPlayer;