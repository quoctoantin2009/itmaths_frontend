import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import { 
    Container, Typography, Box, Paper, Button, 
    CircularProgress, Chip, Card, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Grid, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

// --- HÀM XỬ LÝ HIỂN THỊ NỘI DUNG (ĐÃ SỬA LỖI IN ĐẬM) ---
const processContent = (content) => {
    if (!content) return "";
    
    // 1. Chuẩn hóa ký tự đặc biệt
    let cleanContent = content
        .replaceAll('\\bullet', '•') 
        .replaceAll('begin{eqnarray*}', 'begin{aligned}')
        .replaceAll('end{eqnarray*}', 'end{aligned}');

    // 2. Tách LaTeX và Văn bản
    // Regex này bắt: $...$, $$...$$, \[...\], \begin{}...\end{}
    const mathRegex = /((?<!\\)\$\$.*?(?<!\\)\$\$|(?<!\\)\$.*?(?<!\\)\$|\\begin\{.*?\}.*?\\end\{.*?\}|\\\[[\s\S]*?\\\])/gs;
    const parts = cleanContent.split(mathRegex);

    return (
        <span style={{ fontWeight: 400, fontSize: '1rem', lineHeight: 1.6 }}>
            {parts.map((part, index) => {
                if (!part) return null;
                
                // Kiểm tra xem phần này có phải là công thức Toán không
                const isMath = /^\$|^\$\.|^\\begin|^\\\[/.test(part.trim());
                if (isMath) return <Latex key={index}>{part}</Latex>;

                // Nếu là văn bản thường: Xử lý hình ảnh và in đậm
                return renderTextPart(part, index);
            })}
        </span>
    );
};

// Hàm con xử lý in đậm và hình ảnh trong văn bản thường
const renderTextPart = (text, keyPrefix) => {
    // Tách ảnh trước <img ... />
    const imgRegex = /<img src='(.*?)' style='(.*?)' \/>/g;
    const subParts = text.split(imgRegex);

    if (subParts.length === 1) return formatBold(text, keyPrefix);

    let elements = [];
    for (let i = 0; i < subParts.length; i += 3) {
        if (subParts[i]) elements.push(formatBold(subParts[i], `${keyPrefix}-txt-${i}`));
        if (i + 1 < subParts.length) {
            elements.push(
                <img 
                    key={`${keyPrefix}-img-${i}`} 
                    src={subParts[i+1]} 
                    style={{ maxWidth: '100%', display: 'block', margin: '10px auto', borderRadius: '8px', border: '1px solid #ddd' }} 
                    alt="question-img" 
                />
            );
        }
    }
    return <React.Fragment key={keyPrefix}>{elements}</React.Fragment>;
};

// Hàm xử lý in đậm \textbf{...} - Chỉ in đậm khi có lệnh rõ ràng
const formatBold = (text, key) => {
    // Regex bắt \textbf{...} một cách an toàn hơn
    const parts = text.split(/\\textbf\{(.*?)\}/g);
    return (
        <span key={key}>
            {parts.map((part, i) => {
                // Phần lẻ là nội dung trong \textbf{} -> In đậm
                if (i % 2 === 1) return <strong key={i} style={{ fontWeight: 700 }}>{part}</strong>;
                return <span key={i} style={{ fontWeight: 400 }}>{part}</span>;
            })}
        </span>
    );
};

const ExamResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Gọi API lấy lịch sử (Backend đã tính toán sẵn điểm breakdown và chi tiết câu hỏi)
                const res = await axiosClient.get(`/history/${id}/`);
                setResult(res.data);
            } catch (error) { 
                console.error("Lỗi tải bài làm:", error);
                alert("Không thể tải chi tiết bài làm này.");
                navigate('/');
            } finally { 
                setLoading(false); 
            }
        };
        fetchData();
    }, [id, navigate]);

    if (loading) return <Box textAlign="center" mt={10}><CircularProgress /><Typography mt={2}>Đang tải kết quả...</Typography></Box>;
    if (!result) return null;

    // 1. Lấy điểm chi tiết từ Backend trả về (không tự tính nữa)
    const breakdown = result.score_breakdown || { mcq: 0, tf: 0, short: 0 };
    
    // 2. Lấy danh sách câu hỏi chi tiết từ Backend (đã kèm user_answer)
    // Nếu Backend chưa trả về exam_details (do cache), fallback về mảng rỗng để tránh lỗi
    const questions = result.exam_details || [];

    return (
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            {/* Header Navigation */}
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Quay lại</Button>
                <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>Trang chủ</Button>
            </Box>

            {/* BẢNG ĐIỂM TỔNG HỢP (Lấy trực tiếp từ Backend) */}
            <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ bgcolor: '#e8f5e9', p: 2, textAlign: 'center', borderBottom: '1px solid #c8e6c9' }}>
                    <Typography variant="h6" fontWeight="bold" color="#2e7d32">KẾT QUẢ CHI TIẾT</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Phần I (Trắc nghiệm)</TableCell>
                                <TableCell align="right"><b>{breakdown.mcq.toFixed(2)}</b> điểm</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Phần II (Đúng/Sai)</TableCell>
                                <TableCell align="right"><b>{breakdown.tf.toFixed(2)}</b> điểm</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Phần III (Điền đáp án)</TableCell>
                                <TableCell align="right"><b>{breakdown.short.toFixed(2)}</b> điểm</TableCell>
                            </TableRow>
                            <TableRow sx={{ bgcolor: '#fff9c4' }}>
                                <TableCell><b>TỔNG ĐIỂM</b></TableCell>
                                <TableCell align="right">
                                    <Typography variant="h4" fontWeight="bold" color="#d32f2f">
                                        {result.score.toFixed(2)}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* DANH SÁCH CÂU HỎI VÀ LỜI GIẢI */}
            {questions.map((q, index) => (
                <Card key={q.id} sx={{ mb: 3, p: 3, borderRadius: 2, borderLeft: '5px solid #1976d2' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{color: '#1565c0'}}>
                        Câu {index + 1} ({getQuestionTypeName(q.question_type)}):
                    </Typography>
                    
                    <Box mb={2} sx={{ fontSize: '1.05rem' }}>{processContent(q.content)}</Box>

                    {/* === PHẦN 1: TRẮC NGHIỆM (MCQ) === */}
                    {q.question_type === 'MCQ' && (
                        <Grid container spacing={2}>
                            {q.choices.map((c, idx) => {
                                const isUserSelected = q.user_answer === c.content; 
                                const isCorrect = c.label === q.correct_label; // Sử dụng label chuẩn từ backend
                                
                                let bgColor = 'transparent';
                                let borderColor = '#e0e0e0';
                                
                                if (isCorrect) {
                                    bgColor = '#e8f5e9'; // Xanh lá (đáp án đúng)
                                    borderColor = '#2e7d32';
                                }
                                if (isUserSelected && !isCorrect) {
                                    bgColor = '#ffebee'; // Đỏ (chọn sai)
                                    borderColor = '#d32f2f';
                                }

                                return (
                                    <Grid item xs={12} sm={6} key={idx}>
                                        <Box sx={{ 
                                            p: 1.5, borderRadius: 2, border: `1px solid ${borderColor}`, bgcolor: bgColor,
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            <strong style={{ marginRight: 8, minWidth: 20 }}>{c.label}.</strong>
                                            {processContent(c.content)}
                                            {isUserSelected && <Chip label="Bạn chọn" size="small" sx={{ ml: 'auto', bgcolor: isCorrect ? '#4caf50' : '#f44336', color: '#fff' }} />}
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}

                    {/* === PHẦN 2: ĐÚNG / SAI (TF) - HIỂN THỊ BẢNG (Đã được khôi phục) === */}
                    {q.question_type === 'TF' && (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell><b>Ý</b></TableCell>
                                        <TableCell><b>Nội dung</b></TableCell>
                                        <TableCell align="center"><b>Bạn chọn</b></TableCell>
                                        <TableCell align="center"><b>Đáp án</b></TableCell>
                                        <TableCell align="center"><b>Kết quả</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {q.choices.map((c) => {
                                        // Xử lý lấy đáp án người dùng (Backend trả về dict trong exam_details)
                                        let userChoiceVal = null;
                                        if (q.user_answer && typeof q.user_answer === 'object') {
                                            userChoiceVal = q.user_answer[c.id];
                                        } else if (q.user_answer && typeof q.user_answer === 'string') {
                                            // Fallback nếu trả về chuỗi JSON
                                            try {
                                                const parsed = JSON.parse(q.user_answer);
                                                userChoiceVal = parsed[c.id];
                                            } catch(e) {}
                                        }

                                        const userBool = String(userChoiceVal).toLowerCase() === 'true';
                                        const correctBool = c.is_correct;
                                        const isMatch = (userChoiceVal !== undefined && userChoiceVal !== null) && (userBool === correctBool);

                                        return (
                                            <TableRow key={c.id}>
                                                <TableCell><b>{c.label}</b></TableCell>
                                                <TableCell>{processContent(c.content)}</TableCell>
                                                <TableCell align="center">
                                                    {userChoiceVal !== null && userChoiceVal !== undefined ? (
                                                        <Chip 
                                                            label={userBool ? "Đúng" : "Sai"} 
                                                            size="small" 
                                                            variant="outlined"
                                                            color={userBool ? "primary" : "default"}
                                                        />
                                                    ) : <span style={{color:'#999'}}>-</span>}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <strong style={{ color: '#1976d2' }}>{correctBool ? "Đúng" : "Sai"}</strong>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {isMatch ? 
                                                        <CheckCircleIcon color="success" fontSize="small"/> : 
                                                        <CancelIcon color="error" fontSize="small"/>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* === PHẦN 3: TRẢ LỜI NGẮN (SHORT) - HIỂN THỊ BOX (Đã được khôi phục) === */}
                    {q.question_type === 'SHORT' && (
                        <Box mt={2} p={2} bgcolor="#f8f9fa" borderRadius={2} border="1px dashed #bdbdbd">
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">Câu trả lời của bạn:</Typography>
                                    <Typography variant="h6" color={
                                        // So sánh sai số nhỏ
                                        Math.abs(parseFloat(String(q.user_answer).replace(',','.')) - parseFloat(q.correct_text)) < 0.001 
                                        ? "green" : "error"
                                    }>
                                        {q.user_answer || "Chưa trả lời"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">Đáp án đúng:</Typography>
                                    <Typography variant="h6" color="primary">
                                        {q.correct_text}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* === PHẦN LỜI GIẢI CHI TIẾT === */}
                    <Box mt={3}>
                        <Divider textAlign="left"><Chip label="LỜI GIẢI CHI TIẾT" color="primary" size="small" /></Divider>
                        <Box mt={2} p={2} bgcolor="#e3f2fd" borderRadius={2}>
                            {q.solution ? processContent(q.solution) : <Typography fontStyle="italic" color="textSecondary">Chưa có lời giải chi tiết cho câu hỏi này.</Typography>}
                        </Box>
                    </Box>

                </Card>
            ))}
        </Container>
    );
};

// Helper hiển thị loại câu hỏi
const getQuestionTypeName = (type) => {
    switch (type) {
        case 'MCQ': return 'Trắc nghiệm';
        case 'TF': return 'Đúng / Sai';
        case 'SHORT': return 'Trả lời ngắn';
        default: return 'Câu hỏi';
    }
};

export default ExamResultPage;