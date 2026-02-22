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

// 🔥 Import CSS mới tạo
import './GradePage.css';

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

  // 🔥🔥🔥 THUẬT TOÁN NATURAL SORT SIÊU CHUẨN ĐÃ ĐƯỢC CẬP NHẬT 🔥🔥🔥
  const sortAZ = (dataArray) => {
    if (!dataArray) return [];
    return [...dataArray].sort((a, b) => {
        const nameA = String(a.title || a.name || "").trim();
        const nameB = String(b.title || b.name || "").trim();
        
        // Hàm phụ để tách chuỗi thành mảng chữ và số. Ví dụ: "Đề 101" -> ["Đề ", "101"]
        const chunkify = (t) => t.match(/[^0-9]+|[0-9]+/g) || [];
        const partsA = chunkify(nameA);
        const partsB = chunkify(nameB);
        
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            let partA = partsA[i] || "";
            let partB = partsB[i] || "";
            
            // Nếu cả 2 phần cắt ra đều là số, thì so sánh theo giá trị toán học (11 sẽ < 101)
            if (!isNaN(partA) && !isNaN(partB)) {
                const numA = parseInt(partA, 10);
                const numB = parseInt(partB, 10);
                if (numA !== numB) return numA - numB;
            } else {
                // Nếu là chữ thì so sánh theo từ điển bình thường
                const cmp = partA.localeCompare(partB, 'vi');
                if (cmp !== 0) return cmp;
            }
        }
        return 0;
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
                setExams(sortAZ(res.data));
            })
            .catch(err => console.error("Lỗi tải đề thi:", err));
    } else {
        const category = isGifted ? 'gifted' : 'standard';
        axiosClient.get(`/topics/?grade=${gradeId}&category=${category}`)
            .then(res => {
                let sortedTopics = sortAZ(res.data);
                sortedTopics = sortedTopics.map(topic => ({
                    ...topic,
                    videos: sortAZ(topic.videos),
                    documents: sortAZ(topic.documents), // Hàm sortAZ mới sẽ xử lý mảng này
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

  const getHeaderInfo = () => {
      if (isTN) return { title: "Luyện Thi Tốt Nghiệp THPT", color: "#d32f2f" }; 
      if (isGifted) return { title: `Bồi Dưỡng HSG Toán ${gradeId}`, color: "#ef6c00" }; 
      return { title: `Chương Trình Toán Lớp ${gradeId}`, color: "#1976d2" }; 
  };

  const headerInfo = getHeaderInfo();

  return (
    <Container maxWidth={isTN ? "md" : "xl"} sx={{ mb: 10, padding: 0 }}> 
      
      <Backdrop sx={{ color: '#fff', zIndex: 99999 }} open={isLoadingAd}>
         <Box textAlign="center">
            <CircularProgress color="inherit" />
            <Typography sx={{mt: 2, fontWeight: 'bold'}}>Đang tải nội dung & quảng cáo...</Typography>
         </Box>
      </Backdrop>

      <div className="sticky-header" style={{ backgroundColor: headerInfo.color }}>
          <IconButton onClick={() => navigate('/')} className="btn-back-header">
              <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="header-title-text">
              {headerInfo.title}
          </Typography>
      </div>

      <Box sx={{ px: { xs: 2, md: 3 } }}> 
      
          {isTN ? (
             <>
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
                                bgcolor: 'white', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                                textTransform: 'none', border: '1px solid #eee', transition: '0.2s',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderColor: '#d32f2f' }
                            }}
                        >
                            <Box display="flex" alignItems="center">
                                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#ffebee', color: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, fontSize: 20 }}>📄</Box>
                                <Box textAlign="left">
                                    <Typography variant="h6" fontWeight="bold" color="#333" fontSize="1rem">{exam.title}</Typography>
                                    <Typography variant="caption" color="textSecondary">{exam.description || "Đề thi trắc nghiệm"}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: '#666', bgcolor: '#f5f5f5', px: 1.5, py: 0.5, borderRadius: 10 }}>
                                <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                <Typography variant="caption" fontWeight="600">{exam.duration}'</Typography>
                            </Box>
                        </Button>
                    ))}
                </Paper>
             </>
          ) : (
             <>
                {topics.length === 0 && (
                    <Box textAlign="center" mt={5}>
                        <CircularProgress size={30} sx={{mb:2}} />
                        <Typography color="textSecondary">Đang cập nhật dữ liệu...</Typography>
                    </Box>
                )}

                {topics.map((topic) => (
                    <Accordion key={topic.id} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: isGifted ? '#ef6c00' : '#1976d2'}}/>} sx={{ flexDirection: 'row-reverse' }}>
                            <Typography variant="h6" fontWeight="600" fontSize="1rem" sx={{ ml: 2, color: '#333' }}>
                                {topic.title}
                            </Typography>
                        </AccordionSummary>
                        
                        <AccordionDetails sx={{ bgcolor: '#fff', p: 2, borderTop: '1px solid #f0f0f0' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                                
                                {/* Cột 1: Tài liệu */}
                                {topic.pdf_file || (topic.documents && topic.documents.length > 0) ? (
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="error" mb={1} display="block">TÀI LIỆU</Typography>
                                        {topic.pdf_file && (
                                            <Button variant="outlined" color="error" fullWidth onClick={() => handleViewPDF(topic.pdf_file, `${topic.title} (Lý thuyết)`)} startIcon={<PictureAsPdfIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, fontSize:'0.9rem' }}>Lý thuyết PDF</Button>
                                        )}
                                        {topic.documents && topic.documents.filter(d => d.doc_type === 'theory' || !d.doc_type).map(doc => (
                                            <Button key={doc.id} variant="outlined" color="error" fullWidth onClick={() => handleViewPDF(doc.file, doc.title)} startIcon={<PictureAsPdfIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, fontSize:'0.9rem' }}>{doc.title}</Button>
                                        ))}
                                    </Box>
                                ) : null}

                                {/* Cột 2: Video */}
                                {topic.videos && topic.videos.length > 0 ? (
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="warning" mb={1} display="block">VIDEO</Typography>
                                        {topic.videos.map(video => (
                                            <Button key={video.id} variant="outlined" fullWidth onClick={() => handleWatchVideo(video.youtube_url, video.title)} startIcon={<YouTubeIcon sx={{color: 'red'}}/>} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, borderColor: '#ffcc80', color: '#e65100', fontSize:'0.9rem' }}>{video.title}</Button>
                                        ))}
                                    </Box>
                                ) : null}

                                {/* Cột 3: Đề thi */}
                                {((topic.documents && topic.documents.some(d => d.doc_type === 'exam')) || (topic.exercises && topic.exercises.length > 0)) ? (
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold" color="success" mb={1} display="block">LUYỆN TẬP</Typography>
                                        {isGifted ? (
                                            topic.documents && topic.documents.filter(d => d.doc_type === 'exam').map(doc => (
                                                <Button key={doc.id} variant="contained" color="success" fullWidth onClick={() => handleViewPDF(doc.file, `${doc.title} (Đề thi)`)} startIcon={<PictureAsPdfIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, fontSize:'0.9rem', boxShadow:'none' }}>{doc.title}</Button>
                                            ))
                                        ) : (
                                            topic.exercises && topic.exercises.map(exam => (
                                                <Button key={exam.id} variant="contained" fullWidth startIcon={<AssignmentIcon />} 
                                                    onClick={() => handleClickExam(exam.id)}
                                                    sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, bgcolor: '#4caf50', fontSize:'0.9rem', boxShadow:'none' }}>
                                                    {exam.title}
                                                </Button>
                                            ))
                                        )}
                                    </Box>
                                ) : null}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
             </>
          )}
      </Box>
    </Container>
  );
}

export default GradePage;