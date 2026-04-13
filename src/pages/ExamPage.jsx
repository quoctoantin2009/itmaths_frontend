import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../services/axiosClient";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import QuestionCard from "../components/QuestionCard";
import ExamHistoryDialog from "../components/ExamHistoryDialog"; 
import {
  Button, Box, CircularProgress, Paper, Backdrop,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
  Chip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

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
    minHeight: '100vh', width: '100%', background: '#f4f6f8', padding: '0',
    boxSizing: 'border-box', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  container: {
    maxWidth: '100%', margin: '0', padding: '10px', backgroundColor: 'transparent',
    borderRadius: '0', boxShadow: 'none', minHeight: '80vh', position: 'relative',
    paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: '60px' 
  },
  examButton: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
    padding: '15px', margin: '10px 0', border: '1px solid #eee', borderRadius: '12px',
    backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '16px', fontWeight: '500',
    transition: 'all 0.2s', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
};

const shuffleArray = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) return [];
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const formatTime = (seconds) => {
  if (seconds === null || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  const [isProcessingResult, setIsProcessingResult] = useState(false);
  const timerRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const topicId = location.state?.fromTopicId || searchParams.get('topic');
  const classroomId = searchParams.get('classroom_id'); 

  useEffect(() => {
    const initAdMobAndBanner = async () => {
      if (Capacitor.isNativePlatform()) {
          try {
            await AdMob.initialize({ requestTrackingAuthorization: true });
            await AdMob.showBanner({
                adId: 'ca-app-pub-2431317486483815/5036820439', 
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER, 
                margin: 0,
                isTesting: false 
            });
          } catch (e) { console.error("Lỗi Init AdMob/Banner:", e); }
      }
    };
    initAdMobAndBanner();

    return () => {
        if (Capacitor.isNativePlatform()) {
            AdMob.hideBanner().catch(e => {});
            AdMob.removeBanner().catch(e => {});
        }
    };
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(true);
      let url = '/exams/';
      if (topicId) url += `?topic=${topicId}`;

      axiosClient.get(url)
        .then((res) => setExams(res.data))
        .catch((err) => console.error("Lỗi tải danh sách đề:", err))
        .finally(() => setLoading(false));
    }
  }, [id, topicId]);

  useEffect(() => {
    if (id) handleSelectExam(parseInt(id));
  }, [id]);

  useEffect(() => {
    if (!selectedExamId || submitted || loading || !currentExamInfo) return;

    const updateTimer = () => {
      const storageKey = `exam_start_${selectedExamId}`;
      const storedStart = localStorage.getItem(storageKey);

      if (storedStart) {
        const startTime = parseInt(storedStart);
        const durationMinutes = currentExamInfo.duration || 45;
        const endTime = startTime + (durationMinutes * 60 * 1000);
        const now = Date.now();
        const secondsLeft = Math.floor((endTime - now) / 1000);

        if (secondsLeft <= 0) {
          setTimeLeft(0);
          clearInterval(timerRef.current);
          setOpenConfirm(false);
          submitExam(); 
          alert("⏰ Đã hết thời gian làm bài!");
        } else {
          setTimeLeft(secondsLeft);
        }
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [selectedExamId, submitted, loading, currentExamInfo]);

  const handleSelectExam = async (examId) => {
    setLoading(true);
    setSelectedExamId(examId);
    setSubmitted(false);
    setScoreData(null);
    setUserAnswers({});

    try {
      const resQuestions = await axiosClient.get(`/exams/${examId}/questions/`);
      const rawQuestions = resQuestions.data;

      if (!rawQuestions || !Array.isArray(rawQuestions)) {
        throw new Error("Dữ liệu câu hỏi không hợp lệ.");
      }

      // 🟢 Giữ nguyên Data dạng CHỮ (String) để QuestionCard không bị crash
      const part1 = rawQuestions.filter(q => q.question_type === 'MCQ');
      const part2 = rawQuestions.filter(q => q.question_type === 'TF');
      const part3 = rawQuestions.filter(q => q.question_type === 'SHORT');

      const shuffledPart1 = shuffleArray(part1).map(q => {
        const choicesSafe = q.choices || [];
        const shuffledChoices = shuffleArray(choicesSafe);
        const labels = ['A', 'B', 'C', 'D'];
        const relabeledChoices = shuffledChoices.map((c, idx) => ({
          ...c,
          label: labels[idx] || c.label
        }));
        return { ...q, choices: relabeledChoices };
      });

      setQuestions([...shuffledPart1, ...shuffleArray(part2), ...shuffleArray(part3)]);

      const resInfo = await axiosClient.get(`/exams/${examId}/`);
      setCurrentExamInfo(resInfo.data);

      const storageKey = `exam_start_${examId}`;
      const storedStart = localStorage.getItem(storageKey);
      if (!storedStart) {
        localStorage.setItem(storageKey, Date.now().toString());
      }

    } catch (err) {
      console.error("Lỗi tải đề thi:", err);
      alert("Không thể tải đề thi. Vui lòng kiểm tra lại kết nối!");
      
      if(id) {
         if(classroomId) navigate(`/classrooms/${classroomId}`);
         else if(topicId) navigate(`/topics/${topicId}`);
         else navigate('/exams');
      }
      setSelectedExamId(null);
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
    if (selectedExamId) {
      localStorage.removeItem(`exam_start_${selectedExamId}`);
    }

    setOpenConfirm(false);
    window.dispatchEvent(new Event('ITMATHS_EXAM_SUBMITTED'));

    axiosClient.post(`/submit-result/`, {
        exam: selectedExamId,
        classroom_id: classroomId, 
        detail_answers: userAnswers
    })
    .then((res) => {
        const { score, breakdown } = res.data;
        setScoreData({ p1: breakdown.mcq, p2: breakdown.tf, p3: breakdown.short, total: score });
    })
    .catch(error => {
        console.error("Lỗi lưu điểm:", error);
        alert(error.response?.data?.error || "Lỗi khi nộp bài");
    });

    setIsProcessingResult(true);

    try {
        if (Capacitor.isNativePlatform()) {
            await AdMob.hideBanner(); 
            await AdMob.prepareInterstitial({
                adId: 'ca-app-pub-2431317486483815/1826436807', 
                isTesting: false
            });
            await AdMob.showInterstitial();
        }
    } catch (e) {
        console.error("Lỗi QC khi nộp bài:", e);
    } finally {
        setIsProcessingResult(false);
        setSubmitted(true);
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    }
  };

  const handleOpenBackModal = () => {
    if (submitted) { handleExit(); return; }
    setOpenConfirm(true);
  };

  const handleExit = () => {
    if (classroomId) {
        navigate(`/classrooms/${classroomId}`);
    }
    else if (topicId) {
        navigate(`/topics/${topicId}`, {
             state: { topicTitle: location.state?.topicTitle } 
        });
    } 
    else if (id) {
        navigate('/exams'); 
    }
    else {
      setSelectedExamId(null);
      setCurrentExamInfo(null);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>

        <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isProcessingResult}>
            <Box textAlign="center">
                <CircularProgress color="inherit" />
                <Typography sx={{mt: 2, fontWeight: 'bold', fontSize: '1.2rem'}}>
                    Đang chấm điểm & tổng hợp kết quả...
                </Typography>
            </Box>
        </Backdrop>

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
              <Typography variant="h5" color="primary" fontWeight="bold">
                 {topicId ? 'ĐỀ THI THEO CHUYÊN ĐỀ' : 'KHO ĐỀ THI TỔNG HỢP'}
              </Typography>
              
              <Box><ExamHistoryDialog /></Box>
            </Box>

            {exams.length > 0 ? (
                exams.map((exam) => (
                <div 
                    key={exam.id} 
                    onClick={() => navigate(`/exams/${exam.id}`)} 
                    style={styles.examButton} 
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} 
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{fontSize: '20px'}}>📄</span>
                        <div>
                             <div style={{ color: '#512da8', fontWeight: 'bold' }}>{exam.title}</div>
                             <div style={{ fontSize: '12px', color: '#888' }}>{exam.topic_title || 'Đề tổng hợp'}</div>
                        </div>
                    </div>
                    <Chip 
                        label={`⏱ ${exam.duration || 45} phút`} 
                        size="small" 
                        sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }} 
                    />
                </div>
                ))
            ) : (
                <Box textAlign="center" py={5} bgcolor="#fff" borderRadius={2}>
                    <Typography color="textSecondary">Chưa có đề thi nào trong danh sách này.</Typography>
                </Box>
            )}
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
              <Button variant="outlined" color="error" onClick={handleOpenBackModal} sx={{ fontWeight: 'bold', borderRadius: '20px', textTransform: 'none' }}>
                Thoát
              </Button>
            </Paper>

            {questions.map((q, index) => (
              <QuestionCard key={q.id} question={q} index={index} userAnswer={userAnswers[q.id]} onAnswerChange={handleAnswerChange} isSubmitted={submitted} />
            ))}

            {!submitted && (
              <Box textAlign="center" mt={4} mb={10}>
                <Button variant="contained" size="large" onClick={() => setOpenConfirm(true)} startIcon={<SendIcon />} sx={{ width: '90%', py: 1.5, fontSize: '1.1rem', borderRadius: '30px', bgcolor: '#6c5ce7', '&:hover': { bgcolor: '#5a4ad1' } }}>
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
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Phần thi</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Điểm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell align="center"><b>Phần I</b> (Trắc nghiệm)</TableCell>
                        <TableCell align="center" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{scoreData.p1.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell align="center"><b>Phần II</b> (Đúng/Sai)</TableCell>
                        <TableCell align="center" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{scoreData.p2.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell align="center"><b>Phần III</b> (Điền đáp án)</TableCell>
                        <TableCell align="center" sx={{ color: '#1976d2', fontWeight: 'bold' }}>{scoreData.p3.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: '#fff9c4' }}>
                        <TableCell align="right" sx={{ verticalAlign: 'middle' }}><Typography variant="h6" fontWeight="bold">TỔNG:</Typography></TableCell>
                        <TableCell align="center"><Typography variant="h4" fontWeight="bold" color="#d32f2f">{scoreData.total.toFixed(2)}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="contained" color="primary" startIcon={<ReplayIcon />} onClick={() => window.location.reload()} sx={{ py: 1.5, fontWeight: 'bold', width: '100%', borderRadius: '25px' }}>
                    LÀM LẠI
                  </Button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Box flex={1}><ExamHistoryDialog /></Box> 
                    <Button variant="outlined" startIcon={<ListAltIcon />} onClick={handleExit} sx={{ flex: 1, py: 1, borderRadius: '25px' }}>
                      DANH SÁCH LỚP HỌC
                    </Button>
                  </div>
                </Box>
              </Paper>
            )}
          </div>
        )}

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} PaperProps={{ sx: { borderRadius: '12px' } }}>
          <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>Xác nhận nộp bài</DialogTitle>
          <DialogContent sx={{ mt: 2 }}><DialogContentText>Bạn có chắc chắn muốn nộp bài thi không?</DialogContentText></DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenConfirm(false)} color="secondary">Xem lại</Button>
            <Button onClick={submitExam} variant="contained" autoFocus>Nộp bài ngay</Button>
          </DialogActions>
        </Dialog>

      </div>
    </div>
  );
}

export default ExamPage;