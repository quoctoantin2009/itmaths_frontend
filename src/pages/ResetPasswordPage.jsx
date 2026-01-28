import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://itmaths-backend.onrender.com";

function ResetPasswordPage() {
    const { uid, token } = useParams(); // Lấy mã bí mật từ link email
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState({ type: '', content: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setMsg({ type: 'error', content: 'Mật khẩu nhập lại không khớp!' });
            return;
        }

        try {
            // [ĐÃ SỬA] Dùng API_BASE_URL thay vì localhost
            await axios.post(`${API_BASE_URL}/api/password-reset-confirm/`, {
                uid, token, password
            });
            setMsg({ type: 'success', content: 'Đổi mật khẩu thành công! Đang chuyển hướng đăng nhập...' });
            
            // Chuyển về trang đăng nhập sau 3 giây
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMsg({ type: 'error', content: 'Link này đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.' });
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 10 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="secondary" mb={2}>ĐẶT LẠI MẬT KHẨU</Typography>
                
                {msg.content && <Alert severity={msg.type} sx={{ width: '100%', mb: 2 }}>{msg.content}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField 
                        label="Mật khẩu mới" type="password" fullWidth margin="normal" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField 
                        label="Nhập lại mật khẩu" type="password" fullWidth margin="normal" required
                        value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="success" fullWidth size="large" sx={{ mt: 2 }}>
                        Xác nhận thay đổi
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default ResetPasswordPage;