import React, { useState, useEffect } from 'react';
import { 
    Container, TextField, Button, Typography, Paper, Box, Alert, CircularProgress, 
    Dialog, DialogContent, Slide 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icon tích xanh
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.jpg';

// [QUAN TRỌNG] CẤU HÌNH ĐỊA CHỈ IP
const API_BASE_URL = "https://api.itmaths.vn";

// --- HIỆU ỨNG TRƯỢT LÊN CHO DIALOG ---
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

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
    
    // State điều khiển Dialog thành công
    const [openSuccess, setOpenSuccess] = useState(false);

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
            
            // [THAY ĐỔI] Không dùng alert nữa, mở Dialog đẹp
            setLoading(false); // Tắt loading trước
            setOpenSuccess(true); // Mở bảng thông báo đẹp

        } catch (err) {
            setLoading(false);
            console.error(err);
            if (err.response && err.response.data) {
                const serverErrors = err.response.data;
                const errorMsg = Object.keys(serverErrors).map(key => 
                    `${serverErrors[key]}`
                ).join(', ');
                setError(errorMsg || 'Đăng ký thất bại.');
            } else {
                setError('Lỗi kết nối Server.');
            }
        }
    };

    // Hàm chuyển trang khi bấm nút trong Dialog
    const handleCloseSuccess = () => {
        setOpenSuccess(false);
        navigate('/login');
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
                    backgroundColor: '#ffffff',
                }}>
                    
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

            {/* --- [MỚI] DIALOG THÔNG BÁO THÀNH CÔNG ĐẸP LUNG LINH --- */}
            <Dialog
                open={openSuccess}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseSuccess}
                PaperProps={{
                    style: { 
                        borderRadius: 20, 
                        padding: '20px', 
                        minWidth: '300px',
                        textAlign: 'center' 
                    }
                }}
            >
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
                    
                    {/* ICON TÍCH XANH CÓ HIỆU ỨNG PULSE */}
                    <Box sx={{
                        width: 80, height: 80, borderRadius: '50%',
                        bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mb: 2,
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                            '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
                            '70%': { boxShadow: '0 0 0 20px rgba(76, 175, 80, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
                        }
                    }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 50, color: '#4caf50' }} />
                    </Box>

                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                        Thành công!
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                        Chào mừng bạn gia nhập <b>ItMaths</b>.<br/>
                        Tài khoản đã được tạo thành công.
                    </Typography>

                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={handleCloseSuccess}
                        sx={{ 
                            borderRadius: 10, py: 1.5, fontSize: '1rem',
                            background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(76, 175, 80, 0.4)'
                        }}
                    >
                        Đăng nhập ngay
                    </Button>

                </DialogContent>
            </Dialog>

        </Box>
    );
}

export default RegisterPage;