import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Grid, Card, Button, Box, 
  CircularProgress, Alert, Paper, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HomeIcon from '@mui/icons-material/Home';

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "http://127.0.0.1:8000";

function TopicDetailPage() {
  const { topicId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận tên chuyên đề từ trang trước (nếu có) để hiển thị cho đẹp
  const topicTitle = location.state?.topicTitle || "Chi tiết Chuyên đề";
  const topicDesc = location.state?.topicDesc || "Danh sách các bài tập và đề kiểm tra.";

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // [ĐÃ SỬA] Dùng API_BASE_URL thay vì localhost
        const res = await axios.get(`${API_BASE_URL}/api/topics/${topicId}/exercises/`);
        setExams(res.data);
      } catch (error) {
        console.error("Lỗi tải bài tập:", error);
      }
      setLoading(false);
    };
    fetchExams();
  }, [topicId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      
      {/* [MỚI] THANH ĐIỀU HƯỚNG (HOME & BACK) */}
      <Box display="flex" gap={2} mb={2}>
        <Button
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '20px' }}
        >
          Trang chủ
        </Button>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="text"
          sx={{ textTransform: 'none', fontWeight: 'bold', color: '#666' }}
        >
          Quay lại
        </Button>
      </Box>

      {/* Header Tên Chuyên đề */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: '12px', background: 'linear-gradient(135deg, #f3e5f5 0%, #fff 100%)', borderLeft: '6px solid #9c27b0' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="#6a1b9a" gutterBottom>
          {topicTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {topicDesc}
        </Typography>
      </Paper>

      {/* Danh sách Bài tập */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 1, color: '#1565c0' }} />
        <Typography variant="h5" fontWeight="bold" color="#1565c0">
          Danh sách bài luyện tập
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {exams.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 2 }}>Chưa có bài tập nào được cập nhật trong chuyên đề này.</Alert>
      ) : (
        <Grid container spacing={2}>
          {exams.map((exam) => (
            <Grid item xs={12} key={exam.id}>
              <Card sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2,
                borderRadius: '10px', transition: '0.3s', border: '1px solid #e0e0e0',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderColor: '#2196f3' }
              }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" color="#2c3e50" fontWeight="bold">
                    {exam.title}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1} gap={2}>
                    <Box display="flex" alignItems="center" color="#e65100" bgcolor="#fff3e0" px={1} py={0.5} borderRadius="4px">
                      <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold">{exam.duration} phút</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" color="#2e7d32" bgcolor="#e8f5e9" px={1} py={0.5} borderRadius="4px">
                      <HelpOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold">{exam.questions ? exam.questions.length : 0} câu hỏi</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Link to={`/exams/${exam.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary" sx={{ borderRadius: '20px', px: 3, fontWeight: 'bold' }}>
                      Làm bài
                    </Button>
                  </Link>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default TopicDetailPage;