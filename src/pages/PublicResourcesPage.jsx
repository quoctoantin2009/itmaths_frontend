import React, { useState } from 'react';
import { 
    Container, Typography, Grid, Card, CardContent, Button, 
    Box, Divider, Chip, Tabs, Tab, Paper 
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ComputerIcon from '@mui/icons-material/Computer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AdSenseBanner from '../components/AdSenseBanner';

// Component hỗ trợ hiển thị nội dung theo từng Tab với hiệu ứng Fade-in
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 4, pb: 2, animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function PublicResourcesPage() {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', 
            minHeight: '100vh', 
            pb: 10, 
            pt: { xs: 3, md: 6 } 
        }}>
            <Container maxWidth="lg">
                
                {/* TIÊU ĐỀ GRADIENT HIỆN ĐẠI */}
                <Typography 
                    variant="h3" 
                    fontWeight="900" 
                    textAlign="center" 
                    mb={5}
                    sx={{
                        background: 'linear-gradient(45deg, #4a148c 30%, #ff4081 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0px 4px 10px rgba(74, 20, 140, 0.1)'
                    }}
                >
                    TÀI NGUYÊN HỌC TẬP
                </Typography>

                {/* KHUNG CHỨA TOÀN BỘ NỘI DUNG (PAPER GIẢ TẠO ĐỘ SÂU) */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        borderRadius: 4, 
                        bgcolor: 'rgba(255, 255, 255, 0.9)', 
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        overflow: 'hidden'
                    }}
                >
                    {/* 🟢 THANH MENU TAB DẠNG "PILL" (VIÊN THUỐC) */}
                    <Box sx={{ 
                        borderBottom: '1px solid rgba(0,0,0,0.05)', 
                        bgcolor: '#fafafa', 
                        px: { xs: 1, md: 3 }, 
                        py: 2 
                    }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange} 
                            variant="scrollable"
                            scrollButtons="auto"
                            TabIndicatorProps={{ style: { display: 'none' } }} // Ẩn gạch đít mặc định
                            sx={{
                                '& .MuiTab-root': {
                                    minHeight: '48px',
                                    borderRadius: '30px',
                                    mx: 0.5,
                                    px: 3,
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    color: '#757575',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(74, 20, 140, 0.05)',
                                        color: '#4a148c',
                                    }
                                },
                                '& .Mui-selected': {
                                    background: 'linear-gradient(45deg, #4a148c, #7b1fa2)',
                                    color: '#fff !important',
                                    boxShadow: '0 4px 15px rgba(123, 31, 162, 0.3)',
                                }
                            }}
                        >
                            <Tab icon={<InfoIcon />} iconPosition="start" label="Giới thiệu" />
                            <Tab icon={<ArticleIcon />} iconPosition="start" label="Phương pháp học" />
                            <Tab icon={<MenuBookIcon />} iconPosition="start" label="Tài liệu & Phần mềm" />
                            <Tab icon={<NewspaperIcon />} iconPosition="start" label="Tin tức giáo dục" />
                        </Tabs>
                    </Box>

                    <Box sx={{ px: { xs: 2, md: 5 }, pb: 5 }}>
                        
                        {/* ==========================================
                            TAB 0: GIỚI THIỆU
                        ========================================== */}
                        <CustomTabPanel value={tabValue} index={0}>
                            <Grid container spacing={4} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h5" fontWeight="800" color="#4a148c" mb={2}>
                                        Chào mừng đến với ITMaths
                                    </Typography>
                                    <Typography variant="body1" paragraph lineHeight={1.8} fontSize="1.1rem" color="#424242">
                                        <b>ITMaths.vn</b> là nền tảng ôn thi và kiểm tra Toán học trực tuyến thế hệ mới, tích hợp Trí tuệ nhân tạo (AI). 
                                        Chúng tôi mang lại trải nghiệm học tập hiện đại, giúp học sinh nắm vững kiến thức từ cơ bản đến nâng cao, 
                                        đồng thời hỗ trợ giáo viên quản lý lớp học tự động, chính xác.
                                    </Typography>
                                    
                                    <Box sx={{ mt: 4, p: 3, bgcolor: '#f3e5f5', borderRadius: 3, borderLeft: '6px solid #ab47bc' }}>
                                        <Typography variant="h6" fontWeight="bold" mb={2} color="#6a1b9a">🚀 4 Bước Chinh Phục Điểm Cao:</Typography>
                                        <ul style={{ lineHeight: '2', fontSize: '1.05rem', color: '#4a4a4a', margin: 0 }}>
                                            <li><b>Đăng ký / Đăng nhập:</b> Lưu trữ lịch sử và phân tích năng lực.</li>
                                            <li><b>Chọn chuyên đề:</b> Làm bài tự do hoặc vào Lớp học qua Invite Code.</li>
                                            <li><b>Làm bài thi:</b> Trải nghiệm định dạng Đúng/Sai, Trả lời ngắn chuẩn Bộ GD&ĐT.</li>
                                            <li><b>Chấm điểm & Hỏi AI:</b> Biết điểm ngay và chat với Gia sư AI để gỡ rối những câu khó.</li>
                                        </ul>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box 
                                        component="img" 
                                        src="https://img.freepik.com/free-vector/mathematics-concept-illustration_114360-3972.jpg" 
                                        alt="Math Illustration"
                                        sx={{ width: '100%', borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 5, textAlign: 'center' }}>
                                <AdSenseBanner dataAdSlot="9564905223" format="auto" />
                            </Box>
                        </CustomTabPanel>

                        {/* ==========================================
                            TAB 1: PHƯƠNG PHÁP HỌC (FLOATING CARDS)
                        ========================================== */}
                        <CustomTabPanel value={tabValue} index={1}>
                            <Grid container spacing={4}>
                                {[
                                    { tag: "Kỹ năng", color: "primary", title: "Mẹo giải nhanh trắc nghiệm Toán 12", desc: "Kỹ năng đọc đồ thị nhanh và bấm máy tính Casio fx-580VN X để giải quyết các bài toán tích phân, số phức chỉ trong 10 giây..." },
                                    { tag: "Tâm lý", color: "error", title: "Khắc phục sai lầm 'đọc ẩu' đề bài", desc: "Rất nhiều học sinh giỏi vẫn mất điểm oan do không đọc kỹ các cụm từ 'không', 'mệnh đề nào sau đây SAI'. Dưới đây là 3 bước rèn luyện..." },
                                    { tag: "Lý thuyết", color: "success", title: "Cách ghi nhớ Hình học không gian", desc: "Chìa khóa để giỏi phần này không phải là tưởng tượng, mà là nắm chắc 'thuật toán' kẻ thêm hình. Nắm vững 3 nguyên tắc dựng đường cao..." }
                                ].map((item, idx) => (
                                    <Grid item xs={12} md={4} key={idx}>
                                        <Card 
                                            sx={{ 
                                                height: '100%', 
                                                borderRadius: 3, 
                                                border: '1px solid #eee',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-10px)',
                                                    boxShadow: '0 15px 30px rgba(74, 20, 140, 0.12)',
                                                    borderColor: '#e1bee7'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                <Chip label={item.tag} size="small" color={item.color} sx={{ mb: 2, fontWeight: 'bold' }} />
                                                <Typography variant="h6" fontWeight="800" mb={1.5} lineHeight={1.4}>{item.title}</Typography>
                                                <Typography variant="body2" color="text.secondary" paragraph lineHeight={1.6}>
                                                    {item.desc}
                                                </Typography>
                                                <Button endIcon={<PlayArrowIcon />} sx={{ fontWeight: 'bold', px: 0, '&:hover': { bgcolor: 'transparent', color: '#7b1fa2' } }}>
                                                    Đọc tiếp
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CustomTabPanel>

                        {/* ==========================================
                            TAB 2: TÀI LIỆU & PHẦN MỀM
                        ========================================== */}
                        <CustomTabPanel value={tabValue} index={2}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h5" fontWeight="800" color="#f57c00" mb={3} display="flex" alignItems="center" gap={1}>
                                        <ComputerIcon fontSize="large"/> Phần Mềm Hỗ Trợ
                                    </Typography>
                                    <Box sx={{ bgcolor: '#fff3e0', p: 3, borderRadius: 3, transition: '0.3s', '&:hover': { bgcolor: '#ffe0b2' } }}>
                                        <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '2.2', fontSize: '1.05rem' }}>
                                            <li>
                                                <b>GeoGebra:</b> Vẽ đồ thị, hình học động cực tốt.<br/>
                                                <a href="https://www.geogebra.org/" target="_blank" rel="noreferrer" style={{ color: '#e65100', textDecoration: 'none', fontWeight: 'bold' }}>&rarr; Tải về GeoGebra</a>
                                            </li>
                                            <li style={{ marginTop: '10px' }}>
                                                <b>Desmos:</b> Máy tính đồ thị trực tuyến siêu nhẹ.<br/>
                                                <a href="https://www.desmos.com/" target="_blank" rel="noreferrer" style={{ color: '#e65100', textDecoration: 'none', fontWeight: 'bold' }}>&rarr; Truy cập Desmos</a>
                                            </li>
                                        </ul>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="h5" fontWeight="800" color="#2e7d32" mb={3} display="flex" alignItems="center" gap={1}>
                                        <MenuBookIcon fontSize="large" /> Tài Liệu PDF
                                    </Typography>
                                    <Box sx={{ bgcolor: '#e8f5e9', p: 3, borderRadius: 3, transition: '0.3s', '&:hover': { bgcolor: '#c8e6c9' } }}>
                                        <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '2.2', fontSize: '1.05rem' }}>
                                            <li>
                                                <b>Cấu trúc đề thi THPT 2025:</b> Phân tích định dạng mới nhất.<br/>
                                                <a href="#" style={{ color: '#1b5e20', textDecoration: 'none', fontWeight: 'bold' }}>&darr; Tải xuống PDF</a>
                                            </li>
                                            <li style={{ marginTop: '10px' }}>
                                                <b>100+ công thức giải nhanh:</b> Sổ tay bỏ túi.<br/>
                                                <a href="#" style={{ color: '#1b5e20', textDecoration: 'none', fontWeight: 'bold' }}>&darr; Tải xuống PDF</a>
                                            </li>
                                        </ul>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CustomTabPanel>

                        {/* ==========================================
                            TAB 3: TIN TỨC GIÁO DỤC
                        ========================================== */}
                        <CustomTabPanel value={tabValue} index={3}>
                            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
                                {[
                                    { date: '10/04/2026', title: 'Bộ GD&ĐT công bố quy chế thi tốt nghiệp THPT 2025', snippet: 'Kỳ thi tốt nghiệp THPT năm 2025 sẽ có nhiều thay đổi đáng chú ý về định dạng câu hỏi trắc nghiệm, đặc biệt là sự xuất hiện của dạng câu hỏi Đúng/Sai...' },
                                    { date: '05/04/2026', title: 'Lịch thi đánh giá năng lực ĐHQG TP.HCM năm 2026', snippet: 'Đại học Quốc gia TP.HCM vừa chính thức công bố lịch thi đánh giá năng lực cho đợt 1 và đợt 2. Đây là cơ hội xét tuyển vào các trường đại học top đầu...' }
                                ].map((news, idx) => (
                                    <Box key={idx} sx={{ 
                                        p: 3, mb: 3, 
                                        bgcolor: 'white', 
                                        borderRadius: 3, 
                                        border: '1px solid #e0e0e0',
                                        transition: '0.2s',
                                        '&:hover': { borderColor: '#4a148c', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                                    }}>
                                        <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>{news.date}</Typography>
                                        <Typography variant="h6" fontWeight="800" mb={1}>{news.title}</Typography>
                                        <Typography variant="body1" color="text.secondary">{news.snippet}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            
                            <Box sx={{ mt: 5, textAlign: 'center' }}>
                                <AdSenseBanner dataAdSlot="9564905223" format="auto" />
                            </Box>
                        </CustomTabPanel>

                    </Box>
                </Paper>
            </Container>
            
            {/* CSS CHUẨN CHO HIỆU ỨNG CHUYỂN ĐỘNG */}
            <style>{`
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(15px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Box>
    );
}

export default PublicResourcesPage;