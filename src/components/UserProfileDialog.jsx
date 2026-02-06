import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    TextField, Button, Box, Avatar, Alert, Divider, Grid, CircularProgress, Slide,
    MenuItem // [MỚI] Import thêm MenuItem để làm menu chọn nghề nghiệp
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import axios from 'axios';

// [LƯU Ý] Nếu bạn đã có file axiosClient, nên dùng nó thay vì axios thường + URL cứng
// Nhưng tôi vẫn giữ nguyên theo file bạn gửi để tránh lỗi phát sinh
const API_BASE_URL = "https://api.itmaths.vn";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function UserProfileDialog({ open, onClose, onLogout, onOpenHistory }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    // [CẬP NHẬT] Thêm các trường mới vào State
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        occupation: 'student',   // Mặc định là học sinh
        school_name: '',
        actual_class: ''
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
            
            // [CẬP NHẬT] Map dữ liệu từ API vào State
            // Lưu ý: Dựa vào logic cũ (profile_phone), tôi đoán API trả về dạng phẳng (profile_...)
            // Tôi dùng || để dự phòng cả 2 trường hợp tên biến
            const data = res.data;
            setProfile({
                username: data.username || '',
                email: data.email || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone: data.profile_phone || data.phone || '', 
                
                // Các trường mới
                occupation: data.profile_occupation || data.occupation || 'student',
                school_name: data.profile_school_name || data.school_name || '',
                actual_class: data.profile_actual_class || data.actual_class || ''
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

        // [CẬP NHẬT] Đóng gói dữ liệu gửi đi
        const dataToSend = {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            
            // Các trường trong UserProfile
            phone: profile.phone,
            occupation: profile.occupation,
            school_name: profile.school_name,
            actual_class: profile.actual_class
        };

        try {
            await axios.patch(`${API_BASE_URL}/api/user/me/`, dataToSend, {
                headers: getAuthHeader()
            });
            setMessage({ type: 'success', text: 'Đã lưu hồ sơ thành công!' });
            
            const fullName = (profile.last_name + ' ' + profile.first_name).trim();
            if (fullName) localStorage.setItem('username', fullName);
            
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            let errorText = "Lỗi khi lưu. Kiểm tra kết nối.";
            if (error.response && error.response.data) {
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'string' && serverErrors.startsWith('<')) {
                     errorText = "Lỗi Server (500). Vui lòng thử lại sau.";
                } else {
                    // Hiển thị lỗi chi tiết
                    errorText = Object.keys(serverErrors).map(key => `${key}: ${serverErrors[key]}`).join(', ');
                }
            }
            setMessage({ type: 'error', text: errorText });
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDeleteClick = () => {
        setOpenConfirmDelete(true);
    };

    const handleActualDelete = async () => {
        setOpenConfirmDelete(false);
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

                            {/* [MỚI] Phần bổ sung thông tin lớp học */}
                            <Divider sx={{ my: 1, color: '#673ab7', fontSize: '0.9rem' }}>THÔNG TIN TRƯỜNG LỚP</Divider>

                            <TextField
                                select
                                label="Nghề nghiệp / Vai trò"
                                name="occupation"
                                value={profile.occupation}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="student">👨‍🎓 Học sinh</MenuItem>
                                <MenuItem value="teacher">👩‍🏫 Giáo viên</MenuItem>
                                <MenuItem value="other">👤 Khác</MenuItem>
                            </TextField>

                            <Grid container spacing={2}>
                                <Grid item xs={8}>
                                    <TextField 
                                        label="Trường học" 
                                        name="school_name" 
                                        placeholder="VD: THPT Chuyên..." 
                                        value={profile.school_name} 
                                        onChange={handleChange} 
                                        fullWidth 
                                        size="small" 
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField 
                                        label="Lớp" 
                                        name="actual_class" 
                                        placeholder="12A1" 
                                        value={profile.actual_class} 
                                        onChange={handleChange} 
                                        fullWidth 
                                        size="small" 
                                    />
                                </Grid>
                            </Grid>
                            
                            <Divider sx={{ my: 1 }}>Quản lý dữ liệu</Divider>
                            
                            <Box display="flex" gap={2}>
                                <Button variant="outlined" color="primary" startIcon={<HistoryIcon />} fullWidth onClick={() => { onClose(); if(onOpenHistory) onOpenHistory(); }}>
                                    Xem Lịch Sử
                                </Button>
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