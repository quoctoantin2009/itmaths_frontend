import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../services/axiosClient"; 
import { 
    Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, 
    Button, Paper, Divider, CircularProgress, Backdrop, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssignmentIcon from '@mui/icons-material/Assignment';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; 
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { AdMob } from '@capacitor-community/admob';

function GradePage() {
  const { gradeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const type = searchParams.get('type');
  const isTN = type === 'tn';
  const isGifted = type === 'gifted';

  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]); 
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  // --- HÀM SẮP XẾP A-Z TIẾNG VIỆT ---
  const sortAZ = (dataArray) => {
    if (!dataArray) return [];
    return [...dataArray].sort((a, b) => {
        // Ưu tiên so sánh theo 'title', nếu không có thì so sánh theo 'name'
        const nameA = a.title || a.name || "";
        const nameB = b.title || b.name || "";
        return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base' });
    });
  };

  useEffect(() => {
    const initAdMob = async () => {
        try { await AdMob.initialize({ requestTrackingAuthorization: true, initializeForTesting: true }); } 
        catch (e) { console.error("Lỗi Init:", e); }
    };
    initAdMob();
  }, []);

  const handleActionWithAd = async (callback) => {
      setIsLoadingAd(true); 
      try {
          await AdMob.prepareInterstitial({
             adId: 'ca-app-pub-3940256099942544/1033173712', 
             isTesting: true
          });
          await AdMob.showInterstitial();
      } catch (e) {
          console.error("Lỗi QC hoặc mạng yếu:", e);
      } finally {
          setIsLoadingAd(false); 
          callback(); 
      }
  };

  const getFullUrl = (url) => { 
      if (!url) return ""; 
      if (url.startsWith("http")) return url; 
      const baseUrl = axiosClient.defaults.baseURL.replace('/api', '');
      return `${baseUrl}${url}`; 
  };

  useEffect(() => {
    if (isTN) {
        axiosClient.get('/exams/?standalone=true')
            .then(res => {
                // Sắp xếp Đề thi Tốt nghiệp A-Z
                setExams(sortAZ(res.data));
            })
            .catch(err => console.error("Lỗi tải đề thi:", err));
    } else {
        const category = isGifted ? 'gifted' : 'standard';
        axiosClient.get(`/topics/?grade=${gradeId}&category=${category}`)
            .then(res => {
                // 1. Sắp xếp Chuyên đề cha (Topics) A-Z
                let sortedTopics = sortAZ(res.data);

                // 2. Sắp xếp dữ liệu con bên trong (Video, PDF, Exam) A-Z
                sortedTopics = sortedTopics.map(topic => ({
                    ...topic,
                    videos: sortAZ(topic.videos),
                    documents: sortAZ(topic.documents),
                    exercises: sortAZ(topic.exercises)
                }));

                setTopics(sortedTopics);
            })
            .catch(err => console.error("Lỗi tải chuyên đề:", err));
    }
  }, [gradeId, isTN, isGifted]);

  const handleWatchVideo = (videoUrl, videoTitle) => {
      handleActionWithAd(() => {
          navigate('/video-player', { state: { videoUrl: videoUrl, title: videoTitle } });
      });
  };

  const handleViewPDF = (pdfRelativeUrl, docTitle) => {
      const fullUrl = getFullUrl(pdfRelativeUrl);
      handleActionWithAd(() => {
          navigate('/pdf-viewer', { state: { pdfUrl: fullUrl, title: docTitle } });
      });
  };

  const handleClickExam = (examId) => {
      handleActionWithAd(() => {
          navigate(`/exams/${examId}`);
      });
  };

  return (
    <Container maxWidth={isTN ? "md" : "xl"} sx={{ 
        mb: 10,
        paddingTop: 'max(env(safe-area-inset-top), 50px)' 
    }}>
      <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}>
         <Box textAlign="center">
            <CircularProgress color="inherit" />
            <Typography sx={{mt: 2, fontWeight: 'bold'}}>Đang tải nội dung & quảng cáo...</Typography>
         </Box>
      </Backdrop>

      <Box mb={2}>
            <IconButton 
                onClick={() => navigate('/')} 
                sx={{ 
                    bgcolor: 'white', color: '#555', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                    width: 45, height: 45,
                    '&:hover': { bgcolor: '#f5f5f5', color: '#d32f2f' }
                }}
            >
                <ArrowBackIcon />
            </IconButton>
      </Box>

      {isTN ? (
         <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#d32f2f" textTransform="uppercase">LUYỆN ĐỀ TỐT NGHIỆP THPT</Typography>
                <Typography variant="body1" color="textSecondary" mt={1}>Tổng hợp các đề thi thử và đề chính thức mới nhất</Typography>
            </Box>
            
            {exams.length === 0 && (
                <Box textAlign="center" mt={5}>
                    <Typography color="textSecondary">Chưa có đề thi nào.</Typography>
                </Box>
            )}

            <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                {exams.map((exam) => (
                    <Button key={exam.id} fullWidth 
                        onClick={() => handleClickExam(exam.id)} 
                        sx={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 2, 
                            bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.05)', 
                            textTransform: 'none', border: '1px solid #eee', transition: '0.2s',
                            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 15px rgba(0,0,0,0.1)', borderColor: '#d32f2f' }
                        }}
                    >
                        <Box display="flex" alignItems="center">
                            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#ffebee', color: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, fontSize: 20 }}>📄</Box>
                            <Box textAlign="left">
                                <Typography variant="h6" fontWeight="bold" color="#333">{exam.title}</Typography>
                                <Typography variant="caption" color="textSecondary">{exam.description || "Đề thi trắc nghiệm tổng hợp"}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#666', bgcolor: '#f5f5f5', px: 2, py: 0.5, borderRadius: 10 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" fontWeight="500">{exam.duration} phút</Typography>
                        </Box>
                    </Button>
                ))}
            </Paper>
         </>
      ) : (
         <>
            <Box textAlign="center" mb={5}>
                <Typography variant="h4" fontWeight="bold" color={isGifted ? "#e65100" : "primary"} textTransform="uppercase">
                    {isGifted ? <StarIcon sx={{mr: 1, fontSize: 35, verticalAlign:'bottom'}}/> : null}
                    CHƯƠNG TRÌNH {isGifted ? "BỒI DƯỠNG HSG" : ""} TOÁN LỚP {gradeId}
                </Typography>
            </Box>

            {topics.length === 0 && (
                <Box textAlign="center" mt={5}>
                    <CircularProgress size={30} sx={{mb:2}} />
                    <Typography color="textSecondary">Đang cập nhật dữ liệu...</Typography>
                </Box>
            )}

            {topics.map((topic) => (
                <Accordion key={topic.id} sx={{ mb: 3, boxShadow: 3, borderRadius: '12px !important', overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'white'}}/>} sx={{ bgcolor: isGifted ? '#ef6c00' : '#1976d2', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">📚 {topic.title}</Typography>
                </AccordionSummary>
                
                <AccordionDetails sx={{ bgcolor: '#f5f7fa', p: 3 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, width: '100%' }}>
                        
                        {/* Cột 1: Tài liệu */}
                        <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 3, borderTop: '5px solid #f44336', display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" mb={2}><PictureAsPdfIcon color="error" sx={{ mr: 1 }} /><Typography variant="subtitle1" fontWeight="bold" color="error">TÀI LIỆU LÝ THUYẾT</Typography></Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                {topic.pdf_file && (
                                    <Button variant="outlined" color="error" fullWidth onClick={() => handleViewPDF(topic.pdf_file, `${topic.title} (Lý thuyết)`)} startIcon={<PictureAsPdfIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, fontWeight:'bold', border: '1px solid #ffcdd2', color: '#d32f2f', bgcolor: '#ffebee' }}>{topic.title} (Lý thuyết)</Button>
                                )}
                                {/* Danh sách Documents đã được sort AZ */}
                                {topic.documents && topic.documents.filter(d => d.doc_type === 'theory' || !d.doc_type).map(doc => (
                                    <Button key={doc.id} variant="outlined" color="error" fullWidth onClick={() => handleViewPDF(doc.file, doc.title)} startIcon={<PictureAsPdfIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1 }}>{doc.title}</Button>
                                ))}
                            </Box>
                        </Paper>

                        {/* Cột 2: Video */}
                        <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 3, borderTop: '5px solid #ff9800', display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" mb={2}><YouTubeIcon color="warning" sx={{ mr: 1 }} /><Typography variant="subtitle1" fontWeight="bold" color="warning">VIDEO BÀI GIẢNG</Typography></Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                {/* Danh sách Video đã được sort AZ */}
                                {topic.videos && topic.videos.map(video => (
                                    <Button key={video.id} variant="outlined" fullWidth onClick={() => handleWatchVideo(video.youtube_url, video.title)} startIcon={<YouTubeIcon sx={{color: 'red'}}/>} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, borderColor: '#ffcc80', color: '#e65100', bgcolor: '#fff3e0' }}>{video.title}</Button>
                                ))}
                            </Box>
                        </Paper>

                        {/* Cột 3: Đề thi */}
                        <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 3, borderTop: '5px solid #4caf50', display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" mb={2}><AssignmentIcon color="success" sx={{ mr: 1 }} /><Typography variant="subtitle1" fontWeight="bold" color="success">{isGifted ? "ĐỀ THI (PDF)" : "LUYỆN TẬP ONLINE"}</Typography></Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                {isGifted ? (
                                    topic.documents && topic.documents.filter(d => d.doc_type === 'exam').map(doc => (
                                        <Button key={doc.id} variant="contained" color="success" fullWidth onClick={() => handleViewPDF(doc.file, `${doc.title} (Đề thi)`)} startIcon={<PictureAsPdfIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, bgcolor: '#2e7d32' }}>{doc.title} (Đề thi)</Button>
                                    ))
                                ) : (
                                    // Danh sách Bài tập đã được sort AZ
                                    topic.exercises && topic.exercises.map(exam => (
                                        <Button key={exam.id} variant="contained" fullWidth startIcon={<AssignmentIcon />} 
                                            onClick={() => handleClickExam(exam.id)}
                                            sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, bgcolor: '#4caf50' }}>
                                            {exam.title} ({exam.duration}')
                                        </Button>
                                    ))
                                )}
                            </Box>
                        </Paper>
                    </Box>
                </AccordionDetails>
                </Accordion>
            ))}
         </>
      )}
    </Container>
  );
}

export default GradePage;