import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Box, Typography, TextField, Button, Paper, 
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogActions, FormControl, InputLabel, Select, MenuItem, 
    CircularProgress, Checkbox, List, ListItem, ListItemIcon, 
    ListItemText, Chip, Divider, InputAdornment
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TimerIcon from '@mui/icons-material/Timer';
import axiosClient from '../services/axiosClient';

function ArenaEntry() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [toast, setToast] = useState({ open: false, message: '', type: 'error' });

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [arenaTitle, setArenaTitle] = useState('Đấu trường ITMaths');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    
    // Cấu trúc lưu trữ: { [id]: { selected: bool, time: string } }
    const [qSettings, setQSettings] = useState({});

    const showToast = (message, type = 'error') => setToast({ open: true, message, type });
    const handleCloseToast = () => setToast({ ...toast, open: false });

    useEffect(() => {
        if (selectedGrade) {
            axiosClient.get(`/topics/?grade=${selectedGrade}`).then(res => setTopics(res.data));
        }
    }, [selectedGrade]);

    useEffect(() => {
        if (selectedTopic) {
            setLoadingQuestions(true);
            axiosClient.get(`/arena/topic-questions/?topic_id=${selectedTopic}`)
                .then(res => {
                    setQuestions(res.data);
                    const newSettings = { ...qSettings };
                    res.data.forEach(q => {
                        if (!newSettings[q.id]) {
                            newSettings[q.id] = { selected: false, time: "20" }; // Lưu thời gian dưới dạng chuỗi
                        }
                    });
                    setQSettings(newSettings);
                })
                .finally(() => setLoadingQuestions(false));
        }
    }, [selectedTopic]);

    // Xử lý Tick chọn bình thường
    const handleToggleSelect = (id) => {
        setQSettings(prev => ({
            ...prev,
            [id]: { ...prev[id], selected: !prev[id].selected }
        }));
    };

    // 🟢 XỬ LÝ NHẬP THỜI GIAN THÔNG MINH
    const handleTimeChange = (id, val) => {
        // Chỉ cho phép nhập số (loại bỏ mọi ký tự chữ cái/đặc biệt)
        const numericVal = val.replace(/[^0-9]/g, ''); 
        
        setQSettings(prev => ({
            ...prev,
            [id]: { 
                ...prev[id], 
                time: numericVal, 
                selected: true // 🟢 TỰ ĐỘNG TICK CHỌN khi giáo viên gõ thời gian
            } 
        }));
    };

    const submitCreateArena = async () => {
        // Chốt dữ liệu
        const questions_data = Object.keys(qSettings)
            .filter(id => qSettings[id].selected)
            .map(id => {
                const finalTime = parseInt(qSettings[id].time);
                return {
                    id: parseInt(id),
                    time_limit: isNaN(finalTime) || finalTime <= 0 ? 20 : finalTime // Nếu lỡ xóa trắng thì về mặc định 20s
                };
            });

        if (questions_data.length === 0) {
            showToast('Vui lòng chọn ít nhất 1 câu hỏi!', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/arena/create/', { 
                title: arenaTitle,
                questions_data: questions_data 
            });
            navigate(`/arena/host/${res.data.pin}`);
        } catch (err) {
            showToast('Có lỗi xảy ra khi tạo phòng!');
        } finally {
            setLoading(false);
            setOpenCreateModal(false);
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'MCQ': return <Chip label="Trắc nghiệm" color="primary" size="small" variant="outlined" />;
            case 'TF': return <Chip label="Đúng/Sai" color="warning" size="small" variant="outlined" />;
            case 'SHORT': return <Chip label="Trả lời ngắn" color="success" size="small" variant="outlined" />;
            default: return null;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#4a148c', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Container maxWidth="xs">
                <Typography variant="h3" fontWeight="900" textAlign="center" color="white" mb={4}>ITMaths ARENA</Typography>
                <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                    <TextField fullWidth placeholder="Mã PIN..." value={pin} onChange={(e) => setPin(e.target.value.toUpperCase())}
                        inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '8px' } }} sx={{ mb: 2 }} />
                    <Button fullWidth variant="contained" size="large" onClick={() => navigate(`/arena/play/${pin}`)} sx={{ py: 2, bgcolor: '#333' }}>VÀO CHƠI</Button>
                </Paper>
                <Box mt={6} textAlign="center">
                    <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenCreateModal(true)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 5 }}>
                        Tạo phòng (Thiết lập thời gian)
                    </Button>
                </Box>
            </Container>

            <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ bgcolor: '#4a148c', color: 'white', fontWeight: 'bold' }}>Cài đặt Trận Đấu</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <TextField fullWidth label="Tên Trận Đấu" value={arenaTitle} onChange={(e) => setArenaTitle(e.target.value)} sx={{ mb: 3, mt: 1 }} />
                    <Box display="flex" gap={2} mb={3}>
                        <FormControl fullWidth>
                            <InputLabel>Khối</InputLabel>
                            <Select value={selectedGrade} label="Khối" onChange={(e) => setSelectedGrade(e.target.value)}>
                                {[12, 11, 10, 9, 8, 7, 6].map(g => <MenuItem key={g} value={g}>Lớp {g}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth disabled={!selectedGrade}>
                            <InputLabel>Chủ Đề</InputLabel>
                            <Select value={selectedTopic} label="Chủ Đề" onChange={(e) => setSelectedTopic(e.target.value)}>
                                {topics.map((t) => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider>Chọn câu hỏi & Thiết lập thời gian (giây)</Divider>

                    {loadingQuestions ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : (
                        <List sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd', mt: 2, borderRadius: 2 }}>
                            {questions.map((q) => (
                                <ListItem key={q.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemIcon>
                                        <Checkbox 
                                            checked={!!qSettings[q.id]?.selected} 
                                            onChange={() => handleToggleSelect(q.id)} 
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={<Typography noWrap variant="body1" sx={{ maxWidth: '400px' }}>{q.content}</Typography>} 
                                        secondary={getTypeLabel(q.question_type)}
                                        sx={{ mr: 2 }}
                                    />
                                    
                                    {/* 🟢 KHUNG NHẬP THỜI GIAN ĐÃ ĐƯỢC CHUẨN HÓA */}
                                    <TextField
                                        size="small"
                                        label="Số giây"
                                        // Bỏ disabled để GV có thể click vào gõ số và nó tự tick chọn luôn
                                        value={qSettings[q.id]?.time !== undefined ? qSettings[q.id].time : "20"}
                                        onChange={(e) => handleTimeChange(q.id, e.target.value)}
                                        sx={{ width: 100 }}
                                        inputProps={{ inputMode: 'numeric' }} // Hỗ trợ bàn phím số trên điện thoại
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <TimerIcon fontSize="small" color={qSettings[q.id]?.selected ? "primary" : "inherit"} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenCreateModal(false)}>Hủy</Button>
                    <Button onClick={submitCreateArena} variant="contained" sx={{ bgcolor: '#4a148c' }}>Tạo Trận Đấu</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled">{toast.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default ArenaEntry;