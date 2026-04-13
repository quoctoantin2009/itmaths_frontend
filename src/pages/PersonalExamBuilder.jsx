import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

import { 
    Box, Typography, Button, Paper, Grid, List, ListItem, 
    ListItemIcon, ListItemText, IconButton, Tooltip, Chip, 
    CircularProgress, Divider, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

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

            // 🟢 ĐÃ FIX URL: Link đúng đến thư mục Đấu trường
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
            // 🟢 ĐÃ FIX URL: Link đúng đến kho câu hỏi Đấu trường
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

    const handleRemoveQuestionFromExam = async (questionId) => {
        if (!window.confirm("Loại bỏ câu hỏi này khỏi đề?")) return;
        try {
            await axiosClient.delete(`/questions/${questionId}/`);
            setExamQuestions(examQuestions.filter(q => q.id !== questionId));
            showToast("Đã loại bỏ câu hỏi!");
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

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <Box display="flex" alignItems="center" mb={3}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/quan-ly-de-thi')} sx={{ mr: 2, fontWeight: 'bold' }}>
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
                            {bankQuestions.map(q => (
                                <ListItem key={q.id} sx={{ border: '1px solid #eee', mb: 1, borderRadius: 2, bgcolor: 'white' }}>
                                    <ListItemText 
                                        primary={<Typography noWrap sx={{ maxWidth: '80%' }}>{q.content}</Typography>}
                                        secondary={<Box mt={0.5}>{getTypeLabel(q.question_type)}</Box>}
                                    />
                                    <Tooltip title="Đưa câu này vào Đề">
                                        <IconButton color="primary" onClick={() => handleAddQuestionToExam(q.id)}>
                                            <AddCircleIcon fontSize="large" />
                                        </IconButton>
                                    </Tooltip>
                                </ListItem>
                            ))}
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
                                    <ListItemIcon><Typography fontWeight="bold" color="primary">Câu {idx + 1}.</Typography></ListItemIcon>
                                    <ListItemText 
                                        primary={<Typography sx={{ wordBreak: 'break-word' }}>{q.content}</Typography>}
                                        secondary={<Box mt={0.5}>{getTypeLabel(q.question_type)}</Box>}
                                    />
                                    <Tooltip title="Loại khỏi Đề">
                                        <IconButton color="error" onClick={() => handleRemoveQuestionFromExam(q.id)}>
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

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%', boxShadow: 3 }}>{toast.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PersonalExamBuilder;