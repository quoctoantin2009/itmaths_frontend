import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import { 
    Container, Typography, Box, Paper, Button, 
    CircularProgress, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Backdrop 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import FeedbackIcon from '@mui/icons-material/Feedback';
import QuestionCard from '../components/QuestionCard'; // ✅ Dùng lại Component chuẩn

// --- COPY STYLE ĐỂ ĐỒNG BỘ GIAO DIỆN ---
const styles = {
    pageWrapper: {
        minHeight: '100vh',
        width: '100%',
        background: '#f4f6f8',
        padding: '0',
        boxSizing: 'border-box',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    container: {
        maxWidth: '100%',
        margin: '0',
        padding: '10px',
        paddingTop: '20px',
        paddingBottom: '60px' 
    }
};

const ExamResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    
    // State lưu điểm (Tổng điểm sẽ được tính lại tại đây)
    const [scoreDetails, setScoreDetails] = useState({ p1: 0, p2: 0, p3: 0, total: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Lấy chi tiết lịch sử bài làm
                const resResult = await axiosClient.get(`/history/${id}/`);
                const data = resResult.data;
                setResult(data);

                // Parse câu trả lời của user từ JSON
                let parsedAnswers = {};
                try {
                    parsedAnswers = typeof data.detail_answers === 'string' 
                        ? JSON.parse(data.detail_answers) 
                        : data.detail_answers;
                } catch (e) { console.error("Lỗi parse answers", e); }
                setUserAnswers(parsedAnswers || {});

                // 2. Lấy danh sách câu hỏi gốc của đề thi
                const resQuestions = await axiosClient.get(`/exams/${data.exam}/questions/`);
                const qData = resQuestions.data;
                setQuestions(qData);

                // 3. 🔥 LOGIC TÍNH ĐIỂM (COPY TỪ EXAM HISTORY DIALOG) 🔥
                let p1 = 0, p2 = 0, p3 = 0;
                
                qData.forEach(q => {
                    const ans = parsedAnswers[q.id];
                    if (!ans) return; // Không làm thì bỏ qua

                    // --- Phần 1: Trắc nghiệm (MCQ) ---
                    if (q.question_type === 'MCQ') {
                        const correctChoice = q.choices.find(c => c.is_correct);
                        if (correctChoice && ans === correctChoice.content) {
                            p1 += 0.25;
                        }
                    } 
                    // --- Phần 2: Đúng/Sai (TF) ---
                    else if (q.question_type === 'TF') {
                        let sub = 0;
                        q.choices.forEach(c => {
                            // So sánh chuỗi hoặc boolean
                            const actual = c.is_correct ? "true" : "false";
                            const userValStr = String(ans[c.id]).toLowerCase();
                            if (userValStr === actual) sub++;
                        });
                        
                        // Thang điểm Bộ GD
                        if (sub === 1) p2 += 0.1;
                        else if (sub === 2) p2 += 0.25;
                        else if (sub === 3) p2 += 0.5;
                        else if (sub === 4) p2 += 1.0;
                    } 
                    // --- Phần 3: Trả lời ngắn (SHORT) ---
                    else if (q.question_type === 'SHORT') {
                        const uVal = parseFloat(String(ans).replace(',', '.'));
                        const cVal = parseFloat(String(q.short_answer_correct).replace(',', '.'));
                        // So sánh sai số nhỏ (0.001)
                        if (Math.abs(uVal - cVal) < 0.001) {
                            p3 += 0.5;
                        }
                    }
                });

                // 🔥 QUAN TRỌNG: TÍNH LẠI TỔNG ĐIỂM TỪ P1 + P2 + P3
                // Không dùng data.score từ DB để tránh sai lệch do dữ liệu cũ
                const calculatedTotal = p1 + p2 + p3;

                setScoreDetails({ 
                    p1, 
                    p2, 
                    p3, 
                    total: calculatedTotal 
                });

            } catch (error) { 
                console.error("Lỗi tải bài làm:", error);
                alert("Không thể tải chi tiết bài làm này.");
                navigate('/');
            } finally { 
                setLoading(false); 
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    if (loading) {
        return (
            <Backdrop sx={{ color: '#fff', zIndex: 9999 }} open={true}>
                <Box textAlign="center">
                    <CircularProgress color="inherit" />
                    <Typography sx={{ mt: 2 }}>Đang tải kết quả...</Typography>
                </Box>
            </Backdrop>
        );
    }

    if (!result) return null;

    return (
        <div style={styles.pageWrapper}>
            <Container maxWidth="md" style={styles.container}>
                {/* 1. Header Navigation */}
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                    <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
                        Trang chủ
                    </Button>
                </Box>

                {/* 2. BẢNG TỔNG HỢP ĐIỂM */}
                <Paper elevation={4} sx={{ mb: 4, overflow: 'hidden', borderRadius: 2, border: '1px solid #ddd' }}>
                    <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderBottom: '2px solid #4caf50', textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" color="#2e7d32" textTransform="uppercase">
                            KẾT QUẢ CHI TIẾT: {result.exam_title}
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#eeeeee' }}>
                                <TableRow>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Phần thi</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Điểm</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow hover>
                                    <TableCell align="center"><b>Phần I</b> (Trắc nghiệm)</TableCell>
                                    <TableCell align="center" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{scoreDetails.p1.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell align="center"><b>Phần II</b> (Đúng/Sai)</TableCell>
                                    <TableCell align="center" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{scoreDetails.p2.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell align="center"><b>Phần III</b> (Điền đáp án)</TableCell>
                                    <TableCell align="center" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{scoreDetails.p3.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow sx={{ bgcolor: '#fff9c4' }}>
                                    <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
                                        <Typography variant="h6" fontWeight="bold">TỔNG:</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="h4" fontWeight="bold" color="#d32f2f">
                                            {scoreDetails.total.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* 3. DANH SÁCH CÂU HỎI (DÙNG QUESTION CARD ĐỂ HIỂN THỊ CHUẨN) */}
                {questions.map((q, index) => (
                    <QuestionCard 
                        key={q.id} 
                        question={q} 
                        index={index} 
                        userAnswer={userAnswers[q.id]} 
                        onAnswerChange={() => {}} // Read-only
                        isSubmitted={true} // Kích hoạt chế độ xem kết quả
                    />
                ))}

                {/* 4. Footer */}
                <Box textAlign="center" mt={5} mb={5} p={3} bgcolor="#fff" borderRadius={2}>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                        Bạn có thắc mắc về kết quả này?
                    </Typography>
                    <Button variant="outlined" color="warning" startIcon={<FeedbackIcon />}>
                        Gửi phản hồi
                    </Button>
                </Box>

            </Container>
        </div>
    );
};

export default ExamResultPage;