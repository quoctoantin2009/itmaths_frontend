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
import axiosClient from '../services/axiosClient';
import { Scanner } from '@yudiel/react-qr-scanner';

// 🟢 COMPONENT Ô NHẬP LIỆU CÓ TÍCH HỢP NÚT TẢI ẢNH
const SmartTextField = ({ label, value, onChange, placeholder, isShort }) => {
    const fileInputRef = useRef();
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axiosClient.post('/arena/upload-image/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imgCode = `\n[IMG:${res.data.url}]\n`;
            onChange(value + imgCode);
        } catch (err) {
            alert('Lỗi tải ảnh!');
        } finally {
            setUploading(false);
            e.target.value = null; 
        }
    };

    return (
        <Box sx={{ position: 'relative', mb: 2, width: '100%' }}>
            <TextField 
                fullWidth multiline={!isShort} rows={isShort ? 1 : 3} 
                label={label} value={value} onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder} 
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title="Chèn ảnh vào ô này">
                                <IconButton onClick={() => fileInputRef.current.click()} disabled={uploading} color="primary">
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

function ArenaEntry() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [toast, setToast] = useState({ open: false, message: '', type: 'error' });
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

    // 🟢 TRẠNG THÁI QUẢN LÝ TAB: 'system' HOẶC 'personal'
    const [viewMode, setViewMode] = useState('system');

    const [openCustomQModal, setOpenCustomQModal] = useState(false);
    const [customQ, setCustomQ] = useState({
        content: '', question_type: 'MCQ', explanation: '', shortAnswer: '',
        optionsMCQ: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }],
        optionsTF: [{ text: '', is_correct: true }, { text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }]
    });

    const showToast = (message, type = 'error') => setToast({ open: true, message, type });
    const handleCloseToast = () => setToast({ ...toast, open: false });

    const handleScanSuccess = (result) => {
        if (result && result.length > 0) {
            const scannedText = result[0].rawValue;
            const match = scannedText.match(/play\/([A-Z0-9]+)/i);
            if (match && match[1]) { setOpenScanner(false); navigate(`/arena/play/${match[1]}`); } 
            else if (scannedText.length <= 6) { setOpenScanner(false); navigate(`/arena/play/${scannedText}`); } 
            else { showToast('Mã QR không hợp lệ!', 'warning'); }
        }
    };

    useEffect(() => { if (selectedGrade) axiosClient.get(`/topics/?grade=${selectedGrade}`).then(res => setTopics(res.data)); }, [selectedGrade]);
    
    useEffect(() => {
        if (selectedTopic && viewMode === 'system') {
            setLoadingQuestions(true);
            axiosClient.get(`/arena/topic-questions/?topic_id=${selectedTopic}`).then(res => {
                setQuestions(res.data);
                const newSettings = { ...qSettings };
                res.data.forEach(q => { if (!newSettings[q.id]) newSettings[q.id] = { selected: false, time: "20" }; });
                setQSettings(newSettings);
            }).finally(() => setLoadingQuestions(false));
        }
    }, [selectedTopic, viewMode]);

    const handleToggleSelect = (id) => setQSettings(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));
    const handleTimeChange = (id, val) => { const numericVal = val.replace(/[^0-9]/g, ''); setQSettings(prev => ({ ...prev, [id]: { ...prev[id], time: numericVal, selected: true } })); };

    const handleSaveCustomQuestion = async () => {
        if (!customQ.content.trim()) return showToast('Vui lòng nhập đề bài!', 'warning');
        
        const payload = {
            content: customQ.content,
            question_type: customQ.question_type,
            explanation: customQ.explanation,
            short_answer: customQ.shortAnswer,
            options: customQ.question_type === 'MCQ' ? customQ.optionsMCQ : customQ.optionsTF
        };

        try {
            const res = await axiosClient.post('/arena/custom-questions/create/', payload);
            const newQuestion = res.data; 
            setQuestions([newQuestion, ...questions]);
            setQSettings(prev => ({ ...prev, [newQuestion.id]: { selected: true, time: "30" } }));
            showToast('Đã lưu câu hỏi vào kho cá nhân!', 'success');
            setOpenCustomQModal(false);
            setCustomQ({
                content: '', question_type: 'MCQ', explanation: '', shortAnswer: '',
                optionsMCQ: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }],
                optionsTF: [{ text: '', is_correct: true }, { text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }]
            });
        } catch (err) {
            showToast('Lỗi khi lưu câu hỏi. Vui lòng kiểm tra lại!');
        }
    };

    const submitCreateArena = async () => {
        const questions_data = Object.keys(qSettings).filter(id => qSettings[id].selected).map(id => {
            const finalTime = parseInt(qSettings[id].time);
            return { id: parseInt(id), time_limit: isNaN(finalTime) || finalTime <= 0 ? 20 : finalTime };
        });
        if (questions_data.length === 0) return showToast('Vui lòng chọn ít nhất 1 câu hỏi!', 'warning');
        setLoading(true);
        try {
            const res = await axiosClient.post('/arena/create/', { title: arenaTitle, questions_data });
            navigate(`/arena/host/${res.data.pin}`);
        } catch (err) { showToast('Có lỗi xảy ra khi tạo phòng!'); } finally { setLoading(false); setOpenCreateModal(false); }
    };

    const getTypeLabel = (type) => {
        switch(type) {
            case 'MCQ': return <Chip label="Trắc nghiệm" color="primary" size="small" variant="outlined" />;
            case 'TF': return <Chip label="Đúng/Sai" color="warning" size="small" variant="outlined" />;
            case 'SHORT': return <Chip label="Trả lời ngắn" color="success" size="small" variant="outlined" />;
            default: return null;
        }
    };

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

            {/* Các Dialog Phụ */}
            <Dialog open={openGuide} onClose={() => setOpenGuide(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#2c3e50', color: '#f1c40f', fontWeight: 'bold', textAlign: 'center' }}>📖 CẨM NANG ĐẤU TRƯỜNG</DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">1. Cách tính điểm</Typography>
                    <Typography variant="body1" mb={2}>Điểm gốc trả lời đúng: <b>500 đ</b>. Điểm thưởng tốc độ: <b>Lên tới 500 đ</b>.</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">2. Hướng dẫn Giáo viên soạn đề</Typography>
                    <Typography variant="body1">Để chèn hình ảnh, Thầy/Cô chỉ cần bấm vào <b>Biểu tượng Bức ảnh 🖼️</b> ở góc phải của bất kỳ ô nhập liệu nào. Ảnh sẽ tự động được tải lên và hiển thị cho học sinh!</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 2 }}><Button onClick={() => setOpenGuide(false)} variant="contained" color="primary" sx={{ borderRadius: 5, px: 4 }}>Đã hiểu</Button></DialogActions>
            </Dialog>

            <Dialog open={openScanner} onClose={() => setOpenScanner(false)} fullWidth maxWidth="xs">
                <DialogContent sx={{ p: 0, bgcolor: 'black' }}>{openScanner && <Scanner onScan={handleScanSuccess} formats={['qr_code']} />}</DialogContent>
                <DialogActions sx={{ justifyContent: 'center', bgcolor: '#2c3e50', p: 2 }}><Button onClick={() => setOpenScanner(false)} variant="contained" color="error">Đóng Camera</Button></DialogActions>
            </Dialog>

            {/* Dialog Cài Đặt Trận Đấu */}
            <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ bgcolor: '#4a148c', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Cài đặt Trận Đấu</span>
                    <Button variant="contained" color="warning" startIcon={<EditIcon />} onClick={() => setOpenCustomQModal(true)} sx={{ fontWeight: 'bold' }}>Tự soạn câu hỏi</Button>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <TextField fullWidth label="Tên Trận Đấu" value={arenaTitle} onChange={(e) => setArenaTitle(e.target.value)} sx={{ mb: 3, mt: 1 }} />
                    
                    {/* 🟢 THANH CHUYỂN ĐỔI: NGÂN HÀNG HỆ THỐNG <--> KHO CÁ NHÂN */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Box sx={{ bgcolor: '#f1f2f6', borderRadius: 10, p: 0.5, display: 'inline-flex' }}>
                            <Button 
                                onClick={() => {
                                    setViewMode('system');
                                    setSelectedGrade(''); setSelectedTopic(''); setQuestions([]); 
                                }}
                                sx={{ borderRadius: 10, px: 3, py: 1, fontWeight: 'bold', bgcolor: viewMode === 'system' ? '#4a148c' : 'transparent', color: viewMode === 'system' ? 'white' : '#333', textTransform: 'none' }}
                            >
                                🏫 Ngân hàng Hệ thống
                            </Button>
                            <Button 
                                onClick={() => {
                                    setViewMode('personal');
                                    setLoadingQuestions(true);
                                    axiosClient.get('/arena/my-custom-questions/')
                                        .then(res => {
                                            setQuestions(res.data);
                                            const newSettings = { ...qSettings };
                                            res.data.forEach(q => { if (!newSettings[q.id]) newSettings[q.id] = { selected: false, time: "20" }; });
                                            setQSettings(newSettings);
                                        })
                                        .finally(() => setLoadingQuestions(false));
                                }}
                                sx={{ borderRadius: 10, px: 3, py: 1, fontWeight: 'bold', bgcolor: viewMode === 'personal' ? '#e67e22' : 'transparent', color: viewMode === 'personal' ? 'white' : '#333', textTransform: 'none' }}
                            >
                                🎒 Kho Cá Nhân của tôi
                            </Button>
                        </Box>
                    </Box>

                    {/* Chỉ hiện chọn Khối/Chủ đề nếu đang ở Ngân hàng Hệ thống */}
                    {viewMode === 'system' && (
                        <Box display="flex" gap={2} mb={3}>
                            <FormControl fullWidth><InputLabel>Khối</InputLabel><Select value={selectedGrade} label="Khối" onChange={(e) => setSelectedGrade(e.target.value)}>{[12, 11, 10, 9, 8, 7, 6].map(g => <MenuItem key={g} value={g}>Lớp {g}</MenuItem>)}</Select></FormControl>
                            <FormControl fullWidth disabled={!selectedGrade}><InputLabel>Chủ Đề (Server)</InputLabel><Select value={selectedTopic} label="Chủ Đề" onChange={(e) => setSelectedTopic(e.target.value)}>{topics.map((t) => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}</Select></FormControl>
                        </Box>
                    )}

                    <Divider>
                        <Chip label={viewMode === 'personal' ? "Câu hỏi do bạn tự soạn" : "Câu hỏi từ Hệ thống"} color="primary" variant="outlined" />
                    </Divider>
                    
                    {loadingQuestions ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : (
                        <List sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #ddd', mt: 2, borderRadius: 2 }}>
                            {questions.map((q) => (
                                <ListItem key={q.id} sx={{ borderBottom: '1px solid #f0f0f0', bgcolor: q.is_private ? 'rgba(230, 126, 34, 0.05)' : 'transparent' }}>
                                    <ListItemIcon><Checkbox checked={!!qSettings[q.id]?.selected} onChange={() => handleToggleSelect(q.id)} /></ListItemIcon>
                                    <ListItemText 
                                        primary={<Typography noWrap variant="body1" sx={{ maxWidth: '400px' }}>{q.content}</Typography>} 
                                        secondary={<Box display="flex" gap={1} mt={0.5}>{getTypeLabel(q.question_type)}{q.is_private && <Chip label="Của tôi" color="warning" size="small" />}</Box>} 
                                        sx={{ mr: 2 }} 
                                    />
                                    <TextField size="small" label="Số giây" value={qSettings[q.id]?.time !== undefined ? qSettings[q.id].time : "20"} onChange={(e) => handleTimeChange(q.id, e.target.value)} sx={{ width: 100 }} inputProps={{ inputMode: 'numeric' }} InputProps={{ startAdornment: (<InputAdornment position="start"><TimerIcon fontSize="small" color={qSettings[q.id]?.selected ? "primary" : "inherit"} /></InputAdornment>) }} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenCreateModal(false)}>Hủy</Button><Button onClick={submitCreateArena} variant="contained" sx={{ bgcolor: '#4a148c' }}>Khởi tạo Đấu Trường</Button></DialogActions>
            </Dialog>

            {/* 🟢 DIALOG SOẠN CÂU HỎI THÔNG MINH (HỖ TRỢ VÔ HẠN ẢNH) */}
            <Dialog open={openCustomQModal} onClose={() => setOpenCustomQModal(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ bgcolor: '#f39c12', color: 'white', fontWeight: 'bold' }}>Tự soạn Câu hỏi (Hỗ trợ chèn nhiều ảnh)</DialogTitle>
                <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    
                    <SmartTextField label="Nội dung đề bài (Bấm icon bên phải để chèn ảnh)" value={customQ.content} onChange={(v) => setCustomQ({...customQ, content: v})} />

                    <FormControl fullWidth>
                        <InputLabel>Loại câu hỏi</InputLabel>
                        <Select value={customQ.question_type} label="Loại câu hỏi" onChange={(e) => setCustomQ({...customQ, question_type: e.target.value})}>
                            <MenuItem value="MCQ">Trắc nghiệm (Chọn 1 đáp án đúng)</MenuItem>
                            <MenuItem value="TF">Đúng/Sai (Chọn Đ/S cho 4 ý)</MenuItem>
                            <MenuItem value="SHORT">Trả lời ngắn (Điền số)</MenuItem>
                        </Select>
                    </FormControl>

                    <Divider><Typography color="primary" fontWeight="bold">Phần Đáp Án</Typography></Divider>

                    {customQ.question_type === 'MCQ' && (
                        <RadioGroup value={customQ.optionsMCQ.findIndex(o => o.is_correct)} onChange={(e) => {
                            const newOpts = customQ.optionsMCQ.map((o, idx) => ({ ...o, is_correct: idx === parseInt(e.target.value) }));
                            setCustomQ({...customQ, optionsMCQ: newOpts});
                        }}>
                            {customQ.optionsMCQ.map((opt, idx) => (
                                <Box key={idx} display="flex" alignItems="flex-start" gap={2} mb={1}>
                                    <FormControlLabel value={idx} control={<Radio color="success" sx={{ mt: 1 }} />} label="" />
                                    <Box flex={1}>
                                        <SmartTextField label={`Đáp án ${labelChars[idx]}`} value={opt.text} onChange={(v) => {
                                            const newOpts = [...customQ.optionsMCQ]; newOpts[idx].text = v; setCustomQ({...customQ, optionsMCQ: newOpts});
                                        }} isShort />
                                    </Box>
                                </Box>
                            ))}
                        </RadioGroup>
                    )}

                    {customQ.question_type === 'TF' && (
                        <Box>
                            {customQ.optionsTF.map((opt, idx) => (
                                <Box key={idx} display="flex" alignItems="flex-start" gap={2} mb={1}>
                                    <Select size="small" value={opt.is_correct} onChange={(e) => {
                                        const newOpts = [...customQ.optionsTF]; newOpts[idx].is_correct = e.target.value; setCustomQ({...customQ, optionsTF: newOpts});
                                    }} sx={{ mt: 1, minWidth: 100 }}>
                                        <MenuItem value={true} sx={{ color: 'green', fontWeight: 'bold' }}>Đúng</MenuItem>
                                        <MenuItem value={false} sx={{ color: 'red', fontWeight: 'bold' }}>Sai</MenuItem>
                                    </Select>
                                    <Box flex={1}>
                                        <SmartTextField label={`Ý ${labelChars[idx]}`} value={opt.text} onChange={(v) => {
                                            const newOpts = [...customQ.optionsTF]; newOpts[idx].text = v; setCustomQ({...customQ, optionsTF: newOpts});
                                        }} isShort />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {customQ.question_type === 'SHORT' && (
                        <TextField fullWidth label="Đáp án đúng (Là 1 con số)" type="number" value={customQ.shortAnswer} onChange={(e) => setCustomQ({...customQ, shortAnswer: e.target.value})} placeholder="VD: 5 hoặc -2.5" />
                    )}

                    <Divider />
                    <SmartTextField label="Lời giải chi tiết (Sẽ hiện trên Tivi khi hết giờ)" value={customQ.explanation} onChange={(v) => setCustomQ({...customQ, explanation: v})} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenCustomQModal(false)}>Hủy bỏ</Button>
                    <Button variant="contained" color="warning" startIcon={<SaveIcon />} onClick={handleSaveCustomQuestion}>Lưu vào Kho</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled">{toast.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default ArenaEntry;