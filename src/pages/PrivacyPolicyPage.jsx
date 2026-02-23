import React from 'react';
import { Container, Typography, Box, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicyPage() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ py: 4, pt: 'max(env(safe-area-inset-top), 40px)' }}>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: '#f5f5f5' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Chính Sách Bảo Mật (Privacy Policy)
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, lineHeight: 1.7 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom mt={2}>
                    1. Giới thiệu
                </Typography>
                <Typography paragraph>
                    Chào mừng bạn đến với <b>ITMaths</b>. Chúng tôi tôn trọng và cam kết bảo vệ quyền riêng tư của người dùng. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng ứng dụng di động và trang web của ITMaths.
                </Typography>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                    2. Thông tin chúng tôi thu thập
                </Typography>
                <Typography paragraph>
                    Để cung cấp trải nghiệm học tập tốt nhất, chúng tôi thu thập các thông tin sau:
                </Typography>
                <ul>
                    <li><b>Thông tin tài khoản:</b> Bao gồm Tên hiển thị, Email và Mật khẩu (được mã hóa) khi bạn đăng ký tài khoản.</li>
                    <li><b>Dữ liệu học tập:</b> Lịch sử làm bài thi, điểm số, các đáp án bạn đã chọn và thời gian hoàn thành bài thi.</li>
                    <li><b>Dữ liệu thiết bị:</b> Loại thiết bị, hệ điều hành và các dữ liệu phân tích sự cố để cải thiện hiệu suất ứng dụng.</li>
                </ul>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                    3. Cách chúng tôi sử dụng thông tin
                </Typography>
                <Typography paragraph>
                    Dữ liệu của bạn được sử dụng duy nhất cho các mục đích:
                </Typography>
                <ul>
                    <li>Lưu trữ tiến trình học tập và cung cấp bảng điểm cá nhân hóa.</li>
                    <li>Cải thiện và tối ưu hóa nội dung các bài tập Toán học.</li>
                    <li>Xác thực danh tính và bảo mật tài khoản người dùng.</li>
                </ul>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                    4. Dịch vụ của bên thứ ba (Quảng cáo)
                </Typography>
                <Typography paragraph>
                    Ứng dụng ITMaths là ứng dụng miễn phí và được duy trì thông qua quảng cáo. Chúng tôi sử dụng các dịch vụ của bên thứ ba, cụ thể là <b>Google AdMob</b> và <b>Google AdSense</b>.
                </Typography>
                <Typography paragraph>
                    Các đối tác quảng cáo này có thể thu thập và sử dụng các dữ liệu không định danh (như ID quảng cáo trên thiết bị di động, cookie) để hiển thị các quảng cáo phù hợp với sở thích của bạn. Bạn có thể tìm hiểu thêm về cách Google sử dụng dữ liệu tại <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">Chính sách quyền riêng tư của Google</a>.
                </Typography>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                    5. Bảo mật dữ liệu
                </Typography>
                <Typography paragraph>
                    Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn (Mã hóa SSL/HTTPS, mã hóa mật khẩu) để bảo vệ thông tin của bạn khỏi việc truy cập trái phép. Tuy nhiên, không có phương thức truyền tải nào qua Internet là an toàn 100%, do đó chúng tôi không thể đảm bảo an toàn tuyệt đối.
                </Typography>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                    6. Quyền của người dùng
                </Typography>
                <Typography paragraph>
                    Bạn có quyền xem lại, chỉnh sửa thông tin cá nhân hoặc yêu cầu xóa toàn bộ tài khoản và lịch sử làm bài của mình bất kỳ lúc nào bằng cách liên hệ với chúng tôi hoặc sử dụng chức năng trong ứng dụng (nếu có).
                </Typography>

                <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                    7. Liên hệ
                </Typography>
                <Typography paragraph>
                    Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email: <b>admin@itmaths.vn</b> <i>(Hoặc điền email hỗ trợ của bạn vào đây)</i>.
                </Typography>
                
                <Typography variant="body2" color="textSecondary" align="right" mt={4}>
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                </Typography>
            </Paper>
        </Container>
    );
}

export default PrivacyPolicyPage;