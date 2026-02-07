import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import { 
    Container, Typography, Box, Paper, Button, Grid, 
    CircularProgress, Chip, Card 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

// 1. IMPORT THƯ VIỆN TOÁN (KATEX)
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/dist/contrib/auto-render';

const ExamResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const contentRef = useRef(null); // Ref để vùng chứa nội dung cần render Latex
    
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. TẢI DỮ LIỆU ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resResult = await axiosClient.get(`/history/${id}/`);
                setResult(resResult.data);

                if (resResult.data.exam) {
                    const resQuestions = await axiosClient.get(`/exams/${resResult.data.exam}/questions/`);
                    setQuestions(resQuestions.data);
                }
            } catch (error) {
                console.error("Lỗi tải kết quả:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- 2. KÍCH HOẠT KATEX SAU KHI RENDER XONG ---
    useEffect(() => {
        if (!loading && contentRef.current) {
            try {
                renderMathInElement(contentRef.current, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            } catch (e) {
                console.error("Lỗi render Katex:", e);
            }
        }
    }, [loading, questions]); 

    if (loading) return <Box textAlign="center" mt={10}><CircularProgress /></Box>;
    if (!result) return <Box textAlign="center" mt={10}><Typography>Không tìm thấy kết quả.</Typography></Box>;

    let userAnswers = {};
    try {
        userAnswers = typeof result.detail_answers === 'string' 
            ? JSON.parse(result.detail_answers) 
            : result.detail_answers;
    } catch (e) { userAnswers = {}; }

    return (
        <Container maxWidth="md" ref={contentRef} sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            
            {/* Header */}
            <Box display="flex" gap={2} mb={3}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Quay lại</Button>
                <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>Trang chủ</Button>
            </Box>

            {/* Bảng điểm tổng quan */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(to right, #ffffff, #f3e5f5)' }}>
                <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                    KẾT QUẢ BÀI THI: {result.exam_title}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    Học sinh: <strong>{result.student_name}</strong>
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item>
                        <Box sx={{ p: 2, border: '2px solid #1976d2', borderRadius: 2, minWidth: 120 }}>
                            <Typography variant="h3" fontWeight="bold" color="#1976d2">{result.score}</Typography>
                            <Typography variant="caption">ĐIỂM SỐ</Typography>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, minWidth: 120, bgcolor: 'white' }}>
                            <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                                {result.correct_answers}/{result.total_questions}
                            </Typography>
                            <Typography variant="caption">SỐ CÂU ĐÚNG</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h6" fontWeight="bold" mb={2}>CHI TIẾT BÀI LÀM:</Typography>
            
            {questions.map((q, index) => {
                const userChoiceKey = userAnswers[q.id]; 
                let isCorrect = false;
                
                if (q.question_type === 'MCQ') {
                    const userSelectedChoice = q.choices.find(c => c.content === userChoiceKey);
                    if (userSelectedChoice && userSelectedChoice.is_correct) isCorrect = true;
                }

                return (
                    <Card key={q.id} sx={{ mb: 2, p: 2, borderRadius: 2, borderLeft: isCorrect ? '5px solid #2e7d32' : '5px solid #d32f2f' }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography fontWeight="bold">Câu {index + 1}:</Typography>
                            {isCorrect 
                                ? <Chip icon={<CheckCircleIcon />} label="Đúng" color="success" size="small" />
                                : <Chip icon={<CancelIcon />} label="Sai" color="error" size="small" />
                            }
                        </Box>
                        
                        {/* 🔥 3. PHẦN QUAN TRỌNG: Render HTML chuẩn (Cho phép hiện ảnh & Latex) */}
                        <div 
                            className="question-content"
                            style={{marginBottom: '15px', fontSize: '1rem', lineHeight: '1.6'}}
                            dangerouslySetInnerHTML={{__html: q.content}} 
                        />
                        
                        {/* Nếu có ảnh đính kèm riêng (trường image của model) */}
                        {q.image && <img src={q.image} alt="Question" style={{maxWidth: '100%', marginBottom: 15, borderRadius: 8}}/>}

                        <Box>
                            {q.choices.map((choice) => {
                                const isUserSelected = (choice.content === userChoiceKey);
                                const isTrueAnswer = choice.is_correct;
                                
                                let optionBg = 'transparent';
                                let optionColor = 'inherit';
                                let fontWeight = 'normal';

                                if (isTrueAnswer) { optionBg = '#e8f5e9'; optionColor = '#2e7d32'; fontWeight = 'bold'; }
                                if (isUserSelected && !isTrueAnswer) { optionBg = '#ffebee'; optionColor = '#d32f2f'; }

                                return (
                                    <Box key={choice.id} sx={{ 
                                        p: 1, my: 0.5, borderRadius: 1, 
                                        bgcolor: optionBg, color: optionColor, fontWeight: fontWeight,
                                        border: isUserSelected ? '1px solid currentColor' : '1px solid #eee',
                                        display: 'flex', alignItems: 'center'
                                    }}>
                                        <span style={{fontWeight: 'bold', marginRight: '8px'}}>{choice.label}.</span>
                                        
                                        {/* 🔥 Render nội dung đáp án (có thể chứa Latex) */}
                                        <span dangerouslySetInnerHTML={{__html: choice.content}} />
                                        
                                        {isUserSelected && <span style={{marginLeft: 8, fontSize: '0.8rem'}}>(Bạn chọn)</span>}
                                        {isTrueAnswer && <span style={{marginLeft: 8}}>✅</span>}
                                    </Box>
                                );
                            })}
                        </Box>
                        
                        {/* 🔥 Render Lời giải chi tiết (Hiển thị ảnh và Latex) */}
                        {q.solution && (
                            <Box mt={2} p={2} bgcolor="#fffde7" borderRadius={2} border="1px dashed #fbc02d">
                                <Typography variant="subtitle2" fontWeight="bold" color="#f57f17" mb={1}>💡 Lời giải chi tiết:</Typography>
                                <div 
                                    style={{lineHeight: 1.6}}
                                    dangerouslySetInnerHTML={{__html: q.solution}} 
                                />
                            </Box>
                        )}
                    </Card>
                );
            })}
        </Container>
    );
};

export default ExamResultPage;