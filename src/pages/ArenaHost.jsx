import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { 
    Box, Typography, Button, Grid, Paper, Chip, IconButton,
    Radio, RadioGroup, FormControlLabel, FormControl 
} from '@mui/material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import QRCode from 'react-qr-code';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const getWSUrl = () => {
    const isLocal = window.location.hostname === 'localhost';
    const backendHost = isLocal ? '127.0.0.1:8000' : 'api.itmaths.vn';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${backendHost}/ws/arena/`;
};

const colorPalette = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const shapes = ['▲', '◆', '●', '■'];

const latexDelimiters = [
    {left: '$$', right: '$$', display: true},
    {left: '$', right: '$', display: false},
    {left: '\\(', right: '\\)', display: false},
    {left: '\\[', right: '\\]', display: true},
];

const formatLatexText = (text) => {
    if (text === null || text === undefined) return "";
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

// 🟢 BỘ RENDER ĐÃ ĐƯỢC BỌC KHIÊN BẢO VỆ 
const RenderSmartContent = ({ text }) => {
    if (text === null || text === undefined) return null;
    const safeText = String(text);
    const parts = safeText.split(/\[IMG:(.*?)\]/g);
    
    return (
        <Box sx={{ textAlign: 'left', display: 'inline-block', width: '100%' }}>
            {parts.map((part, idx) => {
                if (idx % 2 === 1) {
                    return <Box key={idx} component="img" src={part} alt="Minh hoạ" sx={{ maxWidth: '100%', maxHeight: '250px', borderRadius: 2, display: 'block', mx: 'auto', my: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />;
                } 
                else if (part.trim()) {
                    return <Latex key={idx} delimiters={latexDelimiters}>{formatLatexText(part)}</Latex>;
                }
                return null;
            })}
        </Box>
    );
};

function ArenaHost() {
    const { pin } = useParams();
    const navigate = useNavigate();
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(`${getWSUrl()}${pin}/`);

    const [status, setStatus] = useState('waiting'); 
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQIdx, setCurrentQIdx] = useState(-1);
    const [timeLeft, setTimeLeft] = useState(0);
    const [hostTfAnswers, setHostTfAnswers] = useState({});

    const [isMuted, setIsMuted] = useState(true); 
    const audioRef = useRef(new Audio()); 

    useEffect(() => {
        if (lastJsonMessage) {
            const { event, player_name, score_earned, question, current_index, time_limit } = lastJsonMessage;

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
                setTimeLeft(time_limit || 20); 
                setStatus('playing');
                setHostTfAnswers({}); 
            }
            else if (event === 'game_ended') {
                setStatus('podium');
            }
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if (status === 'playing' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, status]);

    useEffect(() => {
        let audioFile = '';
        if (status === 'waiting') audioFile = '/sound/lobby.mp3';
        else if (status === 'playing') audioFile = '/sound/countdown.mp3';
        else if (status === 'podium') audioFile = '/sound/podium.mp3';

        if (audioFile) {
            audioRef.current.src = audioFile;
            audioRef.current.loop = (status !== 'podium');
            if (!isMuted) audioRef.current.play().catch(e => console.log(e));
        } else {
            audioRef.current.pause();
        }
    }, [status, isMuted]); 

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        audioRef.current.muted = newMutedState;
        if (!newMutedState && audioRef.current.paused && audioRef.current.src) {
            audioRef.current.play().catch(e => console.log(e));
        }
    };

    useEffect(() => { return () => { if (audioRef.current) audioRef.current.pause(); }; }, []);

    const handleStartGame = () => {
        sendJsonMessage({ action: 'broadcast', event: 'game_started' }); 
        setTimeout(() => { sendJsonMessage({ action: 'host_next_question' }); }, 3000);
    };

    const handleNextQuestion = () => sendJsonMessage({ action: 'host_next_question' });

    const isLongTextMCQ = currentQuestion?.type === 'MCQ' 
        ? currentQuestion.options?.some(opt => opt.length > 45) : false;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#2c3e50', color: 'white', p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">ITMaths Host</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" color={isMuted ? 'gray' : '#2ecc71'}>
                        {isMuted ? 'Chạm để Bật Nhạc ➔' : 'Đang phát nhạc'}
                    </Typography>
                    <IconButton onClick={toggleMute} sx={{ color: 'white', bgcolor: isMuted ? 'rgba(231, 76, 60, 0.8)' : 'rgba(46, 204, 113, 0.8)', '&:hover': { filter: 'brightness(1.2)' }, width: 50, height: 50 }}>
                        {isMuted ? <VolumeOffIcon fontSize="large" /> : <VolumeUpIcon fontSize="large" />}
                    </IconButton>
                    <Chip label={`Sĩ số: ${players.length}`} color="warning" sx={{ fontSize: '1.2rem', fontWeight: 'bold', p: 2 }} />
                </Box>
            </Box>

            {status === 'waiting' && (
                <Box textAlign="center" flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Grid container spacing={4} justifyContent="center" alignItems="center" mb={5} maxWidth="800px">
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 4, bgcolor: '#f1c40f', borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="h5" color="#333" fontWeight="bold" mb={2}>Mã PIN Tham Gia</Typography>
                                <Typography variant="h1" fontWeight="900" color="black" sx={{ letterSpacing: '10px', fontSize: { xs: '4rem', md: '5rem' } }}>{pin}</Typography>
                                <Typography variant="body1" color="#333" mt={2} fontWeight="bold">Truy cập: itmaths.vn</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                <Typography variant="h6" color="#333" fontWeight="bold" mb={2}>Quét để vào ngay</Typography>
                                <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 2 }}>
                                    <QRCode value={`https://itmaths.vn/#/arena/play/${pin}`} size={180} level="H" />
                                </Box>
                                <Typography variant="body2" color="gray" mt={2}>(Hỗ trợ App & Trình duyệt Web)</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                    <Button variant="contained" color="success" size="large" startIcon={<PlayCircleFilledWhiteIcon />} onClick={handleStartGame} disabled={players.length === 0} sx={{ fontSize: '1.5rem', py: 2, px: 5, borderRadius: 10, boxShadow: '0 0 20px rgba(46, 204, 113, 0.6)' }}>
                        BẮT ĐẦU TRẬN ĐẤU
                    </Button>
                    <Grid container spacing={2} mt={5} justifyContent="center" maxWidth="800px">
                        {players.map((p, idx) => (
                            <Grid item key={idx}><Typography variant="h5" sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 3, py: 1, borderRadius: 2, fontWeight: 'bold' }}>{p.name}</Typography></Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {status === 'playing' && currentQuestion && (
                <Box textAlign="center" flex={1} display="flex" flexDirection="column">
                    <Box display="flex" justifyContent="center" alignItems="center" position="relative" mb={2}>
                        <Typography variant="h4" color="#bdc3c7">Câu hỏi số {currentQIdx + 1}</Typography>
                        <Box sx={{ position: 'absolute', right: 0, width: 80, height: 80, borderRadius: '50%', bgcolor: timeLeft <= 5 ? '#e74c3c' : '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.3)', transition: 'background-color 0.3s' }}>
                            <Typography variant="h3" fontWeight="bold" color="white">{timeLeft}</Typography>
                        </Box>
                    </Box>
                    
                    <Paper sx={{ p: 4, mb: 4, mt: 2, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h4" color="black" fontWeight="bold" sx={{ lineHeight: 1.5, width: '100%' }}>
                            <RenderSmartContent text={currentQuestion.text} />
                        </Typography>
                    </Paper>
                    
                    <Box flex={1} maxWidth="1000px" width="100%" mx="auto">
                        
                        {/* Dùng toán tử ?. bảo vệ vòng lặp */}
                        {currentQuestion.type === 'MCQ' && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: isLongTextMCQ ? '1fr' : 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
                                {currentQuestion.options?.map((opt, idx) => (
                                    <Paper key={idx} sx={{ p: 3, bgcolor: colorPalette[idx], color: 'white', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3, minHeight: '100px' }}>
                                        <Typography variant="h3" fontWeight="bold" sx={{ minWidth: '40px' }}>{shapes[idx]}</Typography>
                                        <Typography variant="h5" fontWeight="bold" textAlign="left" sx={{ flex: 1, wordBreak: 'break-word', width: '100%' }}>
                                            {String.fromCharCode(65 + idx)}. <RenderSmartContent text={opt} />
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        )}

                        {currentQuestion.type === 'TF' && (
                            <Box display="flex" flexDirection="column" gap={2} mb={4}>
                                {currentQuestion.options?.map((opt, idx) => (
                                    <Paper key={idx} sx={{ p: 2, px: 4, borderRadius: 2, borderLeft: '10px solid #3498db', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h5" fontWeight="bold" color="black" textAlign="left" sx={{ flex: 1, width: '100%' }}>
                                            Ý {String.fromCharCode(65 + idx)}: <RenderSmartContent text={opt} />
                                        </Typography>
                                        <FormControl component="fieldset">
                                            <RadioGroup row value={hostTfAnswers[idx] || ''} onChange={(e) => setHostTfAnswers({...hostTfAnswers, [idx]: e.target.value})}>
                                                <FormControlLabel value="T" control={<Radio color="success" size="medium"/>} label={<Typography color="green" fontWeight="bold" fontSize="1.2rem">Đúng</Typography>} />
                                                <FormControlLabel value="F" control={<Radio color="error" size="medium"/>} label={<Typography color="red" fontWeight="bold" fontSize="1.2rem">Sai</Typography>} />
                                            </RadioGroup>
                                        </FormControl>
                                    </Paper>
                                ))}
                            </Box>
                        )}

                        {timeLeft === 0 && (
                            <Paper sx={{ 
                                p: 3, mb: 4, bgcolor: 'white', border: '3px solid #2ecc71', 
                                borderRadius: 3, textAlign: 'left', boxShadow: '0 0 20px rgba(46, 204, 113, 0.4)' 
                            }}>
                                <Typography variant="h5" color="#27ae60" fontWeight="900" mb={2}>
                                    💡 ĐÁP ÁN & LỜI GIẢI CHI TIẾT:
                                </Typography>
                                <Typography variant="h5" color="black" sx={{ lineHeight: 1.6, fontWeight: '500', width: '100%' }}>
                                    {currentQuestion.explanation ? (
                                        <RenderSmartContent text={currentQuestion.explanation} />
                                    ) : (
                                        "👉 Mời Giáo viên phân tích và giải thích đáp án cho học sinh..."
                                    )}
                                </Typography>
                            </Paper>
                        )}
                    </Box>

                    <Box mt="auto" pb={4}>
                        {timeLeft === 0 && (
                            <Button 
                                variant="contained" color="secondary" size="large" endIcon={<SkipNextIcon />} 
                                onClick={handleNextQuestion} 
                                sx={{ fontSize: '1.2rem', py: 2, px: 5, borderRadius: 5, mb: 4, animation: 'pulse 2s infinite' }}
                            >
                                CHUYỂN SANG CÂU TIẾP THEO
                            </Button>
                        )}
                        <Box maxWidth="600px" mx="auto" textAlign="left" bgcolor="rgba(0,0,0,0.3)" p={3} borderRadius={3}>
                            <Typography variant="h6" color="#f1c40f" mb={2}>Bảng điểm trực tiếp:</Typography>
                            {players.sort((a,b) => b.score - a.score).map((p, i) => (
                                <Box key={i} display="flex" justifyContent="space-between" borderBottom="1px solid rgba(255,255,255,0.1)" py={1}>
                                    <Typography variant="h6">#{i+1} {p.name}</Typography>
                                    <Typography variant="h6" fontWeight="bold">{p.score} điểm</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}

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
                    <Button variant="outlined" color="inherit" sx={{ mt: 5 }} onClick={() => navigate('/arena')}>Thoát Đấu Trường</Button>
                </Box>
            )}
        </Box>
    );
}

export default ArenaHost;