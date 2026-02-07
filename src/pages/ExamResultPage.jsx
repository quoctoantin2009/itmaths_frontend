import React, { useEffect, useState } from 'react';
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

// 1. IMPORT THƯ VIỆN TOÁN & CÁC STYLE
import Latex from 'react-latex-next'; // 🔥 Dùng thư viện giống QuestionCard
import 'katex/dist/katex.min.css';

// --- HÀM XỬ LÝ NỘI DUNG (COPY TỪ QUESTION CARD) ---
// Hàm này giúp hiển thị đúng cả Latex và Thẻ ảnh HTML
const processContent = (content) => {
    if (!content) return "";
    
    // 1. Xử lý các lỗi ký hiệu LaTeX phổ biến & Thay thế bullet
    let cleanContent = content
        .replaceAll('\\bullet', '•') 
        .replaceAll('begin{eqnarray*}', 'begin{aligned}')
        .replaceAll('end{eqnarray*}', 'end{aligned}')
        .replaceAll('begin{eqnarray}', 'begin{aligned}')
        .replaceAll('end{eqnarray}', 'end{aligned}');

    // 2. Tách Toán học và Văn bản
    const mathRegex = /((?<!\\)\$\$.*?(?<!\\)\$\$|(?<!\\)\$.*?(?<!\\)\$|\\begin\{.*?\}.*?\\end\{.*?\}|\\\[[\s\S]*?\\\])/gs;
    const parts = cleanContent.split(mathRegex);

    return (
        <span style={{fontWeight: '400 !important'}}>
            {parts.map((part, index) => {
                if (!part) return null;

                const isMath = /^\$|^\$\.|^\\begin|^\\\[/.test(part.trim());

                if (isMath) {
                    return <Latex key={index}>{part}</Latex>;
                } else {
                    // Xử lý thẻ HTML <img> do Python Tool gửi lên
                    const imgRegex = /<img src='(.*?)' style='(.*?)' \/>/g;
                    const subParts = part.split(imgRegex);

                    if (subParts.length === 1) {
                        return renderTextWithFormatting(part, index);
                    }

                    let elements = [];
                    for (let i = 0; i < subParts.length; i += 3) {
                        // Phần Text
                        if (subParts[i]) {
                            elements.push(renderTextWithFormatting(subParts[i], `${index}-txt-${i}`));
                        }
                        // Phần Ảnh (nếu có)
                        if (i + 1 < subParts.length) {
                            const src = subParts[i+1];
                            const styleObj = { maxWidth: '100%', display: 'block', margin: '10px auto', borderRadius: '4px' };
                            
                            elements.push(
                                <img 
                                    key={`${index}-img-${i}`}
                                    src={src} 
                                    style={styleObj} 
                                    alt="Minh họa"
                                />
                            );
                        }
                    }
                    return <React.Fragment key={index}>{elements}</React.Fragment>;
                }
            })}
        </span>
    );
};

// Hàm phụ: Xử lý xuống dòng (\n) và in đậm (\textbf)
const renderTextWithFormatting = (text, keyPrefix) => {
    const textLines = text.split('\n');
    return (
        <React.Fragment key={keyPrefix}>
            {textLines.map((line, lineIdx) => {
                const boldParts = line.split(/\\textbf\{(.*?)\}/g);
                return (
                    <React.Fragment key={`${keyPrefix}-${lineIdx}`}>
                        {boldParts.map((bPart, bIdx) => {
                            if (bIdx % 2 === 1) return <strong key={bIdx}>{bPart}</strong>;
                            return <span key={bIdx}>{bPart}</span>;
                        })}
                        {lineIdx < textLines.length - 1 && <br />}
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
};

const ExamResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Style cho vùng chứa nội dung (để scroll nếu tràn)
    const scrollableContainerStyle = {
        overflowX: 'auto',
        overflowY: 'hidden',
        maxWidth: '100%',
        paddingBottom: '5px'
    };

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

    if (loading) return <Box textAlign="center" mt={10}><CircularProgress /></Box>;
    if (!result) return <Box textAlign="center" mt={10}><Typography>Không tìm thấy kết quả.</Typography></Box>;

    let userAnswers = {};
    try {
        userAnswers = typeof result.detail_answers === 'string' 
            ? JSON.parse(result.detail_answers) 
            : result.detail_answers;
    } catch (e) { userAnswers = {}; }

    return (
        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            
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
                
                // --- Logic kiểm tra đáp án ---
                if (q.question_type === 'MCQ') {
                    const userSelectedChoice = q.choices.find(c => c.content === userChoiceKey);
                    if (userSelectedChoice && userSelectedChoice.is_correct) isCorrect = true;
                } 
                else if (q.question_type === 'SHORT') {
                    // Logic check câu trả lời ngắn (đơn giản)
                    try {
                        const u = parseFloat(String(userChoiceKey).replace(',', '.'));
                        const c = parseFloat(String(q.short_answer_correct).replace(',', '.'));
                        if (Math.abs(u - c) < 0.001) isCorrect = true;
                    } catch(e) {}
                }
                // (Có thể bổ sung logic TF nếu cần)

                return (
                    <Card key={q.id} sx={{ mb: 2, p: 2, borderRadius: 2, borderLeft: isCorrect ? '5px solid #2e7d32' : '5px solid #d32f2f' }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography fontWeight="bold">Câu {index + 1}:</Typography>
                            {isCorrect 
                                ? <Chip icon={<CheckCircleIcon />} label="Đúng" color="success" size="small" />
                                : <Chip icon={<CancelIcon />} label="Sai" color="error" size="small" />
                            }
                        </Box>
                        
                        {/* 🔥 HIỂN THỊ NỘI DUNG CÂU HỎI (Dùng hàm processContent) */}
                        <div style={{ marginBottom: '15px', fontSize: '1rem', ...scrollableContainerStyle }}>
                            {processContent(q.content)}
                        </div>
                        
                        {/* Ảnh đính kèm (nếu có trường image riêng) */}
                        {q.image && <img src={q.image} alt="Question" style={{maxWidth: '100%', marginBottom: 15, borderRadius: 8}}/>}

                        {/* --- HIỂN THỊ ĐÁP ÁN --- */}
                        <Box>
                            {q.question_type === 'MCQ' && q.choices.map((choice) => {
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
                                        display: 'flex', alignItems: 'center',
                                        ...scrollableContainerStyle
                                    }}>
                                        <span style={{fontWeight: 'bold', marginRight: '8px'}}>{choice.label}.</span>
                                        {/* 🔥 Hiển thị nội dung đáp án qua processContent */}
                                        <div style={{flex: 1}}>{processContent(choice.content)}</div>
                                        
                                        {isUserSelected && <span style={{marginLeft: 8, fontSize: '0.8rem', whiteSpace:'nowrap'}}>(Bạn chọn)</span>}
                                        {isTrueAnswer && <span style={{marginLeft: 8}}>✅</span>}
                                    </Box>
                                );
                            })}

                            {q.question_type === 'SHORT' && (
                                <Box sx={{mt: 1}}>
                                    <Typography>Bạn trả lời: <strong>{userChoiceKey || "Chưa trả lời"}</strong></Typography>
                                    <Typography color="success.main">Đáp án đúng: <strong>{q.short_answer_correct}</strong></Typography>
                                </Box>
                            )}
                        </Box>
                        
                        {/* 🔥 HIỂN THỊ LỜI GIẢI (Dùng processContent) */}
                        {q.solution && (
                            <Box mt={2} p={2} bgcolor="#fffde7" borderRadius={2} border="1px dashed #fbc02d">
                                <Typography variant="subtitle2" fontWeight="bold" color="#f57f17" mb={1}>💡 Lời giải chi tiết:</Typography>
                                <div style={{...scrollableContainerStyle}}>
                                    {processContent(q.solution)}
                                </div>
                            </Box>
                        )}
                    </Card>
                );
            })}
        </Container>
    );
};

export default ExamResultPage;