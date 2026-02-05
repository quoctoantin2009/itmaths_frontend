import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    TextField, Button, Box, Avatar, Alert, Divider, Grid, CircularProgress, Slide
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Icon cảnh báo đẹp
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";

// Hiệu ứng trượt lên cho Dialog đẹp hơn
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function UserProfileDialog({ open, onClose, onLogout, onOpenHistory }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // State cho hộp thoại xác nhận xóa
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    const [profile, setProfile] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '' 
    });

    const getAuthHeader = () => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        if (open) {
            fetchProfile();
            setMessage({ type: '', text: '' });
        }
    }, [open]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/user/me/`, { 
                headers: getAuthHeader() 
            });
            setProfile({
                username: res.data.username || '',
                email: res.data.email || '',
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                phone: res.data.profile_phone || '' 
            });
        } catch (error) {
            console.error("Lỗi tải profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        const dataToSend = {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            phone: profile.phone 
        };

        try {
            await axios.patch(`${API_BASE_URL}/api/user/me/`, dataToSend, {
                headers: getAuthHeader()
            });
            setMessage({ type: 'success', text: 'Đã lưu thành công!' });
            const fullName = (profile.last_name + ' ' + profile.first_name).trim();
            if (fullName) localStorage.setItem('username', fullName);
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            let errorText = "Lỗi khi lưu. Kiểm tra kết nối.";
            if (error.response && error.response.data) {
                const serverErrors = error.response.data;
                // Xử lý nếu server trả về HTML (Lỗi 500)
                if (typeof serverErrors === 'string' && serverErrors.startsWith('<')) {
                     errorText = "Lỗi Server (500). Vui lòng thử lại sau.";
                } else {
                    errorText = Object.keys(serverErrors).map(key => `${key}: ${serverErrors[key]}`).join(', ');
                }
            }
            setMessage({ type: 'error', text: errorText });
        } finally {
            setSaving(false);
        }
    };

    // Hàm mở hộp thoại xác nhận (Thay vì window.confirm)
    const handleConfirmDeleteClick = () => {
        setOpenConfirmDelete(true);
    };

    // Hàm thực hiện xóa thật sự
    const handleActualDelete = async () => {
        setOpenConfirmDelete(false); // Đóng hộp thoại xác nhận
        try {
            await axios.delete(`${API_BASE_URL}/api/history/`, { headers: getAuthHeader() });
            setMessage({ type: 'success', text: 'Đã xóa sạch lịch sử làm bài!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi khi xóa lịch sử.' });
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    return (
        <>
            {/* --- DIALOG CHÍNH: HỒ SƠ --- */}
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#673ab7', color: 'white' }}>
                    <PersonIcon /> Hồ Sơ Cá Nhân
                </DialogTitle>
                
                <DialogContent sx={{ mt: 2 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                    ) : (
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            
                            {message.text && (
                                <Alert severity={message.type} sx={{ wordBreak: 'break-word' }}>
                                    {message.text}
                                </Alert>
                            )}

                            <Box display="flex" justifyContent="center" mb={1}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: '#ffca28', fontSize: '2rem', color: '#673ab7', fontWeight: 'bold' }}>
                                    {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : (profile.username ? profile.username.charAt(0).toUpperCase() : 'U')}
                                </Avatar>
                            </Box>

                            <TextField label="Tên đăng nhập" value={profile.username} disabled fullWidth variant="filled" size="small" />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField label="Họ (Last Name)" name="last_name" value={profile.last_name} onChange={handleChange} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Tên (First Name)" name="first_name" value={profile.first_name} onChange={handleChange} fullWidth size="small" />
                                </Grid>
                            </Grid>

                            <TextField label="Email" name="email" value={profile.email} onChange={handleChange} fullWidth size="small" />
                            
                            <TextField 
                                label="Số điện thoại" 
                                name="phone" 
                                value={profile.phone} 
                                onChange={handleChange} 
                                fullWidth 
                                size="small" 
                            />
                            
                            <Divider sx={{ my: 1 }}>Quản lý dữ liệu</Divider>
                            
                            <Box display="flex" gap={2}>
                                <Button variant="outlined" color="primary" startIcon={<HistoryIcon />} fullWidth onClick={() => { onClose(); if(onOpenHistory) onOpenHistory(); }}>
                                    Xem Lịch Sử
                                </Button>
                                {/* Nút này giờ sẽ mở Dialog đẹp */}
                                <Button variant="outlined" color="error" startIcon={<DeleteForeverIcon />} fullWidth onClick={handleConfirmDeleteClick}>
                                    Xóa Lịch Sử
                                </Button>
                            </Box>

                            <Button variant="text" color="error" onClick={onLogout} sx={{ mt: 1 }}>
                                Đăng xuất
                            </Button>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={onClose} color="inherit">Đóng</Button>
                    <Button onClick={handleSave} variant="contained" color="primary" startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} disabled={saving || loading}>
                        {saving ? 'Lưu...' : 'Lưu Thay Đổi'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- [MỚI] DIALOG CẢNH BÁO XÓA (ĐẸP) --- */}
            <Dialog
                open={openConfirmDelete}
                onClose={() => setOpenConfirmDelete(false)}
                TransitionComponent={Transition}
                PaperProps={{
                    style: { borderRadius: 15, padding: '10px' }
                }}
            >
                <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon fontSize="large" />
                    Xóa toàn bộ lịch sử?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1.1em', color: '#333' }}>
                        Hành động này sẽ xóa sạch tất cả kết quả làm bài thi của bạn từ trước đến nay.<br/>
                        <b>Dữ liệu sẽ không thể khôi phục được!</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenConfirmDelete(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2 }}>
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleActualDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, px: 3 }}>
                        Đồng ý Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}