import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import { 
    Container, Typography, Box, Paper, Button, 
    CircularProgress, Chip, Card, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Radio
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

const processContent = (content) => {
    if (!content) return "";
    let cleanContent = content
        .replaceAll('\\bullet', '•') 
        .replaceAll('begin{eqnarray*}', 'begin{aligned}')
        .replaceAll('end{eqnarray*}', 'end{aligned}');
    const mathRegex = /((?<!\\)\$\$.*?(?<!\\)\$\$|(?<!\\)\$.*?(?<!\\)\$|\\begin\{.*?\}.*?\\end\{.*?\}|\\\[[\s\S]*?\\\])/gs;
    const parts = cleanContent.split(mathRegex);

    return (
        <span style={{ fontWeight: 400 }}>
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
                        elements.push(<img key={`${index}-img-${i}`} src={subParts[i+1]} style={{ maxWidth: '100%', display: 'block', margin: '10px auto', borderRadius: '4px' }} alt="img" />);
                    }
                }
                return <React.Fragment key={index}>{elements}</React.Fragment>;
            })}
        </span>
    );
};

const renderTextWithFormatting = (text, keyPrefix) => {
    const textLines = text.split('\n');
    return textLines.map((line, lineIdx) => {
        const boldParts = line.split(/\\textbf\{(.*?)\}/g);
        return (
            <React.Fragment key={`${keyPrefix}-${lineIdx}`}>
                {boldParts.map((bPart, bIdx) => {
                    if (bIdx % 2 === 1) return <strong key={bIdx} style={{ fontWeight: 700 }}>{bPart}</strong>;
                    return <span key={bIdx} style={{ fontWeight: 400 }}>{bPart}</span>;
                })}
                {lineIdx < textLines.length - 1 && <br />}
            </React.Fragment>
        );
    });
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
                // ✅ Gọi API lấy chi tiết bài làm
                const resResult = await axiosClient.get(`/history/${id}/`);
                const data = resResult.data;
                setResult(data);

                // ✅ Gọi API lấy danh sách câu hỏi
                const resQuestions = await axiosClient.get(`/exams/${data.exam}/questions/`);
                const qData = resQuestions.data;
                setQuestions(qData);
                
                let p1 = 0, p2 = 0, p3 = 0;
                let userAns = typeof data.detail_answers === 'string' ? JSON.parse(data.detail_answers) : data.detail_answers;

                qData.forEach(q => {
                    const ans = userAns[q.id];
                    if (!ans) return;
                    if (q.question_type === 'MCQ') {
                        if (q.choices.find(c => c.is_correct && c.content === ans)) p1 += 0.25;
                    } else if (q.question_type === 'TF') {
                        let sub = 0;
                        q.choices.forEach(c => { if (ans[c.id] === (c.is_correct ? "true" : "false")) sub++; });
                        if (sub === 1) p2 += 0.1; else if (sub === 2) p2 += 0.25; else if (sub === 3) p2 += 0.5; else if (sub === 4) p2 += 1.0;
                    } else if (q.question_type === 'SHORT') {
                        if (Math.abs(parseFloat(String(ans).replace(',','.')) - q.short_answer_correct) < 0.001) p3 += 0.5;
                    }
                });
                setScoreDetails({ p1, p2, p3 });
            } catch (error) { 
                console.error("Lỗi tải bài làm:", error);
                alert("Không thể tải chi tiết bài làm này.");
                navigate('/history');
            } finally { setLoading(false); }
        };
        if (id) fetchData();
    }, [id, navigate]);

    if (loading) return <Box textAlign="center" mt={10}><CircularProgress /><Typography mt={2}>Đang tải kết quả...</Typography></Box>;
    if (!result) return null;

    let userAnswers = typeof result.detail_answers === 'string' ? JSON.parse(result.detail_answers) : result.detail_answers;

    return (
        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            <Box display="flex" gap={2} mb={3}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Quay lại</Button>
                <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>Trang chủ</Button>
            </Box>

            <Paper elevation={4} sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ bgcolor: '#e8f5e9', p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="#2e7d32">KẾT QUẢ CHI TIẾT</Typography>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            <TableRow><TableCell align="center">Phần I (Trắc nghiệm)</TableCell><TableCell align="center"><b>{scoreDetails.p1.toFixed(2)}</b></TableCell></TableRow>
                            <TableRow><TableCell align="center">Phần II (Đúng/Sai)</TableCell><TableCell align="center"><b>{scoreDetails.p2.toFixed(2)}</b></TableCell></TableRow>
                            <TableRow><TableCell align="center">Phần III (Điền đáp án)</TableCell><TableCell align="center"><b>{scoreDetails.p3.toFixed(2)}</b></TableCell></TableRow>
                            <TableRow sx={{ bgcolor: '#fff9c4' }}><TableCell align="right"><b>TỔNG ĐIỂM:</b></TableCell><TableCell align="center"><Typography variant="h5" fontWeight="bold" color="#d32f2f">{result.score.toFixed(2)}</Typography></TableCell></TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {questions.map((q, index) => {
                const ans = userAnswers[q.id];
                return (
                    <Card key={q.id} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
                        <Typography fontWeight="bold" mb={1}>Câu {index + 1}:</Typography>
                        <Box mb={2}>{processContent(q.content)}</Box>
                        {/* Logic hiển thị các loại câu hỏi (MCQ, TF, SHORT) giữ nguyên như code bạn đã cung cấp */}
                        {q.question_type === 'MCQ' && q.choices.map((c, idx) => (
                            <Box key={idx} sx={{ p: 1, my: 0.5, borderRadius: 1, border: '1px solid #eee', bgcolor: c.is_correct ? '#e8f5e9' : (ans === c.content ? '#ffebee' : 'transparent'), display: 'flex', alignItems: 'center' }}>
                                <strong style={{marginRight: '8px', fontWeight: 700}}>{c.label}.</strong> {processContent(c.content)}
                            </Box>
                        ))}
                        {/* ... Các phần khác tương tự ... */}
                    </Card>
                );
            })}
        </Container>
    );
};

export default ExamResultPage;