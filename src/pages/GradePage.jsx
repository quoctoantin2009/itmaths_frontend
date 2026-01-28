import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, 
    Button, Paper, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssignmentIcon from '@mui/icons-material/Assignment';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; 
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://itmaths-backend.onrender.com";

function GradePage() {
  const { gradeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const type = searchParams.get('type');
  const isTN = type === 'tn';
  const isGifted = type === 'gifted';

  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]); 

  // Hàm chuyển đổi URL ảnh/pdf sang tuyệt đối
  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  useEffect(() => {
    if (isTN) {
        axios.get(`${API_BASE_URL}/api/exams/?standalone=true`)
            .then(res => setExams(res.data))
            .catch(err => console.error(err));
    } else {
        const category = isGifted ? 'gifted' : 'standard';
        axios.get(`${API_BASE_URL}/api/topics/?grade=${gradeId}&category=${category}`)
          .then(res => setTopics(res.data))
          .catch(err => console.error(err));
    }
  }, [gradeId, isTN, isGifted]);

  // --- [MỚI] HÀM XỬ LÝ XEM VIDEO ---
  const handleWatchVideo = (videoUrl, videoTitle) => {
      navigate('/video-player', { 
          state: { videoUrl: videoUrl, title: videoTitle } 
      });
  };

  // --- [MỚI] HÀM XỬ LÝ XEM PDF ---
  const handleViewPDF = (pdfRelativeUrl, docTitle) => {
      // Đảm bảo URL đầy đủ (có http://...)
      const fullUrl = getFullUrl(pdfRelativeUrl);
      
      navigate('/pdf-viewer', { 
          state: { pdfUrl: fullUrl, title: docTitle } 
      });
  };

  // --- STYLE CHO NÚT BACK ĐẸP ---
  const backButtonStyle = {
      bgcolor: 'white',
      color: '#455a64', 
      borderRadius: '30px', 
      padding: '8px 24px',
      textTransform: 'none',
      fontWeight: 'bold',
      fontSize: '1rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
      border: '1px solid white',
      transition: 'all 0.3s ease',
      '&:hover': {
          transform: 'translateY(-2px)', 
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          bgcolor: '#fafafa',
          color: '#d32f2f' 
      }
  };

  // --- GIAO DIỆN 1: ÔN THI TỐT NGHIỆP ---
  if (isTN) {
     return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 10 }}>
            <Box mb={3} display="flex">
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/')} 
                    sx={backButtonStyle}
                >
                    Quay lại
                </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#d32f2f" textTransform="uppercase">
                    LUYỆN ĐỀ TỐT NGHIỆP THPT
                </Typography>
                <Typography variant="body1" color="textSecondary" mt={1}>Tổng hợp các đề thi thử và đề chính thức mới nhất</Typography>
            </Box>
            <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                {exams.map((exam) => (
                    <Button key={exam.id} fullWidth onClick={() => navigate(`/exams/${exam.id}`)} 
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
        </Container>
     )
  }

  // --- GIAO DIỆN 2: CHƯƠNG TRÌNH HỌC (CHUẨN + HSG) ---
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}>
      <Box mb={3} display="flex">
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/')} 
                sx={backButtonStyle}
            >
                Quay lại
            </Button>
      </Box>

      <Box textAlign="center" mb={5}>
          <Typography variant="h4" fontWeight="bold" color={isGifted ? "#e65100" : "primary"} textTransform="uppercase">
            {isGifted ? <StarIcon sx={{mr: 1, fontSize: 35, verticalAlign:'bottom'}}/> : null}
            CHƯƠNG TRÌNH {isGifted ? "BỒI DƯỠNG HSG" : ""} TOÁN LỚP {gradeId}
          </Typography>
      </Box>

      {topics.length === 0 && <Typography align="center" mt={3}>Đang cập nhật dữ liệu...</Typography>}

      {topics.map((topic) => (
        <Accordion key={topic.id} defaultExpanded sx={{ mb: 3, boxShadow: 3, borderRadius: '12px !important', overflow: 'hidden' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'white'}}/>} sx={{ bgcolor: isGifted ? '#ef6c00' : '#1976d2', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">📚 {topic.title}</Typography>
          </AccordionSummary>
          
          <AccordionDetails sx={{ bgcolor: '#f5f7fa', p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, width: '100%' }}>
                
                {/* CỘT 1: TÀI LIỆU LÝ THUYẾT */}
                <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 3, borderTop: '5px solid #f44336', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" mb={2}><PictureAsPdfIcon color="error" sx={{ mr: 1 }} /><Typography variant="subtitle1" fontWeight="bold" color="error">TÀI LIỆU LÝ THUYẾT</Typography></Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        {/* [ĐÃ SỬA] File chính -> onClick */}
                        {topic.pdf_file && (
                            <Button variant="outlined" color="error" fullWidth 
                                onClick={() => handleViewPDF(topic.pdf_file, `${topic.title} (Lý thuyết)`)}
                                startIcon={<PictureAsPdfIcon />} 
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, fontWeight:'bold', border: '1px solid #ffcdd2', color: '#d32f2f', bgcolor: '#ffebee' }}
                            >
                                {topic.title} (Lý thuyết)
                            </Button>
                        )}
                        {/* [ĐÃ SỬA] File phụ -> onClick */}
                        {topic.documents && topic.documents.filter(d => d.doc_type === 'theory' || !d.doc_type).map(doc => (
                             <Button key={doc.id} variant="outlined" color="error" fullWidth 
                                onClick={() => handleViewPDF(doc.file, doc.title)}
                                startIcon={<PictureAsPdfIcon />} 
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1 }}
                            >
                                {doc.title}
                            </Button>
                        ))}
                    </Box>
                </Paper>

                {/* CỘT 2: VIDEO BÀI GIẢNG */}
                <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 3, borderTop: '5px solid #ff9800', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" mb={2}><YouTubeIcon color="warning" sx={{ mr: 1 }} /><Typography variant="subtitle1" fontWeight="bold" color="warning">VIDEO BÀI GIẢNG</Typography></Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        {/* [ĐÃ SỬA] Video -> onClick */}
                        {topic.videos && topic.videos.map(video => (
                            <Button key={video.id} variant="outlined" fullWidth 
                                onClick={() => handleWatchVideo(video.youtube_url, video.title)}
                                startIcon={<YouTubeIcon sx={{color: 'red'}}/>} 
                                sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, borderColor: '#ffcc80', color: '#e65100', bgcolor: '#fff3e0' }}
                            >
                                {video.title}
                            </Button>
                        ))}
                    </Box>
                </Paper>

                {/* CỘT 3: LUYỆN TẬP / ĐỀ THI */}
                <Paper elevation={2} sx={{ p: 2, height: '100%', borderRadius: 3, borderTop: '5px solid #4caf50', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" alignItems="center" mb={2}><AssignmentIcon color="success" sx={{ mr: 1 }} /><Typography variant="subtitle1" fontWeight="bold" color="success">{isGifted ? "ĐỀ THI (PDF)" : "LUYỆN TẬP ONLINE"}</Typography></Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                        {/* NẾU LÀ HSG: HIỂN THỊ FILE PDF LOẠI 'EXAM' */}
                        {isGifted ? (
                            topic.documents && topic.documents.filter(d => d.doc_type === 'exam').map(doc => (
                                /* [ĐÃ SỬA] Đề thi PDF -> onClick */
                                <Button key={doc.id} variant="contained" color="success" fullWidth 
                                    onClick={() => handleViewPDF(doc.file, `${doc.title} (Đề thi)`)}
                                    startIcon={<PictureAsPdfIcon />} 
                                    sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, bgcolor: '#2e7d32' }}
                                >
                                    {doc.title} (Đề thi)
                                </Button>
                            ))
                        ) : (
                            /* NẾU LÀ THƯỜNG: HIỂN THỊ BÀI TẬP TRẮC NGHIỆM -> Giữ nguyên Link nội bộ */
                            topic.exercises && topic.exercises.map(exam => (
                                <Link to={`/exams/${exam.id}`} key={exam.id} style={{textDecoration:'none'}}>
                                    <Button variant="contained" fullWidth startIcon={<AssignmentIcon />} sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, bgcolor: '#4caf50' }}>
                                        {exam.title} ({exam.duration}')
                                    </Button>
                                </Link>
                            ))
                        )}
                    </Box>
                </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}

export default GradePage;