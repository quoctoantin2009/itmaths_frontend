import React, { useState, useEffect } from 'react';
import { 
    Container, TextField, Button, Typography, Paper, Box, Alert, CircularProgress, Avatar 
} from '@mui/material';
import FunctionsIcon from '@mui/icons-material/Functions'; // Logo
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.jpg';
// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://api.itmaths.vn";

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Nếu đã đăng nhập rồi thì không cho vào trang đăng ký
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) navigate('/');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp!');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/register/`, {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            // Đăng ký thành công -> Chuyển sang đăng nhập
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                // Hiển thị lỗi từ server (ví dụ: Tên đã tồn tại)
                const serverErrors = err.response.data;
                const errorMsg = Object.keys(serverErrors).map(key => 
                    `${serverErrors[key]}`
                ).join(', ');
                setError(errorMsg || 'Đăng ký thất bại.');
            } else {
                setError('Lỗi kết nối Server.');
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
            background: 'linear-gradient(135deg, #311b92 0%, #673ab7 100%)', // Đồng bộ màu tím
            padding: 2
        }}>
            <Container maxWidth="xs">
                <Paper elevation={10} sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    backgroundColor: '#ffffff',
                }}>
                    
                    {/* Logo & Tên ứng dụng */}
                    <Box mb={1}>
                    <img src={logoImage} alt="ItMaths Logo" style={{ width: 80, height: 80 }} />
                    </Box>
                    
                    <Typography component="h1" variant="h5" fontWeight="800" color="primary">
                        ItMaths
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={3}>
                        Tạo tài khoản mới
                    </Typography>

                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
                        <TextField 
                            label="Tên đăng nhập" name="username" required fullWidth margin="dense"
                            value={formData.username} onChange={handleChange}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField 
                            label="Email" name="email" type="email" fullWidth margin="dense"
                            value={formData.email} onChange={handleChange}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField 
                            label="Mật khẩu" name="password" type="password" required fullWidth margin="dense"
                            value={formData.password} onChange={handleChange}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField 
                            label="Nhập lại mật khẩu" name="confirmPassword" type="password" required fullWidth margin="dense"
                            value={formData.confirmPassword} onChange={handleChange}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth 
                            size="large" 
                            sx={{ 
                                mt: 3, mb: 2, py: 1.5, 
                                borderRadius: 3, 
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(103, 58, 183, 0.5)',
                            }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit"/> : 'Đăng Ký Tài Khoản'}
                        </Button>
                        
                        <Box textAlign="center" mt={2}>
                            <Typography variant="body2" color="textSecondary">
                                Đã có tài khoản? <Link to="/login" style={{textDecoration: 'none', fontWeight:'bold', color: '#673ab7'}}>Đăng nhập ngay</Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default RegisterPage;