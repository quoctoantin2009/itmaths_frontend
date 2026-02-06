import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://api.itmaths.vn";

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', content: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            // [ĐÃ SỬA] Dùng API_BASE_URL thay vì localhost
            await axios.post(`${API_BASE_URL}/api/password-reset/`, { email });
            setMessage({ 
                type: 'success', 
                content: "Hệ thống đã gửi email hướng dẫn. Vui lòng kiểm tra hộp thư đến (và cả mục Spam) của bạn." 
            });
        } catch (err) {
            setMessage({ 
                type: 'error', 
                content: "Có lỗi xảy ra. Vui lòng kiểm tra lại email hoặc thử lại sau." 
            });
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 10 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="primary" mb={2}>QUÊN MẬT KHẨU</Typography>
                <Typography variant="body2" color="textSecondary" mb={3} align="center">
                    Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
                </Typography>
                
                {message.content && <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>{message.content}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField 
                        label="Email đăng ký" type="email" fullWidth margin="normal" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <Button 
                        type="submit" variant="contained" fullWidth size="large" 
                        sx={{ mt: 2, mb: 2 }} 
                        disabled={loading}
                    >
                        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                    </Button>
                    <Typography variant="body2" align="center">
                        <Link to="/login" style={{textDecoration: 'none', color: '#1976d2'}}>Quay lại Đăng nhập</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default ForgotPasswordPage;