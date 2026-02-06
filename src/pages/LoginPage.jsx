import React, { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Typography, Paper, Box, Alert, CircularProgress
} from '@mui/material';
import axiosClient from '../services/axiosClient'; // 🟢 DÙNG CÁI NÀY THAY CHO AXIOS THƯỜNG
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.jpg';

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Nếu đã đăng nhập rồi thì đá về trang chủ ngay
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 🟢 [SỬA LẠI] Dùng axiosClient
            // Link gốc đã là .../api rồi, nên chỉ cần gọi /login/ (hoặc /token/)
            // ĐỪNG QUÊN DẤU / Ở CUỐI
            const res = await axiosClient.post('/login/', {
                username,
                password
            });
            
            // Lưu Token
            localStorage.setItem('accessToken', res.data.access);
            localStorage.setItem('refreshToken', res.data.refresh);
            localStorage.setItem('username', username); 

            // Chuyển hướng
            navigate('/'); 
            
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            
            if (err.response && err.response.status === 401) {
                setError('Sai tên đăng nhập hoặc mật khẩu!');
            } else if (err.code === "ERR_NETWORK") {
                setError('Không thể kết nối Server! Vui lòng kiểm tra Wifi/4G.');
            } else {
                setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #311b92 0%, #673ab7 100%)',
            padding: 2
        }}>
            <Container maxWidth="xs">
                <Paper elevation={10} sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    backgroundColor: '#ffffff',
                }}>
                    
                    <Box mb={1}>
                        <img src={logoImage} alt="ItMaths Logo" style={{ width: 80, height: 80 }} />
                    </Box>
                    
                    <Typography component="h1" variant="h4" fontWeight="800" color="primary" sx={{ mb: 0.5, letterSpacing: 1 }}>
                        ItMaths
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" mb={3} sx={{ fontWeight: 500 }}>
                        Chào mừng bạn quay trở lại!
                    </Typography>
                    
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                        <TextField 
                            label="Tên đăng nhập" fullWidth margin="normal" required
                            value={username} onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField 
                            label="Mật khẩu" type="password" fullWidth margin="normal" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        
                        <Box textAlign="right" mt={1}>
                            <Link to="/forgot-password" style={{ fontSize: '14px', textDecoration: 'none', color: '#673ab7', fontWeight: 600 }}>
                                Quên mật khẩu?
                            </Link>
                        </Box>
                        
                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth 
                            size="large" 
                            sx={{ 
                                mt: 3, mb: 2, py: 1.5, 
                                borderRadius: 3, 
                                fontSize: '1rem', fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(103, 58, 183, 0.5)',
                            }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit"/> : 'Đăng nhập'}
                        </Button>
                        
                        <Box textAlign="center" mt={2}>
                            <Typography variant="body2" color="textSecondary">
                                Chưa có tài khoản? <Link to="/register" style={{textDecoration: 'none', fontWeight:'bold', color: '#673ab7'}}>Đăng ký ngay</Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default LoginPage;