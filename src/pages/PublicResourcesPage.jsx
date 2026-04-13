import React, { useState } from 'react';
import { 
    Box, Container, Typography, Paper, Tabs, Tab, Grid, 
    Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';

// Icons
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupIcon from '@mui/icons-material/Group';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const PublicResourcesPage = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 8 }}>
            {/* Header Banner */}
            <Box sx={{ bgcolor: '#4a148c', color: 'white', py: 6, textAlign: 'center', mb: 4, boxShadow: 3 }}>
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        Tài Nguyên & Hướng Dẫn
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Khám phá sức mạnh của hệ sinh thái giáo dục ITMaths
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        centered 
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}
                        textColor="secondary"
                        indicatorColor="secondary"
                    >
                        <Tab icon={<InfoIcon />} label="Giới thiệu & Hướng dẫn" sx={{ fontWeight: 'bold', py: 2 }} />
                        <Tab icon={<SchoolIcon />} label="Phương pháp học" sx={{ fontWeight: 'bold', py: 2 }} disabled />
                        <Tab icon={<MenuBookIcon />} label="Tài liệu & Phầm mềm" sx={{ fontWeight: 'bold', py: 2 }} disabled />
                        <Tab icon={<ArticleIcon />} label="Tin tức giáo dục" sx={{ fontWeight: 'bold', py: 2 }} disabled />
                    </Tabs>

                    <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: '#fff' }}>
                        {tabValue === 0 && (
                            <Box>
                                {/* PHẦN 1: GIỚI THIỆU CHUNG */}
                                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                                    Chào mừng đến với hệ sinh thái ITMaths
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#444' }}>
                                    <strong>ITMaths.vn</strong> không chỉ là một website thi trắc nghiệm thông thường, mà là một nền tảng chuyển đổi số toàn diện dành riêng cho môn Toán. Chúng tôi kết hợp giữa <b>Hệ thống quản lý học tập (LMS)</b>, <b>Tương tác thời gian thực (Gamification)</b>, và <b>Trí tuệ nhân tạo (AI)</b> để mang lại trải nghiệm giảng dạy - học tập hiện đại, chủ động và tối ưu nhất.
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#444' }}>
                                    Hệ thống được thiết kế bám sát định dạng thi mới nhất của Bộ GD&ĐT (Trắc nghiệm nhiều lựa chọn, Đúng/Sai, và Trả lời ngắn), hỗ trợ hiển thị công thức Toán học (LaTeX) và hình ảnh đồ thị sắc nét.
                                </Typography>

                                <Box sx={{ my: 4, p: 3, bgcolor: '#f3e5f5', borderRadius: 3, borderLeft: '6px solid #9c27b0' }}>
                                    <Typography variant="h6" fontWeight="bold" color="#7b1fa2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AutoAwesomeIcon /> Đặc quyền nổi bật
                                    </Typography>
                                    <List>
                                        {['Tích hợp Gia sư AI (Gemini) hỗ trợ giải đáp thắc mắc 24/7 qua chat và hình ảnh.',
                                          'Quản lý lớp học thông minh, tự động chấm điểm và xuất bảng điểm Excel.',
                                          'Chế độ Đấu trường trực tiếp (Live Arena) giúp tiết học bùng nổ cảm xúc.'].map((text, idx) => (
                                            <ListItem key={idx} sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 35 }}><CheckCircleIcon color="secondary" fontSize="small" /></ListItemIcon>
                                                <ListItemText primary={text} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>

                                <Divider sx={{ my: 5 }} />

                                {/* PHẦN 2: HƯỚNG DẪN SỬ DỤNG DÀNH CHO GIÁO VIÊN */}
                                <Typography variant="h4" fontWeight="bold" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <SchoolIcon fontSize="large" /> Cẩm nang dành cho Giáo viên
                                </Typography>
                                <Typography variant="body1" color="textSecondary" paragraph mb={4}>
                                    Biến ITMaths thành trợ thủ đắc lực của bạn chỉ với 4 công cụ cốt lõi sau đây:
                                </Typography>

                                <Grid container spacing={4}>
                                    {/* Bước 1: Kho Đề */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2} sx={{ height: '100%', borderRadius: 3, borderTop: '4px solid #3498db' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" color="#2980b9" gutterBottom>
                                                    1. Quản lý Kho Đề Cá Nhân
                                                </Typography>
                                                <Typography variant="body2" paragraph color="#555">
                                                    Nơi lưu trữ "tài sản trí tuệ" của riêng bạn. Không lo lẫn lộn với dữ liệu hệ thống.
                                                </Typography>
                                                <ul style={{ paddingLeft: '20px', margin: 0, color: '#444', lineHeight: '1.6' }}>
                                                    <li><b>Tạo Thư mục:</b> Phân loại đề theo khối, chương (VD: Đại số 12).</li>
                                                    <li><b>Soạn Câu hỏi:</b> Nhập câu hỏi vào kho chung bằng trình soạn thảo hỗ trợ Toán học và Hình ảnh.</li>
                                                    <li><b>Lắp ráp Đề thi:</b> Tạo một Đề thi mới, mở <i>Trình biên soạn 2 cột</i> và bấm dấu <b>(+)</b> để "bốc" câu hỏi từ kho thả vào đề thi cực kỳ nhanh chóng.</li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Bước 2: Lớp học */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2} sx={{ height: '100%', borderRadius: 3, borderTop: '4px solid #2ecc71' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" color="#27ae60" gutterBottom>
                                                    2. Vận hành Lớp Học (LMS)
                                                </Typography>
                                                <Typography variant="body2" paragraph color="#555">
                                                    Quản lý học sinh và tiến độ làm bài chuyên nghiệp.
                                                </Typography>
                                                <ul style={{ paddingLeft: '20px', margin: 0, color: '#444', lineHeight: '1.6' }}>
                                                    <li><b>Tạo Lớp:</b> Nhận ngay <i>Mã Lớp (Invite Code)</i> để gửi cho học sinh tham gia.</li>
                                                    <li><b>Thảo luận:</b> Bảng tin chung cho phép đăng thông báo, hỏi đáp đính kèm hình ảnh.</li>
                                                    <li><b>Bảng điểm:</b> Theo dõi kết quả từng em, xem lại chi tiết bài làm, và nhấn nút <b>Xuất Excel</b> để lưu trữ minh chứng.</li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Bước 3: Giao bài */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2} sx={{ height: '100%', borderRadius: 3, borderTop: '4px solid #f39c12' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" color="#d35400" gutterBottom>
                                                    3. Giao Bài Tập Nâng Cao
                                                </Typography>
                                                <Typography variant="body2" paragraph color="#555">
                                                    Kiểm soát thời gian và điểm số gắt gao như một kỳ thi thật.
                                                </Typography>
                                                <ul style={{ paddingLeft: '20px', margin: 0, color: '#444', lineHeight: '1.6' }}>
                                                    <li><b>Chọn Nguồn Đề:</b> Có thể lấy từ <i>Ngân hàng Hệ thống</i> hoặc <i>Kho Đề Cá Nhân</i>.</li>
                                                    <li><b>Cài đặt Thời gian:</b> Hẹn giờ mở đề và khóa đề tự động (Học sinh nộp trễ sẽ bị chặn).</li>
                                                    <li><b>Tùy biến Điểm số:</b> Tự do xét điểm cho từng loại câu (Trắc nghiệm, Ngắn, Đúng/Sai với 4 mức điểm linh hoạt).</li>
                                                    <li><b>Thu hồi:</b> Dễ dàng xóa bài tập khỏi lớp khi không cần thiết.</li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Bước 4: Đấu trường */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2} sx={{ height: '100%', borderRadius: 3, borderTop: '4px solid #e74c3c' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" color="#c0392b" gutterBottom>
                                                    4. Tổ chức Đấu Trường (Live)
                                                </Typography>
                                                <Typography variant="body2" paragraph color="#555">
                                                    Thay đổi không khí lớp học bằng trò chơi trắc nghiệm tốc độ cao.
                                                </Typography>
                                                <ul style={{ paddingLeft: '20px', margin: 0, color: '#444', lineHeight: '1.6' }}>
                                                    <li><b>Tạo phòng:</b> Chọn các câu hỏi từ kho, hệ thống sẽ cấp một <b>Mã PIN</b>.</li>
                                                    <li><b>Thi đấu:</b> Trình chiếu màn hình giáo viên (Host) lên bảng. Học sinh nhập PIN trên điện thoại để đua top.</li>
                                                    <li><b>Bảng xếp hạng:</b> Cập nhật điểm số và chuỗi thắng (Streak) ngay lập tức sau mỗi câu hỏi.</li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 5 }} />

                                {/* PHẦN 3: HƯỚNG DẪN SỬ DỤNG DÀNH CHO HỌC SINH */}
                                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <RocketLaunchIcon fontSize="large" /> Hướng dẫn dành cho Học sinh
                                </Typography>
                                <Box sx={{ mt: 3 }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 3, height: '100%', textAlign: 'center' }}>
                                                <GroupIcon sx={{ fontSize: 50, color: '#1976d2', mb: 1 }} />
                                                <Typography variant="h6" fontWeight="bold" mb={1}>Gia nhập Lớp học</Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Vào mục Lớp Học, nhấp "Tham gia lớp" và nhập mã Invite Code do giáo viên cung cấp để nhận bài tập về nhà.
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 3, height: '100%', textAlign: 'center' }}>
                                                <AssignmentTurnedInIcon sx={{ fontSize: 50, color: '#388e3c', mb: 1 }} />
                                                <Typography variant="h6" fontWeight="bold" mb={1}>Làm bài & Xem Lịch sử</Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Trải nghiệm giao diện thi mượt mà. Nộp bài xong sẽ biết điểm ngay, xem lại được đáp án đúng và lời giải chi tiết.
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ p: 3, bgcolor: '#fff3e0', borderRadius: 3, height: '100%', textAlign: 'center' }}>
                                                <AutoAwesomeIcon sx={{ fontSize: 50, color: '#f57c00', mb: 1 }} />
                                                <Typography variant="h6" fontWeight="bold" mb={1}>Hỏi bài cùng AI</Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Sử dụng nút Chatbot góc dưới màn hình. Gõ câu hỏi hoặc tải ảnh chụp bài toán lên để "Gia sư AI" hướng dẫn cách giải ngay lập tức.
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Lời kết */}
                                <Box sx={{ mt: 6, textAlign: 'center', p: 4, borderTop: '1px solid #eee' }}>
                                    <Typography variant="h5" fontWeight="bold" color="secondary" gutterBottom>
                                        Sẵn sàng chinh phục Toán học cùng ITMaths?
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" paragraph>
                                        Hãy đăng nhập ngay hôm nay để bắt đầu xây dựng lộ trình giảng dạy và học tập hiệu quả nhất!
                                    </Typography>
                                </Box>

                            </Box>
                        )}
                        
                        {/* Placeholder cho các tab khác */}
                        {tabValue !== 0 && (
                            <Box textAlign="center" py={10}>
                                <Typography variant="h5" color="textSecondary">Nội dung đang được cập nhật...</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PublicResourcesPage;