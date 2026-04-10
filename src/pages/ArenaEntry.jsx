import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Box, Typography, TextField, Button, Paper, 
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogActions, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axiosClient from '../services/axiosClient';

function ArenaEntry() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // State cho thông báo Toast
    const [toast, setToast] = useState({ open: false, message: '', type: 'error' });

    // 🟢 State cho Dialog Tạo Phòng
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [availableExams, setAvailableExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [arenaTitle, setArenaTitle] = useState('Đấu trường ITMaths');
    const [loadingExams, setLoadingExams] = useState(false);

    const showToast = (message, type = 'error') => {
        setToast({ open: true, message, type });
    };

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

    const handleJoinArena = async () => {
        if (!pin.trim()) {
            setError('Vui lòng nhập mã PIN!');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axiosClient.post('/arena/join/', { pin: pin });
            navigate(`/arena/play/${res.data.pin}`, { state: { room_title: res.data.title } });
        } catch (err) {
            setError(err.response?.data?.error || 'Không tìm thấy phòng này!');
        } finally {
            setLoading(false);
        }
    };

    // 🟢 Mở Modal và tải danh sách đề thi
    const handleOpenCreateModal = async () => {
        setOpenCreateModal(true);
        setLoadingExams(true);
        try {
            const res = await axiosClient.get('/arena/available-exams/');
            setAvailableExams(res.data);
        } catch (err) {
            showToast('Lỗi khi tải danh sách đề thi. Vui lòng thử lại sau.', 'error');
        } finally {
            setLoadingExams(false);
        }
    };

    // 🟢 Gửi API Tạo phòng thực sự
    const submitCreateArena = async () => {
        if (!selectedExam) {
            showToast('Vui lòng chọn một đề thi để tiếp tục!', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/arena/create/', { 
                title: arenaTitle,
                exam_id: selectedExam // Gửi ID đề thi lên Server
            });
            navigate(`/arena/host/${res.data.pin}`);
        } catch (err) {
            console.error("Lỗi tạo phòng:", err.response || err);
            let errorMsg = err.response?.data?.error || 'Có lỗi xảy ra khi tạo phòng!';
            showToast(errorMsg);
        } finally {
            setLoading(false);
            setOpenCreateModal(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: '#4a148c', 
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
                        onClick={handleOpenCreateModal} // Gọi hàm mở Modal
                        disabled={loading}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 5, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        Tạo phòng Đấu trường mới
                    </Button>
                </Box>
            </Container>

            {/* 🟢 DIALOG TẠO PHÒNG */}
            <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ bgcolor: '#4a148c', color: 'white', fontWeight: 'bold' }}>
                    Thiết lập Phòng Đấu Trường
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Tên Trận Đấu"
                        value={arenaTitle}
                        onChange={(e) => setArenaTitle(e.target.value)}
                        sx={{ mb: 3, mt: 1 }}
                    />

                    {loadingExams ? (
                        <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                    ) : (
                        <FormControl fullWidth>
                            <InputLabel id="exam-select-label">Chọn Đề Thi Nguồn</InputLabel>
                            <Select
                                labelId="exam-select-label"
                                value={selectedExam}
                                label="Chọn Đề Thi Nguồn"
                                onChange={(e) => setSelectedExam(e.target.value)}
                            >
                                <MenuItem value=""><em>-- Vui lòng chọn một đề thi --</em></MenuItem>
                                {availableExams.map((exam) => (
                                    <MenuItem key={exam.id} value={exam.id}>
                                        {exam.title} {exam.is_public ? "(Công khai)" : "(Của tôi)"}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={() => setOpenCreateModal(false)} color="inherit">Hủy bỏ</Button>
                    <Button 
                        onClick={submitCreateArena} 
                        variant="contained" 
                        sx={{ bgcolor: '#4a148c', '&:hover': { bgcolor: '#380b6b' } }}
                        disabled={loading || !selectedExam}
                    >
                        {loading ? 'Đang tạo...' : 'Xác Nhận Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={handleCloseToast} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.type} variant="filled" sx={{ width: '100%', fontSize: '1.1rem', borderRadius: 3, boxShadow: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ArenaEntry;