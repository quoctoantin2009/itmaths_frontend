import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

import { 
    Box, Typography, Button, Paper, Grid, List, ListItem, 
    ListItemIcon, ListItemText, IconButton, Tooltip, Chip, 
    CircularProgress, Divider, Snackbar, Alert, FormControl, 
    InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // 🟢 Bổ sung icon Check

const PersonalExamBuilder = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [examQuestions, setExamQuestions] = useState([]);
    
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [bankQuestions, setBankQuestions] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

    // 🟢 STATE CHO CỬA SỔ XÓA ĐẸP MẮT
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, questionId: null });

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const showToast = (message, type = 'success') => setToast({ open: true, message, type });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const examRes = await axiosClient.get(`/exams/${id}/`);
            setExam(examRes.data);
            const eqRes = await axiosClient.get(`/exams/${id}/questions/`);
            setExamQuestions(Array.isArray(eqRes.data) ? eqRes.data : []);

            const folderRes = await axiosClient.get('/arena/folders/'); 
            setFolders(Array.isArray(folderRes.data) ? folderRes.data : []);

            fetchBankQuestions('');
        } catch (error) {
            showToast("Lỗi tải dữ liệu!", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchBankQuestions = async (folderId) => {
        try {
            const res = await axiosClient.get('/arena/my-custom-questions/');
            let allQuestions = Array.isArray(res.data) ? res.data : [];
            if (folderId) {
                allQuestions = allQuestions.filter(q => q.folder_id === parseInt(folderId));
            }
            setBankQuestions(allQuestions);
        } catch (error) {
            console.error("Lỗi lấy kho câu hỏi", error);
        }
    };

    const handleFolderChange = (e) => {
        const fId = e.target.value;
        setSelectedFolderId(fId);
        fetchBankQuestions(fId);
    };

    const handleAddQuestionToExam = async (questionId) => {
        try {
            await axiosClient.post(`/exams/${id}/import-questions/`, {
                question_ids: [questionId]
            });
            const eqRes = await axiosClient.get(`/exams/${id}/questions/`);
            setExamQuestions(Array.isArray(eqRes.data) ? eqRes.data : []);
            showToast("Đã thêm câu hỏi vào đề!");
        } catch (error) {
            showToast("Lỗi khi thêm câu hỏi!", "error");
        }
    };

    // 🟢 THUẬT TOÁN KIỂM TRA TRÙNG LẶP (Dựa vào nội dung câu hỏi)
    const isQuestionAlreadyInExam = (contentToCheck) => {
        return examQuestions.some(q => q.content === contentToCheck);
    };

    // 🟢 HÀM MỞ POPUP XÓA
    const handleDeleteClick = (questionId) => {
        setDeleteConfirm({ open: true, questionId: questionId });
    };

    // 🟢 HÀM XÓA CHÍNH THỨC SAU KHI XÁC NHẬN
    const confirmRemoveQuestion = async () => {
        const qId = deleteConfirm.questionId;
        setDeleteConfirm({ open: false, questionId: null }); // Đóng popup ngay lập tức
        try {
            await axiosClient.delete(`/questions/${qId}/`);
            setExamQuestions(examQuestions.filter(q => q.id !== qId));
            showToast("Đã loại bỏ câu hỏi khỏi đề!");
        } catch (error) {
            showToast("Lỗi khi loại bỏ!", "error");
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

    // Hàm render nội dung có ảnh
    const renderContent = (text) => {
        if (!text) return null;
        const parts = text.split(/\[IMG:(.*?)\]/g);
        return (
            <span>
                {parts.map((part, i) => {
                    if (i % 2 === 1) {
                        return <Chip key={i} size="small" label="🖼️ Hình ảnh" color="info" sx={{ mx: 0.5, height: 20 }} />;
                    }
                    return part;
                })}
            </span>
        );
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <Box display="flex" alignItems="center" mb={3}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/quan-ly-de-thi')} sx={{ mr: 2, fontWeight: 'bold', bgcolor: 'white' }}>
                    Trở về
                </Button>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Biên soạn Đề: {exam?.title}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* CỘT TRÁI: KHO CÂU HỎI */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '75vh', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2} color="#e67e22">
                            🎒 Kho Câu hỏi Cá nhân
                        </Typography>
                        
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Lọc theo thư mục</InputLabel>
                            <Select value={selectedFolderId} label="Lọc theo thư mục" onChange={handleFolderChange}>
                                <MenuItem value="">-- Tất cả câu hỏi --</MenuItem>
                                {folders.map(f => <MenuItem key={f.id} value={f.id}>📁 {f.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <Divider sx={{ mb: 2 }} />

                        <List sx={{ flex: 1, overflowY: 'auto' }}>
                            {bankQuestions.map(q => {
                                // 🟢 Kiểm tra xem câu này đã có trong đề chưa
                                const isAdded = isQuestionAlreadyInExam(q.content);

                                return (
                                    <ListItem key={q.id} sx={{ border: '1px solid #eee', mb: 1, borderRadius: 2, bgcolor: isAdded ? '#f9f9f9' : 'white', opacity: isAdded ? 0.7 : 1 }}>
                                        <ListItemText 
                                            primary={<Typography sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{renderContent(q.content)}</Typography>}
                                            secondary={<Box mt={0.5}>{getTypeLabel(q.question_type)}</Box>}
                                        />
                                        
                                        {/* 🟢 Nếu có rồi thì hiện tick xanh khóa lại, chưa có thì hiện nút Cộng */}
                                        {isAdded ? (
                                            <Tooltip title="Câu hỏi này đã nằm trong đề">
                                                <IconButton disabled>
                                                    <CheckCircleIcon color="success" fontSize="large" />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Đưa câu này vào Đề">
                                                <IconButton color="primary" onClick={() => handleAddQuestionToExam(q.id)}>
                                                    <AddCircleIcon fontSize="large" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </ListItem>
                                );
                            })}
                            {bankQuestions.length === 0 && <Typography align="center" color="textSecondary" mt={5}>Không có câu hỏi nào.</Typography>}
                        </List>
                    </Paper>
                </Grid>

                {/* CỘT PHẢI: CÂU HỎI TRONG ĐỀ */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '75vh', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '2px solid #3498db' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2} color="#2980b9">
                            📄 Các câu hỏi trong Đề thi ({examQuestions.length} câu)
                        </Typography>
                        
                        <Divider sx={{ mb: 2 }} />

                        <List sx={{ flex: 1, overflowY: 'auto' }}>
                            {examQuestions.map((q, idx) => (
                                <ListItem key={q.id} sx={{ border: '1px solid #ddd', mb: 1, borderRadius: 2, bgcolor: '#f8fcff' }}>
                                    <ListItemIcon><Typography fontWeight="bold" color="primary" sx={{ minWidth: '40px' }}>Câu {idx + 1}.</Typography></ListItemIcon>
                                    <ListItemText 
                                        primary={<Typography sx={{ wordBreak: 'break-word' }}>{renderContent(q.content)}</Typography>}
                                        secondary={<Box mt={0.5}>{getTypeLabel(q.question_type)}</Box>}
                                    />
                                    <Tooltip title="Loại khỏi Đề">
                                        <IconButton color="error" onClick={() => handleDeleteClick(q.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </ListItem>
                            ))}
                            {examQuestions.length === 0 && (
                                <Box textAlign="center" mt={10}>
                                    <Typography color="textSecondary">Đề thi đang trống.</Typography>
                                    <Typography color="textSecondary" variant="body2">Hãy bấm dấu (+) ở cột bên trái để thêm câu hỏi vào đề.</Typography>
                                </Box>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* 🟢 CỬA SỔ CONFIRM XÓA CÂU HỎI XỊN SÒ */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, questionId: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⚠️ Xác nhận loại bỏ
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Bạn có chắc chắn muốn loại bỏ câu hỏi này khỏi đề thi hiện tại không?</Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>(Yên tâm, câu hỏi gốc trong kho vẫn được giữ nguyên)</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirm({ open: false, questionId: null })} color="inherit">Hủy bỏ</Button>
                    <Button onClick={confirmRemoveQuestion} variant="contained" color="error">Đồng ý loại bỏ</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%', boxShadow: 3 }}>{toast.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PersonalExamBuilder;