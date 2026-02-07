import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import { 
    Container, Typography, Box, Paper, Button, Grid, 
    CircularProgress, Chip, Card, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Radio
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

// IMPORT LOGIC XỬ LÝ NỘI DUNG GIỐNG QUESTION CARD CỦA BẠN
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

// --- HÀM XỬ LÝ NỘI DUNG (ĐÃ COPY TỪ LOGIC BẠN GỬI) ---
const processContent = (content) => {
    if (!content) return "";
    let cleanContent = content
        .replaceAll('\\bullet', '•') 
        .replaceAll('begin{eqnarray*}', 'begin{aligned}')
        .replaceAll('end{eqnarray*}', 'end{aligned}');

    const mathRegex = /((?<!\\)\$\$.*?(?<!\\)\$\$|(?<!\\)\$.*?(?<!\\)\$|\\begin\{.*?\}.*?\\end\{.*?\}|\\\[[\s\S]*?\\\])/gs;
    const parts = cleanContent.split(mathRegex);

    return (
        <span style={{ fontWeight: '400' }}>
            {parts.map((part, index) => {
                if (!part) return null;
                const isMath = /^\$|^\$\.|^\\begin|^\\\[/.test(part.trim());
                if (isMath) return <Latex key={index}>{part}</Latex>;
                
                const imgRegex = /<img src='(.*?)' style='(.*?)' \/>/g;
                const subParts = part.split(imgRegex);
                if (subParts.length === 1) return renderTextWithFormatting(part, index);

                let elements = [];
                for (let i = 0; i < subParts.length; i += 3) {
                    if (subParts[i]) elements.push(renderTextWithFormatting(subParts[i], `${index}-txt-${i}`));
                    if (i + 1 < subParts.length) {
                        elements.push(<img key={`${index}-img-${i}`} src={subParts[i+1]} style={{ maxWidth: '100%', display: 'block', margin: '10px auto' }} alt="img" />);
                    }
                }
                return <React.Fragment key={index}>{elements}</React.Fragment>;
            })}
        </span>
    );
};

const renderTextWithFormatting = (text, keyPrefix) => {
    const textLines = text.split('\n');
    return textLines.map((line, lineIdx) => (
        <React.Fragment key={`${keyPrefix}-${lineIdx}`}>
            {line}
            {lineIdx < textLines.length - 1 && <br />}
        </React.Fragment>
    ));
};

const ExamResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scoreDetails, setScoreDetails] = useState({ p1: 0, p2: 0, p3: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resResult = await axiosClient.get(`/history/${id}/`);
                const data = resResult.data;
                setResult(data);

                const resQuestions = await axiosClient.get(`/exams/${data.exam}/questions/`);
                const qData = resQuestions.data;
                setQuestions(qData);
                
                // Logic tính điểm 3 phần
                let p1 = 0, p2 = 0, p3 = 0;
                let userAns = typeof data.detail_answers === 'string' ? JSON.parse(data.detail_answers) : data.detail_answers;

                qData.forEach(q => {
                    const ans = userAns[q.id];
                    if (!ans) return;
                    if (q.question_type === 'MCQ') {
                        if (q.choices.find(c => c.is_correct && c.content === ans)) p1 += 0.25;
                    } else if (q.question_type === 'TF') {
                        let subCorrect = 0;
                        q.choices.forEach(c => {
                            const actual = c.is_correct ? "true" : "false";
                            if (ans[c.id] === actual) subCorrect++;
                        });
                        if (subCorrect === 1) p2 += 0.1;
                        else if (subCorrect === 2) p2 += 0.25;
                        else if (subCorrect === 3) p2 += 0.5;
                        else if (subCorrect === 4) p2 += 1.0;
                    } else if (q.question_type === 'SHORT') {
                        if (parseFloat(String(ans).replace(',','.')) === q.short_answer_correct) p3 += 0.5;
                    }
                });
                setScoreDetails({ p1, p2, p3 });
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [id]);

    if (loading) return <Box textAlign="center" mt={10}><CircularProgress /></Box>;
    if (!result) return <Box textAlign="center" mt={10}><Typography>Không tìm thấy kết quả.</Typography></Box>;

    let userAnswers = typeof result.detail_answers === 'string' ? JSON.parse(result.detail_answers) : result.detail_answers;

    return (
        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            <Box display="flex" gap={2} mb={3}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Quay lại</Button>
                <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>Trang chủ</Button>
            </Box>

            {/* BẢNG ĐIỂM TỔNG HỢP (GIỐNG HÌNH BẠN GỬI) */}
            <Paper elevation={4} sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderBottom: '2px solid #4caf50', textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="#2e7d32">KẾT QUẢ CHI TIẾT</Typography>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}><TableRow><TableCell align="center"><b>Phần thi</b></TableCell><TableCell align="center"><b>Điểm</b></TableCell></TableRow></TableHead>
                        <TableBody>
                            <TableRow hover><TableCell align="center">Phần I (Trắc nghiệm)</TableCell><TableCell align="center" sx={{ fontWeight: 'bold' }}>{scoreDetails.p1.toFixed(2)}</TableCell></TableRow>
                            <TableRow hover><TableCell align="center">Phần II (Đúng/Sai)</TableCell><TableCell align="center" sx={{ fontWeight: 'bold' }}>{scoreDetails.p2.toFixed(2)}</TableCell></TableRow>
                            <TableRow hover><TableCell align="center">Phần III (Điền đáp án)</TableCell><TableCell align="center" sx={{ fontWeight: 'bold' }}>{scoreDetails.p3.toFixed(2)}</TableCell></TableRow>
                            <TableRow sx={{ bgcolor: '#fff9c4' }}><TableCell align="right"><b>TỔNG ĐIỂM:</b></TableCell><TableCell align="center"><Typography variant="h5" fontWeight="bold" color="#d32f2f">{result.score.toFixed(2)}</Typography></TableCell></TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* DANH SÁCH CÂU HỎI THEO LOGIC CỦA BẠN */}
            {questions.map((q, index) => {
                const ans = userAnswers[q.id];
                return (
                    <Card key={q.id} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
                        <Typography fontWeight="bold" mb={1}>Câu {index + 1}:</Typography>
                        <Box mb={2}>{processContent(q.content)}</Box>

                        {/* HIỂN THỊ THEO TỪNG LOẠI CÂU HỎI */}
                        {q.question_type === 'MCQ' && q.choices.map((c, idx) => (
                            <Box key={idx} sx={{ p: 1, my: 0.5, borderRadius: 1, border: '1px solid #eee', bgcolor: c.is_correct ? '#e8f5e9' : (ans === c.content ? '#ffebee' : 'transparent'), display: 'flex', alignItems: 'center' }}>
                                <strong style={{marginRight: '8px'}}>{c.label}.</strong> {processContent(c.content)}
                                {ans === c.content && <Typography variant="caption" sx={{ml: 1}}>(Bạn chọn)</Typography>}
                            </Box>
                        ))}

                        {q.question_type === 'TF' && (
                            <TableContainer component={Paper} elevation={0} variant="outlined">
                                <Table size="small">
                                    <TableHead><TableRow><TableCell><b>Mệnh đề</b></TableCell><TableCell align="center"><b>Đúng</b></TableCell><TableCell align="center"><b>Sai</b></TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {q.choices.map((c, idx) => {
                                            const uVal = ans ? ans[c.id] : null;
                                            const isRight = (uVal === "true" && c.is_correct) || (uVal === "false" && !c.is_correct);
                                            return (
                                                <TableRow key={idx} sx={{ bgcolor: uVal ? (isRight ? '#d4edda' : '#f8d7da') : 'transparent' }}>
                                                    <TableCell>{c.label}) {processContent(c.content)}</TableCell>
                                                    <TableCell align="center"><Radio checked={uVal === "true"} disabled size="small" color="success" /></TableCell>
                                                    <TableCell align="center"><Radio checked={uVal === "false"} disabled size="small" color="error" /></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {q.question_type === 'SHORT' && (
                            <Box sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">Bạn trả lời: </Typography>
                                    <Box sx={{ border: '2px solid', borderColor: parseFloat(String(ans).replace(',','.')) === q.short_answer_correct ? '#28a745' : '#dc3545', p: '4px 12px', borderRadius: 1, bgcolor: '#fff' }}><b>{ans || "Trống"}</b></Box>
                                </Box>
                                <Typography variant="body2" color="success.main" mt={1}>Đáp án đúng: <b>{q.short_answer_correct.toString().replace('.',',')}</b></Typography>
                            </Box>
                        )}

                        {q.solution && (
                            <Box mt={2} p={2} bgcolor="#fffde7" borderRadius={2} border="1px dashed #fbc02d">
                                <Typography variant="subtitle2" fontWeight="bold" color="#f57f17">💡 Lời giải chi tiết:</Typography>
                                {processContent(q.solution)}
                            </Box>
                        )}
                    </Card>
                );
            })}
        </Container>
    );
};

export default ExamResultPage;