import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; 
import "../App.css"; 
import QuestionCard from "../components/QuestionCard";
import ExamHistoryDialog from "../components/ExamHistoryDialog"; 
import { 
    Button, Box, CircularProgress, Paper, 
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles'; 
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://itmaths-backend.onrender.com"; 

// --- STYLE & ANIMATION ---
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
`;

const FloatingTimer = styled(Box)(({ theme, isWarning }) => ({
    position: 'fixed',          
    top: '10px',                
    right: '10px',              
    zIndex: 9999,               
    backgroundColor: isWarning ? 'rgba(255, 235, 238, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: `2px solid ${isWarning ? '#ff1744' : '#6c5ce7'}`,
    borderRadius: '30px',       
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    padding: '5px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: isWarning ? '#ff1744' : '#6c5ce7',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    fontFamily: "'Segoe UI', sans-serif",
    transition: 'all 0.3s ease',
    animation: isWarning ? `${pulse} 1.5s infinite` : 'none', 
}));

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
        backgroundColor: 'transparent', 
        borderRadius: '0', 
        boxShadow: 'none',    
        minHeight: '80vh', 
        position: 'relative' 
    },
    examButton: { 
        display:'block', 
        width:'100%', 
        padding:'15px', 
        margin:'10px 0', 
        border:'none', 
        borderRadius:'8px', 
        backgroundColor: '#ffffff', 
        cursor:'pointer', 
        textAlign:'left', 
        fontSize:'16px', 
        fontWeight: '500', 
        transition: 'all 0.2s', 
        color: '#333', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
    },
};

// --- [SỬA LỖI] HÀM TRỘN MẢNG AN TOÀN ---
const shuffleArray = (array) => {
    // Nếu mảng không tồn tại hoặc rỗng, trả về mảng rỗng để tránh lỗi Crash
    if (!array || !Array.isArray(array) || array.length === 0) return [];
    
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function ExamPage() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(id ? parseInt(id) : null);
  const [currentExamInfo, setCurrentExamInfo] = useState(null); 
  
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [submitted, setSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState(null); 
  
  const [timeLeft, setTimeLeft] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [openConfirm, setOpenConfirm] = useState(false); 

  useEffect(() => {
    if (!id) { 
        axios.get(`${API_BASE_URL}/api/exams/`)
        .then((res) => setExams(res.data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
        handleSelectExam(parseInt(id));
    }
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (!selectedExamId || submitted || loading || timeLeft === null) return;

    if (timeLeft <= 0) {
        setOpenConfirm(false); 
        submitExam(); 
        alert("⏰ Hết giờ làm bài! Hệ thống đã tự động thu bài.");
        return;
    }
    const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, selectedExamId, submitted, loading]);


  // --- [SỬA LỖI] HÀM CHỌN ĐỀ AN TOÀN ---
  const handleSelectExam = async (examId) => {
    setLoading(true); 
    setSelectedExamId(examId);
    setSubmitted(false);
    setScoreData(null);
    setUserAnswers({});
    
    try {
        const resQuestions = await axios.get(`${API_BASE_URL}/api/exams/${examId}/questions/`);
        const rawQuestions = resQuestions.data;

        if (!rawQuestions || !Array.isArray(rawQuestions)) {
            throw new Error("Dữ liệu câu hỏi không hợp lệ.");
        }

        const part1 = rawQuestions.filter(q => q.question_type === 'MCQ');
        const part2 = rawQuestions.filter(q => q.question_type === 'TF');
        const part3 = rawQuestions.filter(q => q.question_type === 'SHORT');

        const shuffledPart1 = shuffleArray(part1).map(q => {
            // [SỬA LỖI] Kiểm tra q.choices có tồn tại không trước khi shuffle
            const choicesSafe = q.choices || [];
            const shuffledChoices = shuffleArray(choicesSafe);
            
            const labels = ['A', 'B', 'C', 'D'];
            const relabeledChoices = shuffledChoices.map((c, idx) => ({
                ...c,
                label: labels[idx] || c.label 
            }));
            return { ...q, choices: relabeledChoices };
        });

        const shuffledPart2 = shuffleArray(part2);
        const shuffledPart3 = shuffleArray(part3);

        setQuestions([...shuffledPart1, ...shuffledPart2, ...shuffledPart3]);

        const resInfo = await axios.get(`${API_BASE_URL}/api/exams/${examId}/`);
        setCurrentExamInfo(resInfo.data);
        const duration = resInfo.data.duration || 45;
        setTimeLeft(duration * 60);
        
    } catch (err) {
        console.error("Lỗi tải đề thi:", err);
        alert("Có lỗi khi tải đề thi. Vui lòng thử lại sau.");
        setSelectedExamId(null); // Quay lại danh sách nếu lỗi
    } finally {
        setLoading(false); 
    }
  };

  const handleAnswerChange = (questionId, choiceId, value, type) => {
    if (type === "TF") {
        setUserAnswers(prev => ({ 
            ...prev, [questionId]: { ...(prev[questionId] || {}), [choiceId]: value } 
        }));
    } else {
        setUserAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const submitExam = async () => {
    setOpenConfirm(false);
    setSubmitted(true);
    
    window.dispatchEvent(new Event('ITMATHS_EXAM_SUBMITTED'));

    let scoreP1 = 0; 
    let scoreP2 = 0; 
    let scoreP3 = 0; 
    let correctCountTotal = 0;

    questions.forEach(q => {
        const userAns = userAnswers[q.id];

        // [SỬA LỖI] Thêm kiểm tra null cho q.choices
        const choicesSafe = q.choices || [];

        if (q.question_type === 'MCQ') {
            const correctChoice = choicesSafe.find(c => c.is_correct);
            if (correctChoice && userAns === correctChoice.content) {
                scoreP1 += 0.25; correctCountTotal++;
            }
        } 
        else if (q.question_type === 'TF') {
             let subCorrect = 0;
             if (userAns) {
                 choicesSafe.forEach(c => {
                     const actual = c.is_correct ? "true" : "false";
                     if (userAns[c.id] === actual) subCorrect++;
                 });
             }
             if (subCorrect === 1) scoreP2 += 0.1;
             else if (subCorrect === 2) scoreP2 += 0.25;
             else if (subCorrect === 3) scoreP2 += 0.5;
             else if (subCorrect === 4) { scoreP2 += 1.0; correctCountTotal++; }
        }
        else if (q.question_type === 'SHORT') {
             let userVal = parseFloat(String(userAns).replace(',', '.'));
             if (userVal === q.short_answer_correct) {
                 scoreP3 += 0.5; correctCountTotal++;
             }
        } 
    });

    const totalScore = scoreP1 + scoreP2 + scoreP3;
    setScoreData({ p1: scoreP1, p2: scoreP2, p3: scoreP3, total: totalScore });
    
    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            await axios.post(`${API_BASE_URL}/api/submit-result/`, {
                exam: selectedExamId, 
                score: totalScore, 
                total_questions: questions.length, 
                correct_answers: correctCountTotal,
                detail_answers: userAnswers 
            }, { headers: { 'Authorization': `Bearer ${token}` } });
        } catch (error) { console.error("Lỗi lưu điểm:", error); }
    }

    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleOpenBackModal = () => {
      if (submitted) { handleExit(); return; }
      setOpenConfirm(true); 
  };

  const handleExit = () => {
      if (id) navigate(-1); 
      else {
          setSelectedExamId(null);
          setCurrentExamInfo(null);
      }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {!selectedExamId ? (
          <div>
            <Box mb={2}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/')} 
                    sx={{ color: '#512da8', fontWeight: 'bold', textTransform: 'none' }}
                >
                    Quay về Trang chủ
                </Button>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} borderBottom="2px solid #d1c4e9" pb={1}>
                <Typography variant="h5" color="primary" fontWeight="bold">CHỌN ĐỀ THI</Typography>
                <Box><ExamHistoryDialog /></Box>
            </Box>
            
            {exams.map((exam) => (
              <button key={exam.id} onClick={() => handleSelectExam(exam.id)} style={styles.examButton} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                📄 <span style={{color: '#512da8', fontWeight:'bold'}}>{exam.title}</span> 
                <span style={{float:'right', color:'#666', fontSize:'14px', background:'#f3e5f5', padding:'2px 8px', borderRadius:'10px'}}>⏱ {exam.duration || 90} p</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {!submitted && (
                <FloatingTimer isWarning={timeLeft < 300}>
                    <AccessTimeFilledIcon fontSize="small" /> 
                    {formatTime(timeLeft)}
                </FloatingTimer>
            )}

            <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'transparent', borderBottom: '1px solid #ddd', borderRadius: 0 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">{currentExamInfo ? currentExamInfo.title : "Đề thi"}</Typography>
                </Box>
                <Button variant="outlined" color="error" onClick={handleOpenBackModal} sx={{fontWeight:'bold', borderRadius: '20px', textTransform: 'none'}}>
                    Thoát
                </Button>
            </Paper>

            {questions.map((q, index) => (
              <QuestionCard key={q.id} question={q} index={index} userAnswer={userAnswers[q.id]} onAnswerChange={handleAnswerChange} isSubmitted={submitted} />
            ))}
            
            {!submitted && (
                <Box textAlign="center" mt={4} mb={10}>
                    <Button variant="contained" size="large" onClick={() => setOpenConfirm(true)} startIcon={<SendIcon />} sx={{width: '90%', py: 1.5, fontSize: '1.1rem', borderRadius: '30px', bgcolor: '#6c5ce7', '&:hover':{bgcolor: '#5a4ad1'}}}>
                        NỘP BÀI THI
                    </Button>
                </Box>
            )}
            
            {submitted && scoreData && (
                <Paper elevation={4} sx={{ mt: 5, overflow: 'hidden', borderRadius: 2, border: '1px solid #ddd' }}>
                    <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderBottom: '2px solid #4caf50', textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" color="#2e7d32" textTransform="uppercase">
                            KẾT QUẢ BÀI LÀM
                        </Typography>
                    </Box>
                    
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#eeeeee' }}>
                                <TableRow>
                                    <TableCell align="center" sx={{fontWeight:'bold'}}>Phần thi</TableCell>
                                    <TableCell align="center" sx={{fontWeight:'bold'}}>Điểm</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow hover>
                                    <TableCell align="center"><b>Phần I</b> (Trắc nghiệm)</TableCell>
                                    <TableCell align="center" sx={{color: '#1976d2', fontWeight: 'bold'}}>{scoreData.p1.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell align="center"><b>Phần II</b> (Đúng/Sai)</TableCell>
                                    <TableCell align="center" sx={{color: '#1976d2', fontWeight: 'bold'}}>{scoreData.p2.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow hover>
                                    <TableCell align="center"><b>Phần III</b> (Điền đáp án)</TableCell>
                                    <TableCell align="center" sx={{color: '#1976d2', fontWeight: 'bold'}}>{scoreData.p3.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow sx={{ bgcolor: '#fff9c4' }}>
                                    <TableCell align="right" sx={{ verticalAlign: 'middle' }}><Typography variant="h6" fontWeight="bold">TỔNG:</Typography></TableCell>
                                    <TableCell align="center"><Typography variant="h4" fontWeight="bold" color="#d32f2f">{scoreData.total.toFixed(2)}</Typography></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button variant="contained" color="primary" startIcon={<ReplayIcon />} onClick={() => window.location.reload()} sx={{py: 1.5, fontWeight: 'bold', width: '100%', borderRadius: '25px'}}>
                            LÀM LẠI
                        </Button>

                        <div style={{display: 'flex', gap: '10px'}}>
                            <Box flex={1}><ExamHistoryDialog /></Box>
                            <Button variant="outlined" startIcon={<ListAltIcon />} onClick={handleExit} sx={{flex: 1, py: 1, borderRadius: '25px'}}>
                                DANH SÁCH
                            </Button>
                        </div>
                    </Box>
                </Paper>
            )}
          </div>
        )}

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} PaperProps={{ sx: { borderRadius: '12px' } }}>
            <DialogTitle sx={{bgcolor: '#1976d2', color: 'white'}}>Xác nhận nộp bài</DialogTitle>
            <DialogContent sx={{mt: 2}}><DialogContentText>Bạn có chắc chắn muốn nộp bài thi không?</DialogContentText></DialogContent>
            <DialogActions sx={{p: 2}}>
                <Button onClick={() => setOpenConfirm(false)} color="secondary">Xem lại</Button>
                <Button onClick={submitExam} variant="contained" autoFocus>Nộp bài ngay</Button>
            </DialogActions>
        </Dialog>

      </div>
    </div>
  );
}

export default ExamPage;