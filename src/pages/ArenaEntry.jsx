import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axiosClient from '../services/axiosClient'; // Tùy chỉnh đường dẫn nếu cần

function ArenaEntry() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // HỌC SINH NHẬP PIN ĐỂ VÀO PHÒNG
    const handleJoinArena = async () => {
        if (!pin.trim()) {
            setError('Vui lòng nhập mã PIN!');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Gọi API kiểm tra mã PIN mà chúng ta đã viết ở Bước 3
            const res = await axiosClient.post('/arena/join/', { pin: pin });
            // Nếu đúng PIN, chuyển sang màn hình chơi game
            navigate(`/arena/play/${res.data.pin}`, { state: { room_title: res.data.title } });
        } catch (err) {
            setError(err.response?.data?.error || 'Không tìm thấy phòng này!');
        } finally {
            setLoading(false);
        }
    };

    // GIÁO VIÊN TẠO PHÒNG MỚI (Tạm thời là tạo nhanh không cần chọn câu hỏi để test)
    const handleCreateArena = async () => {
        setLoading(true);
        try {
            // Gọi API tạo phòng ở Bước 3
            const res = await axiosClient.post('/arena/create/', { 
                title: 'Đấu trường ITMaths Sôi Động',
                questions: [] // Tạm để rỗng, sau này sẽ làm popup chọn câu hỏi
            });
            // Chuyển sang màn hình điều khiển của Giáo viên
            navigate(`/arena/host/${res.data.pin}`);
        } catch (err) {
            alert('Có lỗi xảy ra khi tạo phòng!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: '#4a148c', // Màu nền tím đặc trưng của Kahoot
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2
        }}>
            <Container maxWidth="xs">
                <Typography variant="h3" fontWeight="900" textAlign="center" color="white" mb={4} sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    ITMaths ARENA
                </Typography>

                <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Nhập mã PIN trò chơi..."
                        value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '8px' } }}
                        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    
                    {error && <Typography color="error" fontWeight="bold" mb={2}>{error}</Typography>}

                    <Button 
                        fullWidth 
                        variant="contained" 
                        size="large" 
                        onClick={handleJoinArena}
                        disabled={loading}
                        sx={{ py: 2, fontSize: '1.2rem', fontWeight: 'bold', borderRadius: 3, bgcolor: '#333', '&:hover': { bgcolor: '#000' } }}
                    >
                        VÀO CHƠI
                    </Button>
                </Paper>

                <Box mt={6} textAlign="center">
                    <Typography color="white" mb={2} variant="body2" sx={{ opacity: 0.8 }}>Bạn là Giáo viên?</Typography>
                    <Button 
                        variant="outlined" 
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleCreateArena}
                        disabled={loading}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 5, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        Tạo phòng Đấu trường mới
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

export default ArenaEntry;