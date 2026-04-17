import React, { useState } from 'react';
import { 
    Box, Container, Typography, Paper, Tabs, Tab, 
    Divider, List, ListItem, ListItemIcon, ListItemText, Accordion, AccordionSummary, AccordionDetails,
    Grid, Card, CardContent, CardActions, Button, Chip
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import DownloadIcon from '@mui/icons-material/Download';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
                        <Tab icon={<SchoolIcon />} label="Phương pháp học" sx={{ fontWeight: 'bold', py: 2 }} />
                        <Tab icon={<MenuBookIcon />} label="Tài liệu & Phần mềm" sx={{ fontWeight: 'bold', py: 2 }} />
                        <Tab icon={<ArticleIcon />} label="Tin tức giáo dục" sx={{ fontWeight: 'bold', py: 2 }} />
                    </Tabs>

                    <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: '#fff' }}>
                        
                        {/* 🟢 TAB 0: GIỚI THIỆU & HƯỚNG DẪN */}
                        {tabValue === 0 && (
                            <Box>
                                <Box mb={6}>
                                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom sx={{ borderBottom: '3px solid #9c27b0', display: 'inline-block', pb: 1 }}>
                                        ITMaths - Nền tảng học Toán Số hóa Toàn diện
                                    </Typography>
                                    
                                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#444', mt: 3 }}>
                                        Chào mừng bạn đến với <strong>ITMaths</strong>! Được ấp ủ và phát triển với mong muốn mang công nghệ vào bục giảng, ITMaths không chỉ là một trang web thi trắc nghiệm đơn thuần, mà là một hệ sinh thái học tập khép kín. 
                                    </Typography>
                                    
                                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#444' }}>
                                        Với sự tích hợp mạnh mẽ của <b>Trí tuệ nhân tạo (AI)</b> và phương pháp <b>Học tập qua trò chơi (Gamification)</b>, chúng tôi hướng tới việc cá nhân hóa trải nghiệm của từng học sinh, giúp các em tự học một cách chủ động, qua đó góp phần giảm tải áp lực học thêm ngoài giờ. Đối với giáo viên, ITMaths cung cấp một bộ công cụ quyền lực để quản lý lớp học, soạn đề thi chuẩn format của Bộ GD&ĐT (đặc biệt xử lý mượt mà công thức LaTeX và đồ thị Toán học), và tự động hóa toàn bộ khâu chấm điểm.
                                    </Typography>

                                    <Box sx={{ mt: 3, p: 3, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" color="#7b1fa2" mb={2}>
                                            🚀 3 Cột mốc sức mạnh của ITMaths:
                                        </Typography>
                                        <List disablePadding>
                                            {[
                                                'Quản lý học thuật chuẩn xác: Giao bài, giới hạn thời gian, tùy biến thang điểm chi tiết.',
                                                'Tương tác bùng nổ: Đấu trường trực tiếp (Live Arena) mang không khí game show vào tận lớp học.',
                                                'Gia sư AI 24/7: Sẵn sàng giải đáp, phân tích bài toán qua ảnh chụp bất cứ lúc nào học sinh cần.'
                                            ].map((text, idx) => (
                                                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 35 }}><CheckCircleIcon color="secondary" /></ListItemIcon>
                                                    <ListItemText primary={<Typography sx={{ fontSize: '1.05rem', color: '#333' }}>{text}</Typography>} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </Box>

                                <Typography variant="h4" fontWeight="bold" color="secondary" gutterBottom sx={{ borderBottom: '3px solid #ffca28', display: 'inline-block', pb: 1, mb: 4 }}>
                                    Cẩm nang vận hành hệ thống (Dành cho Giáo viên)
                                </Typography>

                                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: '#555', mb: 4 }}>
                                    Để làm chủ hoàn toàn ITMaths, giáo viên chỉ cần thực hiện theo 5 bước logic dưới đây. Nhấp vào từng mục để xem hướng dẫn chi tiết:
                                </Typography>

                                <Accordion sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa' }}>
                                        <Typography variant="h6" fontWeight="bold" color="#2c3e50" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <GroupAddIcon color="primary" /> Bước 1: Khởi tạo Lớp học & Mời học sinh
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#fff', p: 3 }}>
                                        <Typography variant="body1" paragraph>
                                            Lớp học (Classroom) là nền móng đầu tiên. Tại thanh Menu chính, chọn <b>"Lớp học"</b> &rarr; <b>"Tạo lớp mới"</b>.
                                        </Typography>
                                        <ul style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem' }}>
                                            <li>Nhập tên lớp (VD: 12A1), chọn khối lớp và chương trình (Cơ bản/Bồi dưỡng).</li>
                                            <li>Sau khi tạo thành công, hệ thống sẽ cấp một <b>Mã Lớp (Invite Code)</b> gồm 6 ký tự.</li>
                                            <li>Bạn gửi mã này cho học sinh. Học sinh đăng nhập, chọn "Tham gia lớp" và nhập mã để chính thức vào lớp của bạn.</li>
                                        </ul>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa' }}>
                                        <Typography variant="h6" fontWeight="bold" color="#2c3e50" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <PostAddIcon color="secondary" /> Bước 2: Xây dựng Kho Câu hỏi & Đề thi Cá nhân
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#fff', p: 3 }}>
                                        <Typography variant="body1" paragraph>
                                            Thay vì dùng đề chung, bạn có thể tự xây dựng "tài sản" riêng của mình tại mục <b>"Quản lý Đề"</b> trên thanh Menu.
                                        </Typography>
                                        <ul style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem' }}>
                                            <li><b>Tạo Thư mục:</b> Nhấn "Thư mục mới" để phân loại (VD: Ôn thi Đại học, Đề 15 phút).</li>
                                            <li><b>Nạp câu hỏi:</b> Tại mục Đấu trường, bạn tự do gõ các câu hỏi (hỗ trợ nhập công thức LaTeX, chèn hình ảnh). Các câu này sẽ tự lưu vào kho cá nhân của bạn.</li>
                                            <li><b>Lắp ráp Đề thi:</b> Tạo một "Đề thi mới" trong thư mục. Bấm vào "Soạn câu hỏi", màn hình sẽ chia 2 cột. Bạn chỉ việc bấm dấu <b>(+)</b> ở cột trái (Kho câu hỏi) để đẩy câu hỏi sang cột phải (Đề thi).</li>
                                        </ul>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa' }}>
                                        <Typography variant="h6" fontWeight="bold" color="#2c3e50" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <AssignmentIcon color="success" /> Bước 3: Giao Bài tập & Tùy biến Điểm số
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#fff', p: 3 }}>
                                        <Typography variant="body1" paragraph>
                                            Vào lại Chi tiết Lớp học, tại tab <b>Bảng tin</b>, bạn sẽ thấy khung "Giao bài tập mới".
                                        </Typography>
                                        <ul style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem' }}>
                                            <li><b>Chọn Nguồn đề:</b> Gạt công tắc chọn lấy đề từ <i>Hệ thống</i> hoặc từ <i>Kho cá nhân</i> của bạn.</li>
                                            <li><b>Cài đặt nâng cao:</b> Bật công tắc này để thiết lập <b>Thời gian mở/đóng đề</b>. Học sinh sẽ không thể làm bài nếu quá hạn.</li>
                                            <li><b>Thang điểm tự do:</b> Bạn được quyền gõ điểm cho từng câu Trắc nghiệm, Trả lời ngắn. Đặc biệt với câu hỏi Đúng/Sai, bạn có thể chỉnh mức điểm cho việc học sinh trả lời đúng 1 ý, 2 ý, 3 ý hoặc cả 4 ý.</li>
                                        </ul>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa' }}>
                                        <Typography variant="h6" fontWeight="bold" color="#2c3e50" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <SportsEsportsIcon color="error" /> Bước 4: Tổ chức Đấu Trường (Live Arena)
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#fff', p: 3 }}>
                                        <Typography variant="body1" paragraph>
                                            Đây là tính năng "ăn tiền" nhất giúp thay đổi không khí lớp học, tương tự như Kahoot hay Blooket.
                                        </Typography>
                                        <ul style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem' }}>
                                            <li>Vào mục <b>Đấu trường</b> trên menu. Bấm <b>Tạo phòng mới</b>.</li>
                                            <li>Chọn các câu hỏi bạn muốn kiểm tra tốc độ phản xạ của học sinh.</li>
                                            <li>Hệ thống sẽ cấp một mã <b>PIN</b>. Bạn trình chiếu màn hình lớn của mình lên bảng. Học sinh truy cập ITMaths trên điện thoại, nhập PIN để vào phòng.</li>
                                            <li>Giáo viên điều khiển nhịp độ chuyển câu. Bảng xếp hạng và chuỗi thắng (Streak) sẽ thay đổi liên tục theo thời gian thực!</li>
                                        </ul>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa' }}>
                                        <Typography variant="h6" fontWeight="bold" color="#2c3e50" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <AssessmentIcon color="info" /> Bước 5: Thống kê Điểm số & Hỗ trợ AI
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: '#fff', p: 3 }}>
                                        <ul style={{ lineHeight: '1.8', color: '#444', fontSize: '1.05rem' }}>
                                            <li><b>Bảng điểm tự động:</b> Mở tab <i>Bảng điểm</i> trong Lớp học, bạn sẽ thấy toàn bộ lịch sử làm bài của học sinh. Có thể click vào biểu tượng con mắt để xem chi tiết bài làm, hoặc bấm <b>Xuất Excel</b> để nộp minh chứng cho nhà trường.</li>
                                            <li><b>Trợ lý AI (Góc dưới màn hình):</b> Cả bạn và học sinh đều có thể nhấn vào biểu tượng Robot để hỏi đáp. AI của ITMaths được huấn luyện chuyên sâu để giải Toán, hỗ trợ nhận diện cả đề bài dưới dạng hình ảnh chụp từ điện thoại cực kỳ thông minh.</li>
                                        </ul>
                                    </AccordionDetails>
                                </Accordion>

                                <Box sx={{ mt: 8, textAlign: 'center', p: 4, bgcolor: '#fdfbfb', borderRadius: 4, border: '1px dashed #ddd' }}>
                                    <AutoAwesomeIcon sx={{ fontSize: 40, color: '#f1c40f', mb: 2 }} />
                                    <Typography variant="h5" fontWeight="bold" color="#34495e" gutterBottom>
                                        Hành trình chuyển đổi số môn Toán bắt đầu từ đây!
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" paragraph>
                                        Bây giờ bạn đã nắm trong tay toàn bộ sức mạnh của ITMaths. Chúc bạn có những giờ giảng dạy thăng hoa và học sinh đạt được nhiều thành tích xuất sắc!
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        
                        {/* 🟢 TAB 1: PHƯƠNG PHÁP HỌC */}
                        {tabValue === 1 && (
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom sx={{ borderBottom: '3px solid #3498db', display: 'inline-block', pb: 1, mb: 4 }}>
                                    Bí kíp "Hack" điểm Toán
                                </Typography>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={4}>
                                        <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
                                            <CardContent>
                                                <LightbulbIcon sx={{ fontSize: 40, color: '#f1c40f', mb: 2 }} />
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>Kỹ thuật Feynman</Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8 }}>
                                                    Học sâu, nhớ lâu bằng cách: "Hãy cố gắng giải thích lại bài toán vừa làm cho một đứa trẻ 12 tuổi hiểu". Nếu bạn bị vấp ở đâu, đó chính là lỗ hổng kiến thức bạn cần ôn lại ngay lập tức.
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
                                            <CardContent>
                                                <AccessTimeIcon sx={{ fontSize: 40, color: '#e74c3c', mb: 2 }} />
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>Đồng hồ Pomodoro</Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8 }}>
                                                    Khi giải đề thi thử trên ITMaths, hãy áp dụng quy tắc: Tập trung cao độ 25 phút giải bài, sau đó nghỉ ngắn 5 phút. Điều này giúp bộ não không bị quá tải và duy trì phong độ làm bài đến những câu cuối cùng.
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
                                            <CardContent>
                                                <SpeedIcon sx={{ fontSize: 40, color: '#2ecc71', mb: 2 }} />
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>Tư duy Trắc nghiệm mới</Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8 }}>
                                                    Với định dạng Đúng/Sai và Trả lời ngắn, bấm máy tính (Casio) không còn là phép màu vạn năng. Hãy tập trung nắm chắc bản chất định lý và vẽ hình phác thảo thật nhanh để ăn điểm trọn vẹn 4 ý.
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* 🟢 TAB 2: TÀI LIỆU & PHẦN MỀM */}
                        {tabValue === 2 && (
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom sx={{ borderBottom: '3px solid #e67e22', display: 'inline-block', pb: 1, mb: 4 }}>
                                    Hành trang Toán học
                                </Typography>
                                <Typography variant="body1" paragraph color="textSecondary" mb={4}>
                                    Tổng hợp các phần mềm và tài liệu gối đầu giường không thể thiếu dành cho Giáo viên và Học sinh.
                                </Typography>

                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={1} sx={{ p: 3, borderLeft: '5px solid #3498db', borderRadius: 2 }}>
                                            <Typography variant="h6" fontWeight="bold" mb={1}>GeoGebra Classic 5/6</Typography>
                                            <Typography variant="body2" color="textSecondary" mb={2}>Phần mềm vẽ đồ thị hàm số và hình học không gian 3D trực quan nhất thế giới. Rất hữu ích cho các bài toán thiết diện và cực trị hình học.</Typography>
                                            <Button variant="outlined" size="small" startIcon={<LanguageIcon />} href="https://www.geogebra.org/download" target="_blank">Truy cập Trang chủ</Button>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={1} sx={{ p: 3, borderLeft: '5px solid #2c3e50', borderRadius: 2 }}>
                                            <Typography variant="h6" fontWeight="bold" mb={1}>Giả lập Casio FX-880BTG</Typography>
                                            <Typography variant="body2" color="textSecondary" mb={2}>Phần mềm giả lập máy tính cầm tay thế hệ mới nhất trực tiếp trên màn hình máy tính, hỗ trợ giáo viên trình chiếu cách bấm máy cho học sinh xem.</Typography>
                                            <Button variant="outlined" size="small" startIcon={<LanguageIcon />} href="https://bitexedu.com/" target="_blank">Tải từ Bitex</Button>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Paper elevation={1} sx={{ p: 3, borderLeft: '5px solid #e74c3c', borderRadius: 2 }}>
                                            <Typography variant="h6" fontWeight="bold" mb={1}>Sổ tay Công thức Toán THPT</Typography>
                                            <Typography variant="body2" color="textSecondary" mb={2}>Bản tóm tắt toàn bộ công thức Đại số và Hình học từ lớp 10 đến 12, được thiết kế dưới dạng Mindmap (Bản đồ tư duy) dễ nhớ, dễ tra cứu.</Typography>
                                            <Button variant="contained" color="error" size="small" startIcon={<DownloadIcon />}>Tải File PDF (Đang cập nhật)</Button>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* 🟢 TAB 3: TIN TỨC GIÁO DỤC */}
                        {tabValue === 3 && (
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom sx={{ borderBottom: '3px solid #27ae60', display: 'inline-block', pb: 1, mb: 4 }}>
                                    Tin tức & Quy chế Tuyển sinh
                                </Typography>
                                
                                <List sx={{ bgcolor: 'background.paper' }}>
                                    {/* Bản tin 1 */}
                                    <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', borderBottom: '1px solid #eee', py: 3 }}>
                                        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" mb={1}>
                                            <Typography variant="h6" fontWeight="bold" color="#2c3e50">
                                                Phân tích cấu trúc Đề thi Tốt nghiệp THPT môn Toán (Áp dụng từ 2025)
                                            </Typography>
                                            <Chip label="Mới nhất" color="error" size="small" />
                                        </Box>
                                        <Typography variant="body2" color="textSecondary" paragraph>
                                            Bộ GD&ĐT chính thức công bố định dạng đề thi mới. Bài thi môn Toán sẽ giảm số lượng câu hỏi trắc nghiệm truyền thống, bổ sung định dạng Đúng/Sai (yêu cầu học sinh nắm vững lý thuyết) và định dạng Trả lời ngắn (chống khoanh lụi). Mọi bài kiểm tra trên hệ thống ITMaths đều đã được cập nhật bám sát cấu trúc mới này.
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <TimelineIcon fontSize="small" /> Cập nhật: Tuần trước
                                        </Typography>
                                    </ListItem>

                                    {/* Bản tin 2 */}
                                    <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', borderBottom: '1px solid #eee', py: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" color="#2c3e50" mb={1}>
                                            Sự bùng nổ của AI trong Giáo dục: Giáo viên Toán cần làm gì?
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" paragraph>
                                            Với sự ra đời của các mô hình ngôn ngữ lớn (như Gemini), việc học sinh dùng AI để giải toán là xu hướng tất yếu. Thay vì cấm đoán, giáo viên có thể tích hợp AI vào quá trình giảng dạy để cá nhân hóa việc học. Tính năng Gia sư AI tích hợp sẵn trên ITMaths chính là công cụ để học sinh tự kiểm tra lỗi sai và hiểu bản chất bài toán ngay tại nhà.
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <TimelineIcon fontSize="small" /> Cập nhật: 2 tuần trước
                                        </Typography>
                                    </ListItem>
                                </List>
                            </Box>
                        )}

                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PublicResourcesPage;