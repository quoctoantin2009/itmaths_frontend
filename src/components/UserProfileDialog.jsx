import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    TextField, Button, Box, Avatar, Alert, Divider, Grid, CircularProgress, Slide,
    MenuItem 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import axios from 'axios'; // ✅ Giữ nguyên axios thường theo code cũ

const API_BASE_URL = "https://api.itmaths.vn"; // ✅ Giữ nguyên URL cũ

// --- DANH SÁCH 63 TỈNH THÀNH (Dữ liệu tĩnh giúp web chạy nhanh) ---
const VIETNAM_PROVINCES = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", 
    "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", 
    "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", 
    "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", 
    "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", 
    "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", 
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", 
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", 
    "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", 
    "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function UserProfileDialog({ open, onClose, onLogout, onOpenHistory }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    // [CẬP NHẬT] Thêm trường 'province' vào state
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        occupation: 'student',
        school_name: '',
        actual_class: '',
        province: '' // ✅ Thêm trường mới
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
            
            const data = res.data;
            setProfile({
                username: data.username || '',
                email: data.email || '',
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone: data.profile_phone || data.phone || '', 
                occupation: data.profile_occupation || data.occupation || 'student',
                school_name: data.profile_school_name || data.school_name || '',
                actual_class: data.profile_actual_class || data.actual_class || '',
                // ✅ Logic map dữ liệu tỉnh: ưu tiên profile_province
                province: data.profile_province || data.province || '' 
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
            phone: profile.phone,
            occupation: profile.occupation,
            school_name: profile.school_name,
            actual_class: profile.actual_class,
            province: profile.province // ✅ Gửi tỉnh lên server
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
                if (typeof serverErrors === 'string') {
                     errorText = "Lỗi Server. Vui lòng thử lại sau.";
                } else {
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
                            
                            {/* ✅ [SỬA ĐỔI] Chia cột cho Số điện thoại và Tỉnh */}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField 
                                        label="Số điện thoại" 
                                        name="phone" 
                                        value={profile.phone} 
                                        onChange={handleChange} 
                                        fullWidth 
                                        size="small" 
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        label="Tỉnh / Thành phố"
                                        name="province"
                                        value={profile.province}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        SelectProps={{ MenuProps: { style: { maxHeight: 300 } } }} // Giới hạn chiều cao menu
                                    >
                                        <MenuItem value=""><em>-- Chọn --</em></MenuItem>
                                        {VIETNAM_PROVINCES.map((prov) => (
                                            <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>

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
                                    <TextField label="Trường học" name="school_name" placeholder="VD: THPT Chuyên..." value={profile.school_name} onChange={handleChange} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label="Lớp" name="actual_class" placeholder="12A1" value={profile.actual_class} onChange={handleChange} fullWidth size="small" />
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
                PaperProps={{ style: { borderRadius: 15, padding: '10px' } }}
            >
                <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon fontSize="large" /> Xóa toàn bộ lịch sử?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '1.1em', color: '#333' }}>
                        Hành động này sẽ xóa sạch tất cả kết quả làm bài thi của bạn.<br/><b>Dữ liệu sẽ không thể khôi phục được!</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenConfirmDelete(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2 }}>Hủy bỏ</Button>
                    <Button onClick={handleActualDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, px: 3 }}>Đồng ý Xóa</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}