import React, { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Typography, Paper, Box, Alert, CircularProgress, Avatar
} from '@mui/material';
// Import icon để làm Logo giả lập (Bạn có thể thay bằng file ảnh sau này)
import FunctionsIcon from '@mui/icons-material/Functions';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.jpg';
// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://itmaths-backend.onrender.com";

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
            const res = await axios.post(`${API_BASE_URL}/api/login/`, {
                username,
                password
            });
            
            localStorage.setItem('accessToken', res.data.access);
            localStorage.setItem('refreshToken', res.data.refresh);
            localStorage.setItem('username', username); 

            navigate('/'); 
            
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError('Sai tên đăng nhập hoặc mật khẩu!');
            } else {
                setError('Không thể kết nối đến Server. Vui lòng kiểm tra mạng.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // [THAY ĐỔI 1] Bao bọc ngoài cùng bằng Box có nền Gradient Tím Đậm
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #311b92 0%, #673ab7 100%)', // Màu tím đậm sang trọng
            padding: 2
        }}>
            <Container maxWidth="xs">
                <Paper elevation={10} sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4, // Bo góc mềm mại hơn
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', // Hiệu ứng bóng đổ sâu
                    backgroundColor: '#ffffff', // Nền trắng làm nổi bật nội dung
                }}>
                    
                    {/* [THAY ĐỔI 2] Phần Logo và Tên Ứng Dụng */}
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
                                boxShadow: '0 4px 12px rgba(103, 58, 183, 0.5)', // Bóng đổ cho nút
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