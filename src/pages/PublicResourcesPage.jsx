import React, { useState } from 'react';
import { 
    Container, Typography, Grid, Card, CardContent, Button, 
    Box, Divider, Chip, Tabs, Tab 
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ComputerIcon from '@mui/icons-material/Computer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AdSenseBanner from '../components/AdSenseBanner'; // IMPORT QUẢNG CÁO CỦA BẠN

// Component hỗ trợ hiển thị nội dung theo từng Tab
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
        <Box sx={{ pt: 4, pb: 2, animation: 'fadeIn 0.5s' }}>
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
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10, pt: { xs: 2, md: 5 } }}>
            <Container maxWidth="lg">
                
                <Typography variant="h4" fontWeight="bold" textAlign="center" color="#4a148c" mb={4}>
                    TÀI NGUYÊN HỌC TẬP ITMATHS
                </Typography>

                {/* 🟢 THANH MENU TAB CẤU TRÚC THẺ TRANG */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', borderRadius: '8px 8px 0 0', px: 2 }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        variant="scrollable"
                        scrollButtons="auto"
                        textColor="secondary"
                        indicatorColor="secondary"
                        aria-label="Tài nguyên học tập tabs"
                    >
                        <Tab icon={<InfoIcon />} iconPosition="start" label="Giới thiệu" sx={{ fontWeight: 'bold' }} />
                        <Tab icon={<ArticleIcon />} iconPosition="start" label="Phương pháp học" sx={{ fontWeight: 'bold' }} />
                        <Tab icon={<MenuBookIcon />} iconPosition="start" label="Tài liệu & Phần mềm" sx={{ fontWeight: 'bold' }} />
                        <Tab icon={<NewspaperIcon />} iconPosition="start" label="Tin tức giáo dục" sx={{ fontWeight: 'bold' }} />
                    </Tabs>
                </Box>

                <Box sx={{ bgcolor: 'white', px: { xs: 2, md: 4 }, pb: 4, borderRadius: '0 0 8px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    
                    {/* ==========================================
                        TAB 0: GIỚI THIỆU
                    ========================================== */}
                    <CustomTabPanel value={tabValue} index={0}>
                        <Typography variant="h5" fontWeight="bold" color="#4a148c" mb={2}>
                            Chào mừng đến với ITMaths
                        </Typography>
                        <Typography variant="body1" paragraph lineHeight={1.8} fontSize="1.1rem" color="#333">
                            <b>ITMaths.vn</b> là nền tảng ôn thi và kiểm tra Toán học trực tuyến thế hệ mới, tích hợp Trí tuệ nhân tạo (AI). 
                            Được xây dựng với sứ mệnh mang lại trải nghiệm học tập hiện đại, giúp học sinh THPT nắm vững kiến thức từ cơ bản đến nâng cao, 
                            đồng thời hỗ trợ giáo viên quản lý lớp học và giao bài tập một cách tự động, chính xác.
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>Hướng dẫn sử dụng hệ thống:</Typography>
                        <ul style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444' }}>
                            <li><b>Bước 1 - Đăng ký/Đăng nhập:</b> Tạo tài khoản miễn phí để hệ thống lưu trữ lịch sử và phân tích điểm số của bạn.</li>
                            <li><b>Bước 2 - Chọn chuyên đề:</b> Truy cập kho đề thi hoặc vào Lớp học do giáo viên của bạn cung cấp mã (Invite Code).</li>
                            <li><b>Bước 3 - Làm bài trắc nghiệm:</b> Hệ thống hỗ trợ nhiều dạng câu hỏi: Chọn 1 đáp án, Đúng/Sai (chuẩn Bộ GD), và Điền đáp án.</li>
                            <li><b>Bước 4 - Chấm điểm & Hỏi AI:</b> Ngay sau khi nộp bài, bạn sẽ biết điểm. Nếu có câu khó, hãy dùng tính năng "Chat với Gia sư AI" để được hướng dẫn.</li>
                        </ul>
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <AdSenseBanner dataAdSlot="9564905223" format="auto" />
                        </Box>
                    </CustomTabPanel>

                    {/* ==========================================
                        TAB 1: PHƯƠNG PHÁP HỌC
                    ========================================== */}
                    <CustomTabPanel value={tabValue} index={1}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                    <CardContent>
                                        <Chip label="Kỹ năng" size="small" color="primary" sx={{ mb: 2 }} />
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>Mẹo giải nhanh trắc nghiệm Toán 12</Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Đứng trước 50 câu trắc nghiệm Toán trong 90 phút, kỹ năng sử dụng máy tính Casio và phương pháp loại trừ là "vũ khí" tối thượng. Bài viết này hướng dẫn cách đọc đồ thị nhanh và bấm máy tính Casio fx-580VN X để giải quyết các bài toán tích phân, số phức chỉ trong 10 giây...
                                        </Typography>
                                        <Button size="small" color="secondary">Đọc tiếp &raquo;</Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                    <CardContent>
                                        <Chip label="Tâm lý" size="small" color="warning" sx={{ mb: 2 }} />
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>Khắc phục sai lầm "đọc ẩu" đề bài</Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Rất nhiều học sinh giỏi vẫn mất điểm oan do không đọc kỹ các cụm từ "không", "mệnh đề nào sau đây SAI", hoặc nhầm lẫn giữa "giá trị cực đại" và "điểm cực đại". Dưới đây là 3 bước rèn luyện thói quen gạch chân từ khóa giúp bạn bảo toàn điểm số tuyệt đối ở mức độ nhận biết...
                                        </Typography>
                                        <Button size="small" color="secondary">Đọc tiếp &raquo;</Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                                    <CardContent>
                                        <Chip label="Lý thuyết" size="small" color="success" sx={{ mb: 2 }} />
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>Cách ghi nhớ Hình học không gian</Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Hình không gian luôn là nỗi ám ảnh của học sinh. Chìa khóa để giỏi phần này không phải là tưởng tượng tốt, mà là nắm chắc "thuật toán" kẻ thêm hình. Nắm vững 3 nguyên tắc dựng đường cao và quy tắc tính khoảng cách sẽ giúp bạn giải quyết 90% bài toán...
                                        </Typography>
                                        <Button size="small" color="secondary">Đọc tiếp &raquo;</Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </CustomTabPanel>

                    {/* ==========================================
                        TAB 2: TÀI LIỆU & PHẦN MỀM
                    ========================================== */}
                    <CustomTabPanel value={tabValue} index={2}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" fontWeight="bold" color="#e65100" mb={2} display="flex" alignItems="center" gap={1}>
                                    <ComputerIcon /> Phần Mềm Hỗ Trợ
                                </Typography>
                                <Box sx={{ bgcolor: '#fff3e0', p: 3, borderRadius: 2 }}>
                                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '2' }}>
                                        <li>
                                            <b>GeoGebra:</b> Vẽ đồ thị, hình học động cực tốt.<br/>
                                            <a href="https://www.geogebra.org/" target="_blank" rel="noreferrer" style={{ color: '#d84315' }}>Tải về GeoGebra</a>
                                        </li>
                                        <li>
                                            <b>Desmos:</b> Máy tính đồ thị trực tuyến.<br/>
                                            <a href="https://www.desmos.com/" target="_blank" rel="noreferrer" style={{ color: '#d84315' }}>Truy cập Desmos</a>
                                        </li>
                                    </ul>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" fontWeight="bold" color="#2e7d32" mb={2} display="flex" alignItems="center" gap={1}>
                                    <MenuBookIcon /> Tài Liệu PDF
                                </Typography>
                                <Box sx={{ bgcolor: '#e8f5e9', p: 3, borderRadius: 2 }}>
                                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '2' }}>
                                        <li>
                                            <b>Cấu trúc đề thi THPT 2025:</b> Phân tích định dạng mới.<br/>
                                            <a href="#" style={{ color: '#1b5e20' }}>[Tải xuống PDF]</a>
                                        </li>
                                        <li>
                                            <b>100+ công thức giải nhanh:</b> Bí kíp phòng thi.<br/>
                                            <a href="#" style={{ color: '#1b5e20' }}>[Tải xuống PDF]</a>
                                        </li>
                                    </ul>
                                </Box>
                            </Grid>
                        </Grid>
                    </CustomTabPanel>

                    {/* ==========================================
                        TAB 3: TIN TỨC GIÁO DỤC (Đặc chữ cho SEO & AdSense)
                    ========================================== */}
                    <CustomTabPanel value={tabValue} index={3}>
                        <Box sx={{ borderBottom: '1px dashed #ccc', pb: 2, mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Bộ GD&ĐT công bố quy chế thi tốt nghiệp THPT 2025</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Đăng ngày: 10/04/2026</Typography>
                            <Typography variant="body1">Kỳ thi tốt nghiệp THPT năm 2025 sẽ có nhiều thay đổi đáng chú ý về định dạng câu hỏi trắc nghiệm, đặc biệt là sự xuất hiện của dạng câu hỏi Đúng/Sai và dạng câu hỏi trả lời ngắn môn Toán...</Typography>
                        </Box>
                        <Box sx={{ borderBottom: '1px dashed #ccc', pb: 2, mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Lịch thi đánh giá năng lực ĐHQG TP.HCM năm 2026</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Đăng ngày: 05/04/2026</Typography>
                            <Typography variant="body1">Đại học Quốc gia TP.HCM vừa chính thức công bố lịch thi đánh giá năng lực (ĐGNL) cho đợt 1 và đợt 2. Đây là cơ hội quan trọng để xét tuyển vào các trường đại học top đầu...</Typography>
                        </Box>
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <AdSenseBanner dataAdSlot="9564905223" format="auto" />
                        </Box>
                    </CustomTabPanel>

                </Box>

            </Container>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Box>
    );
}

export default PublicResourcesPage;