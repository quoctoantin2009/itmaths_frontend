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
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'; // 🟢 Icon Máy quét
import axiosClient from '../services/axiosClient';

// 🟢 IMPORT MÁY QUÉT QR
import { Scanner } from '@yudiel/react-qr-scanner';

function ArenaEntry() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [toast, setToast] = useState({ open: false, message: '', type: 'error' });

    // STATE CHO QUÉT QR
    const [openScanner, setOpenScanner] = useState(false);

    // STATE CHO TẠO PHÒNG
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [arenaTitle, setArenaTitle] = useState('Đấu trường ITMaths');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [qSettings, setQSettings] = useState({});

    const showToast = (message, type = 'error') => setToast({ open: true, message, type });
    const handleCloseToast = () => setToast({ ...toast, open: false });

    // 🟢 HÀM XỬ LÝ KHI CAMERA QUÉT THẤY MÃ QR
    const handleScanSuccess = (result) => {
        if (result && result.length > 0) {
            const scannedText = result[0].rawValue; // VD: https://itmaths.vn/#/arena/play/123456
            
            // Dùng thuật toán để bóc tách mã PIN từ đường link
            const match = scannedText.match(/play\/([A-Z0-9]+)/i);
            
            if (match && match[1]) {
                setOpenScanner(false); // Tắt camera
                navigate(`/arena/play/${match[1]}`); // Bay thẳng vào phòng
            } else if (scannedText.length <= 6) {
                setOpenScanner(false);
                navigate(`/arena/play/${scannedText}`);
            } else {
                showToast('Mã QR không thuộc Đấu trường ITMaths!', 'warning');
            }
        }
    };

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
                            newSettings[q.id] = { selected: false, time: "20" };
                        }
                    });
                    setQSettings(newSettings);
                })
                .finally(() => setLoadingQuestions(false));
        }
    }, [selectedTopic]);

    const handleToggleSelect = (id) => {
        setQSettings(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));
    };

    const handleTimeChange = (id, val) => {
        const numericVal = val.replace(/[^0-9]/g, ''); 
        setQSettings(prev => ({ ...prev, [id]: { ...prev[id], time: numericVal, selected: true } }));
    };

    const submitCreateArena = async () => {
        const questions_data = Object.keys(qSettings)
            .filter(id => qSettings[id].selected)
            .map(id => {
                const finalTime = parseInt(qSettings[id].time);
                return { id: parseInt(id), time_limit: isNaN(finalTime) || finalTime <= 0 ? 20 : finalTime };
            });

        if (questions_data.length === 0) {
            showToast('Vui lòng chọn ít nhất 1 câu hỏi!', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/arena/create/', { title: arenaTitle, questions_data });
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
                    <Button fullWidth variant="contained" size="large" onClick={() => navigate(`/arena/play/${pin}`)} sx={{ py: 2, bgcolor: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        VÀO CHƠI
                    </Button>

                    {/* 🟢 KHU VỰC NÚT MỞ MÁY QUÉT QR CODE */}
                    <Divider sx={{ my: 3, '&::before, &::after': { borderColor: '#e0e0e0' } }}>
                        <Typography color="textSecondary" fontWeight="bold">HOẶC</Typography>
                    </Divider>
                    
                    <Button 
                        fullWidth variant="outlined" size="large" 
                        startIcon={<QrCodeScannerIcon />} 
                        onClick={() => setOpenScanner(true)} 
                        sx={{ py: 1.5, color: '#4a148c', borderColor: '#4a148c', borderWidth: 2, fontWeight: 'bold', '&:hover': { borderWidth: 2, bgcolor: 'rgba(74, 20, 140, 0.05)' } }}
                    >
                        QUÉT MÃ QR ĐỂ VÀO
                    </Button>
                </Paper>

                <Box mt={6} textAlign="center">
                    <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenCreateModal(true)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 5 }}>
                        Tạo phòng (Dành cho Giáo viên)
                    </Button>
                </Box>
            </Container>

            {/* 🟢 CỬA SỔ HIỂN THỊ CAMERA QUÉT QR */}
            <Dialog open={openScanner} onClose={() => setOpenScanner(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ bgcolor: '#2c3e50', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    Đưa mã QR vào khung hình
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
                    {openScanner && (
                        <Scanner 
                            onScan={handleScanSuccess} 
                            formats={['qr_code']}
                            components={{ audio: false, finder: true }} // Bật khung ngắm, tắt tiếng bíp mặc định
                            styles={{ container: { width: '100%', height: '100%' } }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', bgcolor: '#2c3e50', p: 2 }}>
                    <Button onClick={() => setOpenScanner(false)} variant="contained" color="error" sx={{ fontWeight: 'bold', borderRadius: 5, px: 4 }}>
                        Đóng Camera
                    </Button>
                </DialogActions>
            </Dialog>

            {/* CỬA SỔ TẠO PHÒNG CỦA GIÁO VIÊN */}
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
                                        <Checkbox checked={!!qSettings[q.id]?.selected} onChange={() => handleToggleSelect(q.id)} />
                                    </ListItemIcon>
                                    <ListItemText primary={<Typography noWrap variant="body1" sx={{ maxWidth: '400px' }}>{q.content}</Typography>} secondary={getTypeLabel(q.question_type)} sx={{ mr: 2 }} />
                                    
                                    <TextField
                                        size="small" label="Số giây"
                                        value={qSettings[q.id]?.time !== undefined ? qSettings[q.id].time : "20"}
                                        onChange={(e) => handleTimeChange(q.id, e.target.value)}
                                        sx={{ width: 100 }} inputProps={{ inputMode: 'numeric' }}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><TimerIcon fontSize="small" color={qSettings[q.id]?.selected ? "primary" : "inherit"} /></InputAdornment>) }}
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