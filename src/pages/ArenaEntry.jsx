import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Box, Typography, TextField, Button, Paper, 
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogActions, FormControl, InputLabel, Select, MenuItem, 
    CircularProgress, Checkbox, List, ListItem, ListItemButton, 
    ListItemIcon, ListItemText, Chip, Divider
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MathJax from 'react-mathjax2';
import axiosClient from '../services/axiosClient';

function ArenaEntry() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [toast, setToast] = useState({ open: false, message: '', type: 'error' });

    // 🟢 STATE CHO 5 BƯỚC TẠO PHÒNG
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [arenaTitle, setArenaTitle] = useState('Đấu trường ITMaths');
    
    const [selectedGrade, setSelectedGrade] = useState('');
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    
    // Mảng lưu ID các câu hỏi được giáo viên tick chọn
    const [selectedQIds, setSelectedQIds] = useState([]);

    const showToast = (message, type = 'error') => setToast({ open: true, message, type });
    const handleCloseToast = () => setToast({ ...toast, open: false });

    // VÀO CHƠI (HỌC SINH)
    const handleJoinArena = async () => {
        if (!pin.trim()) { setError('Vui lòng nhập mã PIN!'); return; }
        setLoading(true); setError('');
        try {
            const res = await axiosClient.post('/arena/join/', { pin: pin });
            navigate(`/arena/play/${res.data.pin}`, { state: { room_title: res.data.title } });
        } catch (err) {
            setError(err.response?.data?.error || 'Không tìm thấy phòng này!');
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 1 & 2: KHI CHỌN KHỐI -> GỌI API LẤY CHỦ ĐỀ
    useEffect(() => {
        if (selectedGrade) {
            axiosClient.get(`/topics/?grade=${selectedGrade}`)
                .then(res => {
                    setTopics(res.data);
                    setSelectedTopic('');
                    setQuestions([]);
                })
                .catch(() => showToast('Lỗi tải danh sách chủ đề'));
        }
    }, [selectedGrade]);

    // BƯỚC 3: KHI CHỌN CHỦ ĐỀ -> GỌI API LẤY CÂU HỎI
    useEffect(() => {
        if (selectedTopic) {
            setLoadingQuestions(true);
            axiosClient.get(`/arena/topic-questions/?topic_id=${selectedTopic}`)
                .then(res => setQuestions(res.data))
                .catch(() => showToast('Lỗi tải danh sách câu hỏi'))
                .finally(() => setLoadingQuestions(false));
        }
    }, [selectedTopic]);

    // BƯỚC 4: XỬ LÝ TICK CHỌN CÂU HỎI
    const handleToggleQuestion = (id) => {
        const currentIndex = selectedQIds.indexOf(id);
        const newSelected = [...selectedQIds];

        if (currentIndex === -1) {
            newSelected.push(id); // Nếu chưa có thì thêm vào
        } else {
            newSelected.splice(currentIndex, 1); // Nếu có rồi thì bỏ tick
        }
        setSelectedQIds(newSelected);
    };

    // BƯỚC 5: GỬI LÊN SERVER TẠO PHÒNG
    const submitCreateArena = async () => {
        if (selectedQIds.length === 0) {
            showToast('Vui lòng chọn ít nhất 1 câu hỏi!', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/arena/create/', { 
                title: arenaTitle,
                question_ids: selectedQIds // 🟢 Gửi mảng câu hỏi lên
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
            case 'MCQ': return <Chip label="4 Lựa chọn" color="primary" size="small" />;
            case 'TF': return <Chip label="Đúng/Sai" color="warning" size="small" />;
            case 'SHORT': return <Chip label="Trả lời ngắn" color="success" size="small" />;
            default: return null;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#4a148c', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Container maxWidth="xs">
                <Typography variant="h3" fontWeight="900" textAlign="center" color="white" mb={4}>ITMaths ARENA</Typography>

                <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                    <TextField
                        fullWidth placeholder="Nhập mã PIN..." value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '8px' } }}
                        sx={{ mb: 2 }}
                    />
                    {error && <Typography color="error" fontWeight="bold" mb={2}>{error}</Typography>}
                    <Button fullWidth variant="contained" size="large" onClick={handleJoinArena} disabled={loading} sx={{ py: 2, fontSize: '1.2rem', fontWeight: 'bold', bgcolor: '#333' }}>
                        VÀO CHƠI
                    </Button>
                </Paper>

                <Box mt={6} textAlign="center">
                    <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenCreateModal(true)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 5 }}>
                        Tạo phòng (Chọn câu hỏi)
                    </Button>
                </Box>
            </Container>

            {/* 🟢 DIALOG 5 BƯỚC CHỌN CÂU HỎI */}
            <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ bgcolor: '#4a148c', color: 'white', fontWeight: 'bold' }}>
                    Thiết lập Trận Đấu ({selectedQIds.length} câu đã chọn)
                </DialogTitle>
                
                <DialogContent sx={{ mt: 2, bgcolor: '#fdfdfd' }}>
                    <TextField fullWidth label="Tên Trận Đấu" value={arenaTitle} onChange={(e) => setArenaTitle(e.target.value)} sx={{ mb: 3, mt: 1 }} />

                    <Box display="flex" gap={2} mb={3}>
                        {/* BƯỚC 1: Chọn Khối */}
                        <FormControl fullWidth>
                            <InputLabel>Bước 1: Chọn Khối</InputLabel>
                            <Select value={selectedGrade} label="Bước 1: Chọn Khối" onChange={(e) => setSelectedGrade(e.target.value)}>
                                {[12, 11, 10, 9, 8, 7, 6].map(g => <MenuItem key={g} value={g}>Toán {g}</MenuItem>)}
                            </Select>
                        </FormControl>

                        {/* BƯỚC 2: Chọn Chủ Đề */}
                        <FormControl fullWidth disabled={!selectedGrade}>
                            <InputLabel>Bước 2: Chọn Chủ Đề</InputLabel>
                            <Select value={selectedTopic} label="Bước 2: Chọn Chủ Đề" onChange={(e) => setSelectedTopic(e.target.value)}>
                                {topics.map((t) => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ mb: 2 }}>Bước 3 & 4: Danh sách câu hỏi</Divider>

                    {/* BƯỚC 3 & 4: Tick chọn câu hỏi có tích hợp MathJax */}
                    {loadingQuestions ? (
                        <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                    ) : (
                        <MathJax.Context input='tex'>
                            <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 400, overflow: 'auto', border: '1px solid #ddd', borderRadius: 2 }}>
                                {questions.length === 0 ? (
                                    <Typography textAlign="center" color="textSecondary" py={3}>Chưa có câu hỏi nào trong chủ đề này.</Typography>
                                ) : (
                                    questions.map((q) => (
                                        <ListItem key={q.id} disablePadding>
                                            <ListItemButton role={undefined} onClick={() => handleToggleQuestion(q.id)} dense>
                                                <ListItemIcon>
                                                    <Checkbox edge="start" checked={selectedQIds.indexOf(q.id) !== -1} tabIndex={-1} disableRipple />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={<MathJax.Text text={q.content} />} 
                                                    secondary={getTypeLabel(q.question_type)}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </MathJax.Context>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Button onClick={() => setOpenCreateModal(false)} color="inherit">Hủy bỏ</Button>
                    <Button onClick={submitCreateArena} variant="contained" sx={{ bgcolor: '#4a148c' }} disabled={loading || selectedQIds.length === 0}>
                        {loading ? 'Đang tạo...' : 'Bước 5: Khởi Tạo Trận Đấu'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleCloseToast} severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default ArenaEntry;