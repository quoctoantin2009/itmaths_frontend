import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import { 
    Container, Typography, Box, Paper, Button, Grid, 
    CircularProgress, Chip, Divider, Card 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

const ExamResultPage = () => {
    const { id } = useParams(); // Lấy ID kết quả từ URL
    const navigate = useNavigate();
    
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy thông tin kết quả thi
                const resResult = await axiosClient.get(`/history/${id}/`);
                setResult(resResult.data);

                // 2. Lấy danh sách câu hỏi của đề thi này để hiển thị lại
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

    if (loading) return <Box textAlign="center" mt={10}><CircularProgress /></Box>;
    if (!result) return <Box textAlign="center" mt={10}><Typography>Không tìm thấy kết quả.</Typography></Box>;

    // Parse chi tiết đáp án người dùng đã chọn (JSON string -> Object)
    let userAnswers = {};
    try {
        userAnswers = typeof result.detail_answers === 'string' 
            ? JSON.parse(result.detail_answers) 
            : result.detail_answers;
    } catch (e) { userAnswers = {}; }

    return (
        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            
            {/* Header điều hướng */}
            <Box display="flex" gap={2} mb={3}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Quay lại</Button>
                <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>Trang chủ</Button>
            </Box>

            {/* Thẻ Điểm Số Tổng Quan */}
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

            {/* Danh sách chi tiết câu hỏi */}
            <Typography variant="h6" fontWeight="bold" mb={2}>CHI TIẾT BÀI LÀM:</Typography>
            
            {questions.map((q, index) => {
                const userChoiceKey = userAnswers[q.id]; // Ví dụ: "A" hoặc "true"
                // Logic xác định đúng sai (đơn giản hóa cho MCQ)
                let isCorrect = false;
                let correctLabel = "";
                
                // Tìm đáp án đúng trong danh sách choices
                const correctChoice = q.choices.find(c => c.is_correct);
                if (correctChoice) correctLabel = correctChoice.label; // Ví dụ "B"

                // Kiểm tra xem user chọn có trùng với đáp án đúng không
                if (q.question_type === 'MCQ') {
                    // Cần so sánh nội dung hoặc label tùy vào cách lưu backend
                    // Ở đây giả sử backend lưu text đáp án, ta so sánh text
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
                        
                        {/* Nội dung câu hỏi (có thể chứa LaTeX) */}
                        <Typography variant="body1" mb={2} dangerouslySetInnerHTML={{__html: q.content}}></Typography>
                        {q.image && <img src={q.image} alt="Question" style={{maxWidth: '100%', marginBottom: 10, borderRadius: 8}}/>}

                        {/* Các lựa chọn */}
                        <Box>
                            {q.choices.map((choice) => {
                                const isUserSelected = (choice.content === userChoiceKey);
                                const isTrueAnswer = choice.is_correct;
                                
                                let optionBg = 'transparent';
                                let optionColor = 'inherit';
                                let fontWeight = 'normal';

                                if (isTrueAnswer) {
                                    optionBg = '#e8f5e9'; // Xanh nhạt cho đáp án đúng
                                    optionColor = '#2e7d32';
                                    fontWeight = 'bold';
                                }
                                if (isUserSelected && !isTrueAnswer) {
                                    optionBg = '#ffebee'; // Đỏ nhạt cho câu sai user chọn
                                    optionColor = '#d32f2f';
                                }

                                return (
                                    <Box key={choice.id} sx={{ 
                                        p: 1, my: 0.5, borderRadius: 1, 
                                        bgcolor: optionBg, color: optionColor, fontWeight: fontWeight,
                                        border: isUserSelected ? '1px solid currentColor' : '1px solid #eee'
                                    }}>
                                        {choice.label}. {choice.content} 
                                        {isUserSelected && " (Bạn chọn)"}
                                        {isTrueAnswer && " ✅"}
                                    </Box>
                                );
                            })}
                        </Box>
                        
                        {/* Lời giải chi tiết (chỉ hiện khi xem lại) */}
                        {q.solution && (
                            <Box mt={2} p={2} bgcolor="#f0f4c3" borderRadius={2}>
                                <Typography variant="subtitle2" fontWeight="bold">💡 Lời giải:</Typography>
                                <Typography variant="body2">{q.solution}</Typography>
                            </Box>
                        )}
                    </Card>
                );
            })}
        </Container>
    );
};

export default ExamResultPage;