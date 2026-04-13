import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, Box, Typography, TextField, Button, Paper, Snackbar, Alert, Dialog, 
    DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, 
    CircularProgress, Checkbox, List, ListItem, ListItemIcon, ListItemText, Chip, Divider, 
    InputAdornment, IconButton, Tooltip, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TimerIcon from '@mui/icons-material/Timer';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import axiosClient from '../services/axiosClient';
import { Scanner } from '@yudiel/react-qr-scanner';

const SmartTextField = ({ label, value, onChange, placeholder, isShort }) => {
    const fileInputRef = useRef();
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axiosClient.post('/arena/upload-image/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onChange((value || '') + `\n[IMG:${res.data?.url}]\n`);
        } catch (err) { 
            alert('Lỗi tải ảnh!'); 
        } finally { 
            setUploading(false); 
            if (e.target) e.target.value = null; 
        }
    };

    return (
        <Box sx={{ position: 'relative', mb: 2, width: '100%' }}>
            <TextField 
                fullWidth multiline={!isShort} rows={isShort ? 1 : 3} 
                label={label} value={value || ''} onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder} 
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title="Chèn ảnh vào ô này">
                                <IconButton onClick={() => fileInputRef.current?.click()} disabled={uploading} color="primary">
                                    {uploading ? <CircularProgress size={20} /> : <AddPhotoAlternateIcon />}
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>
                    ),
                }}
            />
            <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
        </Box>
    );
};

const RenderSmartContent = ({ text }) => {
    try {
        if (text === null || text === undefined) return null;
        const safeText = String(text); 
        const parts = safeText.split(/\[IMG:(.*?)\]/g);
        return (
            <span>
                {parts.map((p, i) => (
                    <React.Fragment key={i}>
                        {i % 2 === 1 ? <Chip size="small" label="🖼️ Hình ảnh" color="info" sx={{ mx: 0.5 }} /> : p}
                    </React.Fragment>
                ))}
            </span>
        );
    } catch (error) {
        return <span>{String(text || '')}</span>;
    }
};

function ArenaEntry() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const [toast, setToast] = useState({ open: false, message: '', type: 'error' });
    const showToast = (message, type = 'error') => setToast({ open: true, message, type });
    const handleCloseToast = () => setToast({ ...toast, open: false });

    const [openScanner, setOpenScanner] = useState(false);
    const [openGuide, setOpenGuide] = useState(false);

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [arenaTitle, setArenaTitle] = useState('Đấu trường ITMaths');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [qSettings, setQSettings] = useState({});

    const [viewMode, setViewMode] = useState('system');

    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState('ALL');
    const [openFolderModal, setOpenFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // 🟢 STATE CHO POPUP XÓA CÂU HỎI
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, questionId: null });

    const [openCustomQModal, setOpenCustomQModal] = useState(false);
    const [customQ, setCustomQ] = useState({
        folder_id: '', content: '', question_type: 'MCQ', explanation: '', shortAnswer: '',
        optionsMCQ: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }],
        optionsTF: [{ text: '', is_correct: true }, { text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }]
    });

    const handleScanSuccess = (result) => {
        if (result && result.length > 0 && result[0]?.rawValue) {
            const raw = String(result[0].rawValue);
            const match = raw.match(/play\/([A-Z0-9]+)/i);
            if (match && match[1]) { setOpenScanner(false); navigate(`/arena/play/${match[1]}`); } 
            else if (raw.length <= 6) { setOpenScanner(false); navigate(`/arena/play/${raw}`); } 
            else { showToast('Mã QR không hợp lệ!', 'warning'); }
        }
    };

    useEffect(() => { 
        if (selectedGrade) {
            axiosClient.get(`/topics/?grade=${selectedGrade}`)
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                    setTopics(data);
                })
                .catch(() => setTopics([]));
        }
    }, [selectedGrade]);
    
    useEffect(() => {
        if (viewMode === 'system' && selectedTopic) {
            setLoadingQuestions(true);
            axiosClient.get(`/arena/topic-questions/?topic_id=${selectedTopic}`)
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                    setQuestions(data);
                    const newSettings = { ...qSettings };
                    data.forEach(q => { if (!newSettings[q?.id]) newSettings[q?.id] = { selected: false, time: "20" }; });
                    setQSettings(newSettings);
                })
                .catch(() => setQuestions([]))
                .finally(() => setLoadingQuestions(false));
        } else if (viewMode === 'personal') {
            axiosClient.get('/arena/folders/')
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                    setFolders(data);
                })
                .catch(() => setFolders([]));

            setLoadingQuestions(true);
            axiosClient.get('/arena/my-custom-questions/')
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                    setQuestions(data);
                    const newSettings = { ...qSettings };
                    data.forEach(q => { if (!newSettings[q?.id]) newSettings[q?.id] = { selected: false, time: "20" }; });
                    setQSettings(newSettings);
                })
                .catch(() => setQuestions([]))
                .finally(() => setLoadingQuestions(false));
        }
    }, [selectedTopic, viewMode]);

    const handleToggleSelect = (id) => setQSettings(prev => ({ ...prev, [id]: { ...(prev[id] || {}), selected: !(prev[id]?.selected) } }));
    const handleTimeChange = (id, val) => { const numericVal = String(val || '').replace(/[^0-9]/g, ''); setQSettings(prev => ({ ...prev, [id]: { ...(prev[id] || {}), time: numericVal, selected: true } })); };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            const res = await axiosClient.post('/arena/folders/', { name: newFolderName });
            const newFolder = res.data;
            setFolders([newFolder, ...(Array.isArray(folders) ? folders : [])]);
            setNewFolderName('');
            setOpenFolderModal(false);
            setSelectedFolderId(newFolder.id);
            setCustomQ(prev => ({ ...prev, folder_id: newFolder.id }));
            setOpenCustomQModal(true);
            showToast('Tạo thư mục thành công! Mời Thầy/Cô nhập đề bài.', 'success');
        } catch (err) { showToast('Lỗi tạo thư mục! Có thể Backend chưa migrate.', 'error'); }
    };

    const handleSaveCustomQuestion = async () => {
        if (!customQ?.content?.trim()) return showToast('Vui lòng nhập đề bài!', 'warning');
        const payload = {
            folder_id: customQ.folder_id ? customQ.folder_id : null,
            content: customQ.content, 
            question_type: customQ.question_type, 
            explanation: customQ.explanation, 
            short_answer: customQ.shortAnswer,
            options: customQ.question_type === 'MCQ' ? (customQ.optionsMCQ || []) : (customQ.optionsTF || [])
        };
        try {
            const res = await axiosClient.post('/arena/custom-questions/create/', payload);
            setQuestions([res.data, ...(Array.isArray(questions) ? questions : [])]);
            setQSettings(prev => ({ ...prev, [res.data?.id]: { selected: true, time: "30" } }));
            showToast('Đã lưu câu hỏi vào thư mục!', 'success');
            setOpenCustomQModal(false);
            setCustomQ({ 
                folder_id: customQ.folder_id, 
                content: '', question_type: 'MCQ', explanation: '', shortAnswer: '', 
                optionsMCQ: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }], 
                optionsTF: [{ text: '', is_correct: true }, { text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }] 
            });
        } catch (err) { showToast('Lỗi khi lưu câu hỏi.', 'error'); }
    };

    // 🟢 HÀM BẬT POPUP XÓA CÂU HỎI
    const handleDeleteQuestion = (id) => {
        setDeleteConfirm({ open: true, questionId: id });
    };

    // 🟢 HÀM XỬ LÝ XÓA CHÍNH THỨC
    const processDelete = async () => {
        const id = deleteConfirm.questionId;
        setDeleteConfirm({ open: false, questionId: null });
        try {
            await axiosClient.delete(`/arena/custom-questions/${id}/delete/`);
            setQuestions(questions.filter(q => q.id !== id));
            showToast('Đã xóa câu hỏi thành công!', 'success');
        } catch (err) {
            showToast('Lỗi khi xóa câu hỏi. Vui lòng thử lại!', 'error');
        }
    };

    const submitCreateArena = async () => {
        const questions_data = Object.keys(qSettings || {}).filter(id => qSettings[id]?.selected).map(id => ({ id: parseInt(id), time_limit: parseInt(qSettings[id]?.time) || 20 }));
        if (questions_data.length === 0) return showToast('Vui lòng chọn ít nhất 1 câu hỏi!', 'warning');
        setLoading(true);
        try {
            const res = await axiosClient.post('/arena/create/', { title: arenaTitle, questions_data });
            navigate(`/arena/host/${res.data?.pin}`);
        } catch (err) { showToast('Có lỗi xảy ra khi tạo phòng!', 'error'); } 
        finally { setLoading(false); setOpenCreateModal(false); }
    };

    const getTypeLabel = (type) => {
        switch(String(type || '').toUpperCase()) {
            case 'MCQ': return <Chip label="Trắc nghiệm" color="primary" size="small" variant="outlined" />;
            case 'TF': return <Chip label="Đúng/Sai" color="warning" size="small" variant="outlined" />;
            case 'SHORT': return <Chip label="Trả lời ngắn" color="success" size="small" variant="outlined" />;
            default: return null;
        }
    };

    const safeQuestions = Array.isArray(questions) ? questions : [];
    const safeTopics = Array.isArray(topics) ? topics : [];
    const safeFolders = Array.isArray(folders) ? folders : [];
    
    const displayedQuestions = viewMode === 'personal' && selectedFolderId !== 'ALL' 
        ? safeQuestions.filter(q => q?.folder_id === selectedFolderId) 
        : safeQuestions;

    const labelChars = ['A', 'B', 'C', 'D'];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#4a148c', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, position: 'relative' }}>
            <Tooltip title="Hướng dẫn & Luật chơi"><IconButton onClick={() => setOpenGuide(true)} sx={{ position: 'absolute', top: 20, right: 20, color: '#f1c40f', bgcolor: 'rgba(255,255,255,0.1)' }}><HelpOutlineIcon fontSize="large" /></IconButton></Tooltip>

            <Container maxWidth="xs">
                <Typography variant="h3" fontWeight="900" textAlign="center" color="white" mb={4}>ITMaths ARENA</Typography>
                <Paper elevation={10} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                    <TextField fullWidth placeholder="Mã PIN..." value={pin} onChange={(e) => setPin(e.target.value.toUpperCase())} inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '8px' } }} sx={{ mb: 2 }} />
                    <Button fullWidth variant="contained" size="large" onClick={() => navigate(`/arena/play/${pin}`)} sx={{ py: 2, bgcolor: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>VÀO CHƠI</Button>
                    <Divider sx={{ my: 3 }}><Typography color="textSecondary" fontWeight="bold">HOẶC</Typography></Divider>
                    <Button fullWidth variant="outlined" size="large" startIcon={<QrCodeScannerIcon />} onClick={() => setOpenScanner(true)} sx={{ py: 1.5, color: '#4a148c', borderColor: '#4a148c', borderWidth: 2, fontWeight: 'bold' }}>QUÉT MÃ QR ĐỂ VÀO</Button>
                </Paper>
                <Box mt={6} textAlign="center"><Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenCreateModal(true)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', borderRadius: 5 }}>Tạo phòng (Dành cho Giáo viên)</Button></Box>
            </Container>

            <Dialog open={openGuide} onClose={() => setOpenGuide(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#2c3e50', color: '#f1c40f', fontWeight: 'bold', textAlign: 'center' }}>📖 CẨM NANG ĐẤU TRƯỜNG</DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">1. Cách tính điểm</Typography>
                    <Typography variant="body1" mb={2}>
                        - <b>Trắc nghiệm & Tự luận:</b> Trả lời đúng được thưởng 250đ - 500đ.<br/>
                        - <b>Đúng/Sai:</b> Phải chọn đúng cả 4 ý mới đạt 1000đ.<br/>
                        - <b>Đua tốc độ:</b> Ai trả lời Nhanh nhất x2.0, Nhanh nhì x1.8, Nhanh ba x1.6...
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 2 }}><Button onClick={() => setOpenGuide(false)} variant="contained" color="primary" sx={{ borderRadius: 5, px: 4 }}>Đã hiểu</Button></DialogActions>
            </Dialog>

            <Dialog open={openScanner} onClose={() => setOpenScanner(false)} fullWidth maxWidth="xs"><DialogContent sx={{ p: 0, bgcolor: 'black' }}>{openScanner && <Scanner onScan={handleScanSuccess} formats={['qr_code']} />}</DialogContent><DialogActions sx={{ justifyContent: 'center', bgcolor: '#2c3e50', p: 2 }}><Button onClick={() => setOpenScanner(false)} variant="contained" color="error">Đóng Camera</Button></DialogActions></Dialog>

            <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ bgcolor: '#4a148c', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Cài đặt Trận Đấu</span>
                    <Button variant="contained" color="warning" startIcon={<EditIcon />} onClick={() => {
                        setCustomQ(prev => ({ 
                            ...prev, 
                            folder_id: (viewMode === 'personal' && selectedFolderId !== 'ALL') ? selectedFolderId : '' 
                        }));
                        setOpenCustomQModal(true);
                    }} sx={{ fontWeight: 'bold' }}>Tự soạn câu hỏi</Button>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <TextField fullWidth label="Tên Trận Đấu" value={arenaTitle} onChange={(e) => setArenaTitle(e.target.value)} sx={{ mb: 3, mt: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Box sx={{ bgcolor: '#f1f2f6', borderRadius: 10, p: 0.5, display: 'inline-flex' }}>
                            <Button onClick={() => setViewMode('system')} sx={{ borderRadius: 10, px: 3, py: 1, fontWeight: 'bold', bgcolor: viewMode === 'system' ? '#4a148c' : 'transparent', color: viewMode === 'system' ? 'white' : '#333' }}>🏫 Ngân hàng Hệ thống</Button>
                            <Button onClick={() => setViewMode('personal')} sx={{ borderRadius: 10, px: 3, py: 1, fontWeight: 'bold', bgcolor: viewMode === 'personal' ? '#e67e22' : 'transparent', color: viewMode === 'personal' ? 'white' : '#333' }}>🎒 Kho Cá Nhân của tôi</Button>
                        </Box>
                    </Box>

                    {viewMode === 'system' && (
                        <Box display="flex" gap={2} mb={3}>
                            <FormControl fullWidth><InputLabel>Khối</InputLabel><Select value={selectedGrade} label="Khối" onChange={(e) => setSelectedGrade(e.target.value)}>{[12, 11, 10, 9, 8, 7, 6].map(g => <MenuItem key={g} value={g}>Lớp {g}</MenuItem>)}</Select></FormControl>
                            <FormControl fullWidth disabled={!selectedGrade}><InputLabel>Chủ Đề (Server)</InputLabel><Select value={selectedTopic} label="Chủ Đề" onChange={(e) => setSelectedTopic(e.target.value)}>{safeTopics.map((t) => <MenuItem key={t?.id} value={t?.id}>{t?.title}</MenuItem>)}</Select></FormControl>
                        </Box>
                    )}

                    {viewMode === 'personal' && (
                        <Box display="flex" alignItems="center" gap={2} mb={3} p={2} bgcolor="rgba(230, 126, 34, 0.1)" borderRadius={2} border="1px dashed #e67e22">
                            <FormControl fullWidth size="small">
                                <InputLabel>Lọc theo Thư mục</InputLabel>
                                <Select value={selectedFolderId} label="Lọc theo Thư mục" onChange={(e) => setSelectedFolderId(e.target.value)}>
                                    <MenuItem value="ALL">-- Hiển thị Tất cả câu hỏi của tôi --</MenuItem>
                                    {safeFolders.map(f => <MenuItem key={f?.id} value={f?.id}>📁 {f?.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Button variant="contained" color="warning" onClick={() => setOpenFolderModal(true)} startIcon={<AddCircleOutlineIcon />} sx={{ whiteSpace: 'nowrap' }}>Tạo Thư mục mới</Button>
                        </Box>
                    )}

                    <Divider><Chip label={viewMode === 'personal' ? "Kho Câu hỏi Cá nhân" : "Kho Câu hỏi Hệ thống"} color="primary" variant="outlined" /></Divider>
                    
                    {loadingQuestions ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : (
                        <List sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd', mt: 2, borderRadius: 2 }}>
                            {displayedQuestions.map((q) => (
                                <ListItem key={q?.id} sx={{ borderBottom: '1px solid #f0f0f0', bgcolor: q?.is_private ? 'rgba(230, 126, 34, 0.05)' : 'transparent' }}>
                                    <ListItemIcon><Checkbox checked={!!qSettings[q?.id]?.selected} onChange={() => handleToggleSelect(q?.id)} /></ListItemIcon>
                                    <ListItemText 
                                        primary={<Typography noWrap variant="body1" sx={{ maxWidth: '400px' }}><RenderSmartContent text={q?.content} /></Typography>} 
                                        secondary={<Box display="flex" gap={1} mt={0.5}>{getTypeLabel(q?.question_type)}{q?.is_private && <Chip label="Của tôi" color="warning" size="small" />}</Box>} sx={{ mr: 2 }} 
                                    />
                                    <TextField size="small" label="Số giây" value={qSettings[q?.id]?.time !== undefined ? qSettings[q?.id].time : "20"} onChange={(e) => handleTimeChange(q?.id, e.target.value)} sx={{ width: 100 }} inputProps={{ inputMode: 'numeric' }} InputProps={{ startAdornment: (<InputAdornment position="start"><TimerIcon fontSize="small" color={qSettings[q?.id]?.selected ? "primary" : "inherit"} /></InputAdornment>) }} />
                                    
                                    {q?.is_private && (
                                        <Tooltip title="Xóa câu hỏi này">
                                            <IconButton color="error" onClick={() => handleDeleteQuestion(q.id)} sx={{ ml: 1 }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </ListItem>
                            ))}
                            {displayedQuestions.length === 0 && <Typography p={3} textAlign="center" color="gray">Chưa có câu hỏi nào trong mục này.</Typography>}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenCreateModal(false)}>Hủy</Button><Button onClick={submitCreateArena} variant="contained" sx={{ bgcolor: '#4a148c' }}>Khởi tạo Đấu Trường</Button></DialogActions>
            </Dialog>

            <Dialog open={openFolderModal} onClose={() => setOpenFolderModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Thư Mục Mới</DialogTitle>
                <DialogContent>
                    <TextField autoFocus fullWidth label="Tên Thư mục (VD: Phương trình đường thẳng)" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFolderModal(false)}>Hủy</Button>
                    <Button onClick={handleCreateFolder} variant="contained" color="warning">Tạo</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openCustomQModal} onClose={() => setOpenCustomQModal(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ bgcolor: '#f39c12', color: 'white', fontWeight: 'bold' }}>Tự soạn Câu hỏi</DialogTitle>
                <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel>Lưu vào Thư mục</InputLabel>
                        <Select value={customQ?.folder_id || ''} label="Lưu vào Thư mục" onChange={(e) => setCustomQ({...customQ, folder_id: e.target.value})}>
                            <MenuItem value="">-- Không phân loại (Nằm tự do ngoài kho) --</MenuItem>
                            {safeFolders.map(f => <MenuItem key={f?.id} value={f?.id}>📁 {f?.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <SmartTextField label="Nội dung đề bài (Bấm icon bên phải để chèn ảnh)" value={customQ?.content || ''} onChange={(v) => setCustomQ({...customQ, content: v})} />

                    <FormControl fullWidth>
                        <InputLabel>Loại câu hỏi</InputLabel>
                        <Select value={customQ?.question_type || 'MCQ'} label="Loại câu hỏi" onChange={(e) => setCustomQ({...customQ, question_type: e.target.value})}>
                            <MenuItem value="MCQ">Trắc nghiệm (Chọn 1 đáp án đúng)</MenuItem>
                            <MenuItem value="TF">Đúng/Sai (Chọn Đ/S cho 4 ý)</MenuItem>
                            <MenuItem value="SHORT">Trả lời ngắn (Điền số)</MenuItem>
                        </Select>
                    </FormControl>

                    <Divider><Typography color="primary" fontWeight="bold">Phần Đáp Án</Typography></Divider>

                    {customQ?.question_type === 'MCQ' && (
                        <RadioGroup value={customQ?.optionsMCQ?.findIndex(o => o?.is_correct) || 0} onChange={(e) => {
                            const newOpts = (customQ?.optionsMCQ || []).map((o, idx) => ({ ...o, is_correct: idx === parseInt(e.target.value) }));
                            setCustomQ({...customQ, optionsMCQ: newOpts});
                        }}>
                            {(customQ?.optionsMCQ || []).map((opt, idx) => (
                                <Box key={idx} display="flex" alignItems="flex-start" gap={2} mb={1}>
                                    <FormControlLabel value={idx} control={<Radio color="success" sx={{ mt: 1 }} />} label="" />
                                    <Box flex={1}><SmartTextField label={`Đáp án ${labelChars[idx]}`} value={opt?.text || ''} onChange={(v) => { const newOpts = [...customQ.optionsMCQ]; newOpts[idx].text = v; setCustomQ({...customQ, optionsMCQ: newOpts}); }} isShort /></Box>
                                </Box>
                            ))}
                        </RadioGroup>
                    )}

                    {customQ?.question_type === 'TF' && (
                        <Box>
                            {(customQ?.optionsTF || []).map((opt, idx) => (
                                <Box key={idx} display="flex" alignItems="flex-start" gap={2} mb={1}>
                                    <Select size="small" value={opt?.is_correct ?? true} onChange={(e) => { const newOpts = [...customQ.optionsTF]; newOpts[idx].is_correct = e.target.value; setCustomQ({...customQ, optionsTF: newOpts}); }} sx={{ mt: 1, minWidth: 100 }}>
                                        <MenuItem value={true} sx={{ color: 'green', fontWeight: 'bold' }}>Đúng</MenuItem>
                                        <MenuItem value={false} sx={{ color: 'red', fontWeight: 'bold' }}>Sai</MenuItem>
                                    </Select>
                                    <Box flex={1}><SmartTextField label={`Ý ${labelChars[idx]}`} value={opt?.text || ''} onChange={(v) => { const newOpts = [...customQ.optionsTF]; newOpts[idx].text = v; setCustomQ({...customQ, optionsTF: newOpts}); }} isShort /></Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {customQ?.question_type === 'SHORT' && <TextField fullWidth label="Đáp án đúng (Là 1 con số)" type="number" value={customQ?.shortAnswer || ''} onChange={(e) => setCustomQ({...customQ, shortAnswer: e.target.value})} placeholder="VD: 5 hoặc -2.5" />}

                    <Divider />
                    <SmartTextField label="Lời giải chi tiết (Sẽ hiện trên Tivi khi hết giờ)" value={customQ?.explanation || ''} onChange={(v) => setCustomQ({...customQ, explanation: v})} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenCustomQModal(false)}>Hủy bỏ</Button><Button variant="contained" color="warning" startIcon={<SaveIcon />} onClick={handleSaveCustomQuestion}>Lưu Câu Hỏi</Button></DialogActions>
            </Dialog>

            {/* 🟢 CỬA SỔ CONFIRM XÓA CÂU HỎI ĐẸP MẮT CỦA MATERIAL UI */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, questionId: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⚠️ Xác nhận xóa
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Bạn có chắc chắn muốn xóa câu hỏi này khỏi kho cá nhân không?</Typography>
                    <Typography variant="body2" color="error" mt={1}>Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác!</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, questionId: null })} color="inherit">Hủy bỏ</Button>
                    <Button onClick={processDelete} variant="contained" color="error">Xóa vĩnh viễn</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}><Alert severity={toast.type} variant="filled">{toast.message}</Alert></Snackbar>
        </Box>
    );
}

export default ArenaEntry;