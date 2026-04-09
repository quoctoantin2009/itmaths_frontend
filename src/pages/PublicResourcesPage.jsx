import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, Divider, Chip } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ComputerIcon from '@mui/icons-material/Computer';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import AdSenseBanner from '../components/AdSenseBanner'; // IMPORT QUẢNG CÁO CỦA BẠN

function PublicResourcesPage() {
    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10, pt: { xs: 2, md: 5 } }}>
            <Container maxWidth="lg">
                
                {/* 1. GIỚI THIỆU & HƯỚNG DẪN SỬ DỤNG ITMATHS */}
                <Box sx={{ bgcolor: 'white', p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 5 }}>
                    <Typography variant="h4" fontWeight="bold" color="#4a148c" mb={2} display="flex" alignItems="center" gap={1}>
                        <InfoIcon fontSize="large" /> Giới thiệu ITMaths
                    </Typography>
                    <Typography variant="body1" paragraph lineHeight={1.8} fontSize="1.1rem" color="#333">
                        Chào mừng bạn đến với <b>ITMaths.vn</b> - Nền tảng ôn thi và kiểm tra Toán học trực tuyến thế hệ mới, tích hợp Trí tuệ nhân tạo (AI). 
                        ITMaths được xây dựng với sứ mệnh mang lại trải nghiệm học tập hiện đại, giúp học sinh THPT nắm vững kiến thức từ cơ bản đến nâng cao, 
                        đồng thời hỗ trợ giáo viên quản lý lớp học và giao bài tập một cách tự động, chính xác.
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>Hướng dẫn sử dụng hệ thống:</Typography>
                    <ul style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444' }}>
                        <li><b>Bước 1 - Đăng ký/Đăng nhập:</b> Tạo tài khoản miễn phí để hệ thống lưu trữ lịch sử và phân tích điểm số của bạn.</li>
                        <li><b>Bước 2 - Chọn chuyên đề:</b> Truy cập kho đề thi hoặc vào Lớp học do giáo viên của bạn cung cấp mã (Invite Code).</li>
                        <li><b>Bước 3 - Làm bài trắc nghiệm:</b> Hệ thống hỗ trợ nhiều dạng câu hỏi: Chọn 1 đáp án, Đúng/Sai (chuẩn Bộ GD), và Điền đáp án ngắn.</li>
                        <li><b>Bước 4 - Chấm điểm & Hỏi AI:</b> Ngay sau khi nộp bài, bạn sẽ biết điểm. Nếu có câu khó, hãy dùng tính năng "Chat với Gia sư AI" để được giải thích chi tiết từng bước.</li>
                    </ul>
                </Box>

                {/* 🔥 ĐẶT QUẢNG CÁO ADSENSE VÀO GIỮA CÁC KHỐI NỘI DUNG MỘT CÁCH TỰ NHIÊN */}
                <Box sx={{ my: 4, textAlign: 'center' }}>
                    <AdSenseBanner dataAdSlot="9564905223" format="auto" />
                </Box>

                {/* 2. GÓC CHIA SẺ PHƯƠNG PHÁP HỌC TOÁN (BLOG TĂNG TEXT CHO SEO) */}
                <Typography variant="h5" fontWeight="bold" color="#1976d2" mb={3} display="flex" alignItems="center" gap={1}>
                    <ArticleIcon /> Góc Phương Pháp Học Toán
                </Typography>
                <Grid container spacing={3} mb={5}>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardContent>
                                <Chip label="Kỹ năng" size="small" color="primary" sx={{ mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Mẹo giải nhanh trắc nghiệm Toán 12</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Đứng trước 50 câu trắc nghiệm Toán trong 90 phút, kỹ năng sử dụng máy tính Casio và phương pháp loại trừ là "vũ khí" tối thượng. Bài viết này hướng dẫn cách đọc đồ thị nhanh và bấm máy tính Casio fx-580VN X để giải quyết các bài toán tích phân, số phức chỉ trong 10 giây...
                                </Typography>
                                <Button size="small" color="primary">Đọc tiếp &raquo;</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardContent>
                                <Chip label="Tâm lý" size="small" color="secondary" sx={{ mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Khắc phục sai lầm "đọc ẩu" đề bài</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Rất nhiều học sinh giỏi vẫn mất điểm oan do không đọc kỹ các cụm từ "không", "mệnh đề nào sau đây SAI", hoặc nhầm lẫn giữa "giá trị cực đại" và "điểm cực đại". Dưới đây là 3 bước rèn luyện thói quen gạch chân từ khóa giúp bạn bảo toàn điểm số tuyệt đối ở mức độ nhận biết - thông hiểu...
                                </Typography>
                                <Button size="small" color="primary">Đọc tiếp &raquo;</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <CardContent>
                                <Chip label="Lý thuyết" size="small" color="success" sx={{ mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Cách ghi nhớ Hình học không gian</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Hình không gian luôn là nỗi ám ảnh của học sinh. Chìa khóa để giỏi phần này không phải là tưởng tượng tốt, mà là nắm chắc "thuật toán" kẻ thêm hình. Nắm vững 3 nguyên tắc dựng đường cao và quy tắc tính khoảng cách sẽ giúp bạn giải quyết 90% bài toán Oxyz và hình học cổ điển...
                                </Typography>
                                <Button size="small" color="primary">Đọc tiếp &raquo;</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 5 }} />

                <Grid container spacing={4}>
                    {/* 3. TÀI NGUYÊN PHẦN MỀM */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" fontWeight="bold" color="#e65100" mb={3} display="flex" alignItems="center" gap={1}>
                            <ComputerIcon /> Phần Mềm Học Tập
                        </Typography>
                        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '2' }}>
                                <li>
                                    <b>GeoGebra:</b> Phần mềm vẽ đồ thị, hình học động số 1 thế giới. Hỗ trợ minh họa cực tốt cho giáo viên và học sinh. <br/>
                                    <a href="https://www.geogebra.org/" target="_blank" rel="noreferrer" style={{ color: '#1976d2' }}>Tải về GeoGebra</a>
                                </li>
                                <li>
                                    <b>Desmos:</b> Máy tính đồ thị trực tuyến, dễ dùng, chạy thẳng trên nền web. Rất phù hợp để kiểm tra nhanh hàm số.<br/>
                                    <a href="https://www.desmos.com/" target="_blank" rel="noreferrer" style={{ color: '#1976d2' }}>Truy cập Desmos</a>
                                </li>
                                <li>
                                    <b>MathType & LaTeX:</b> Công cụ gõ công thức Toán học chuyên nghiệp dành cho giáo viên soạn đề thi.<br/>
                                </li>
                            </ul>
                        </Box>
                    </Grid>

                    {/* 4. TÀI NGUYÊN TÀI LIỆU PDF */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" fontWeight="bold" color="#2e7d32" mb={3} display="flex" alignItems="center" gap={1}>
                            <MenuBookIcon /> Tài Liệu Giảng Dạy & Học Tập
                        </Typography>
                        <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '2' }}>
                                <li>
                                    <b>Cấu trúc đề thi Tốt nghiệp THPT mới (từ 2025):</b> Phân tích định dạng Đúng/Sai và Trả lời ngắn.<br/>
                                    <a href="#" style={{ color: '#1976d2' }}>[PDF] Tải xuống cấu trúc đề minh họa</a>
                                </li>
                                <li>
                                    <b>Tổng hợp 100+ công thức giải nhanh Toán 12:</b> Bí kíp mang vào phòng thi.<br/>
                                    <a href="#" style={{ color: '#1976d2' }}>[PDF] Tải xuống sổ tay công thức</a>
                                </li>
                                <li>
                                    <b>Chuyên đề Đạo hàm & Tích phân nâng cao:</b> Dành cho học sinh mục tiêu 9+.<br/>
                                    <a href="#" style={{ color: '#1976d2' }}>[PDF] Tải xuống chuyên đề nâng cao</a>
                                </li>
                            </ul>
                        </Box>
                    </Grid>
                </Grid>

                {/* 🔥 THÊM MỘT BANNER ADSEN QUẢNG CÁO NỮA Ở CUỐI TRANG */}
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                    <AdSenseBanner dataAdSlot="9564905223" format="auto" />
                </Box>

            </Container>
        </Box>
    );
}

export default PublicResourcesPage;