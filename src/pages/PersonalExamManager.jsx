import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

import { 
    Box, Typography, Button, Paper, TextField, Dialog, DialogTitle, 
    DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, 
    Divider, Grid, Card, CardContent, CardActions, IconButton, Tooltip, Snackbar, Alert 
} from '@mui/material';

import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const PersonalExamManager = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modals state
    const [openFolderModal, setOpenFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    
    const [openExamModal, setOpenExamModal] = useState(false);
    const [examData, setExamData] = useState({ title: '', duration: 45, description: '' });

    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => setToast({ open: true, message, type });

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (selectedFolder) {
            fetchExams(selectedFolder.id);
        } else {
            fetchExams(''); // Lấy đề không có thư mục (Nằm ngoài cùng)
        }
    }, [selectedFolder]);

    const fetchFolders = async () => {
        try {
            const res = await axiosClient.get('/exam-folders/');
            setFolders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            showToast("Lỗi tải danh sách thư mục!", "error");
        }
    };

    const fetchExams = async (folderId) => {
        setLoading(true);
        try {
            // Gọi API lấy đề thi do chính user này tạo và lọc theo folder
            const res = await axiosClient.get(`/exams/?folder=${folderId}&is_public=false`);
            setExams(Array.isArray(res.data) ? res.data : (res.data?.results || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return showToast("Vui lòng nhập tên thư mục!", "warning");
        try {
            const res = await axiosClient.post('/exam-folders/', { name: newFolderName });
            setFolders([res.data, ...folders]);
            setNewFolderName('');
            setOpenFolderModal(false);
            showToast("Tạo thư mục thành công!");
        } catch (err) {
            showToast("Lỗi tạo thư mục!", "error");
        }
    };

    const handleCreateExam = async () => {
        if (!examData.title.trim()) return showToast("Vui lòng nhập tên đề thi!", "warning");
        try {
            const payload = {
                title: examData.title,
                duration: examData.duration,
                description: examData.description,
                is_public: false, // Đề cá nhân
                folder: selectedFolder ? selectedFolder.id : null
            };
            const res = await axiosClient.post('/exams/', payload);
            setExams([res.data, ...exams]);
            setOpenExamModal(false);
            setExamData({ title: '', duration: 45, description: '' });
            showToast("Tạo đề thi thành công!");
        } catch (err) {
            showToast("Lỗi khi tạo đề thi!", "error");
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
            
            {/* SIDEBAR BÊN TRÁI: QUẢN LÝ THƯ MỤC */}
            <Box sx={{ width: '280px', bgcolor: 'white', borderRight: '1px solid #e0e0e0', p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="bold" color="primary" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderOpenIcon /> Kho Đề Cá Nhân
                </Typography>
                
                <Button 
                    variant="outlined" 
                    startIcon={<CreateNewFolderIcon />} 
                    onClick={() => setOpenFolderModal(true)}
                    fullWidth 
                    sx={{ mb: 2, borderRadius: 2, borderWidth: 2 }}
                >
                    Thư mục mới
                </Button>

                <List sx={{ flex: 1, overflowY: 'auto' }}>
                    <ListItem 
                        button 
                        selected={selectedFolder === null} 
                        onClick={() => setSelectedFolder(null)}
                        sx={{ borderRadius: 2, mb: 0.5, bgcolor: selectedFolder === null ? 'rgba(25, 118, 210, 0.08)' : 'transparent' }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}><FolderIcon color={selectedFolder === null ? "primary" : "action"} /></ListItemIcon>
                        <ListItemText primary={<Typography fontWeight={selectedFolder === null ? "bold" : "normal"}>Ngoài cùng</Typography>} />
                    </ListItem>

                    {folders.map(folder => (
                        <ListItem 
                            button 
                            key={folder.id} 
                            selected={selectedFolder?.id === folder.id} 
                            onClick={() => setSelectedFolder(folder)}
                            sx={{ borderRadius: 2, mb: 0.5, bgcolor: selectedFolder?.id === folder.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent' }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}><FolderIcon color={selectedFolder?.id === folder.id ? "primary" : "action"} /></ListItemIcon>
                            <ListItemText primary={<Typography fontWeight={selectedFolder?.id === folder.id ? "bold" : "normal"} noWrap>{folder.name}</Typography>} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* MAIN CONTENT BÊN PHẢI: QUẢN LÝ ĐỀ THI */}
            <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" color="#2c3e50">
                        {selectedFolder ? `📁 ${selectedFolder.name}` : '📁 Các đề nằm ngoài thư mục'}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<PostAddIcon />} 
                        onClick={() => setOpenExamModal(true)}
                        sx={{ px: 3, py: 1, borderRadius: 5, fontWeight: 'bold' }}
                    >
                        TẠO ĐỀ THI MỚI
                    </Button>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>
                ) : exams.length === 0 ? (
                    <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #ccc' }}>
                        <AssignmentIcon sx={{ fontSize: 80, color: '#bdc3c7', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary">Chưa có đề thi nào trong mục này.</Typography>
                        <Typography variant="body2" color="textSecondary">Hãy bấm "TẠO ĐỀ THI MỚI" để bắt đầu xây dựng kho dữ liệu của bạn.</Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {exams.map(exam => (
                            <Grid item xs={12} sm={6} md={4} key={exam.id}>
                                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' } }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" noWrap gutterBottom title={exam.title}>
                                            {exam.title}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" mb={1}>
                                            ⏱ Thời gian: {exam.duration} phút
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>
                                            {exam.description || 'Không có mô tả'}
                                        </Typography>
                                    </CardContent>
                                    <Divider />
                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
                                        <Box>
                                            <Tooltip title="Sửa thông tin đề">
                                                <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa đề thi">
                                                <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                        </Box>
                                        <Button 
                                            size="small" 
                                            endIcon={<ArrowForwardIosIcon fontSize="small" />}
                                            onClick={() => navigate(`/exams/${exam.id}/edit`)} // Chuyển hướng sang trang soạn câu hỏi
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Soạn câu hỏi
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* MODAL TẠO THƯ MỤC MỚI */}
            <Dialog open={openFolderModal} onClose={() => setOpenFolderModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">Tạo Thư mục mới</DialogTitle>
                <DialogContent>
                    <TextField 
                        autoFocus fullWidth variant="outlined" 
                        label="Tên thư mục (VD: Đề Ôn thi Đại học)" 
                        value={newFolderName} 
                        onChange={(e) => setNewFolderName(e.target.value)} 
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenFolderModal(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleCreateFolder} variant="contained" color="primary">Tạo mới</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL TẠO ĐỀ THI MỚI */}
            <Dialog open={openExamModal} onClose={() => setOpenExamModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold" sx={{ bgcolor: '#9b59b6', color: 'white' }}>Tạo Đề thi Cá nhân</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" mb={3}>
                        Đề thi này sẽ được lưu vào: <strong>{selectedFolder ? selectedFolder.name : "Nằm ngoài cùng (Không có thư mục)"}</strong>
                    </Typography>
                    
                    <TextField 
                        fullWidth label="Tên Đề thi (VD: Kiểm tra 15p Hàm số)" 
                        value={examData.title} onChange={(e) => setExamData({...examData, title: e.target.value})} 
                        sx={{ mb: 3 }}
                    />
                    <TextField 
                        fullWidth type="number" label="Thời gian làm bài (Phút)" 
                        value={examData.duration} onChange={(e) => setExamData({...examData, duration: e.target.value})} 
                        sx={{ mb: 3 }}
                    />
                    <TextField 
                        fullWidth multiline rows={3} label="Ghi chú / Mô tả ngắn" 
                        value={examData.description} onChange={(e) => setExamData({...examData, description: e.target.value})} 
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenExamModal(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleCreateExam} variant="contained" color="secondary" sx={{ fontWeight: 'bold', px: 3 }}>Lưu Đề Thi</Button>
                </DialogActions>
            </Dialog>

            {/* THÔNG BÁO TOAST */}
            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%', boxShadow: 3 }}>{toast.message}</Alert>
            </Snackbar>

        </Box>
    );
};

export default PersonalExamManager;