import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

// Import các component giao diện đẹp
import { 
    Dialog, DialogContent, DialogTitle, DialogActions, 
    Button, Typography, Box, Slide, IconButton, 
    Snackbar, Alert, TextField, CircularProgress 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete'; 
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Icon cảnh báo vàng

import './ClassroomPage.css';

// Hiệu ứng trượt lên cho Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ClassroomPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // --- CÁC STATE QUẢN LÝ GIAO DIỆN ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', grade: '12', description: '' });

  // 1. State thông báo (Toast) - Thay thế alert()
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // 2. State Dialog Xóa lớp - Thay thế window.confirm()
  const [deleteDialog, setDeleteDialog] = useState({ open: false, classId: null });

  // 3. State Dialog Tham gia lớp - Thay thế prompt()
  const [joinDialog, setJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // 4. State Dialog Tạo thành công
  const [successDialog, setSuccessDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await axiosClient.get('/user/me/');
      setCurrentUser(userRes.data);
      const classRes = await axiosClient.get('/classrooms/');
      setClasses(classRes.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ COPY MÃ ---
  const handleCopyCode = (code, e) => {
    e.stopPropagation(); 
    navigator.clipboard.writeText(code);
    // 🔥 Thay alert đen bằng Toast xanh
    setToast({ open: true, message: `Đã sao chép mã: ${code}`, severity: 'success' });
  };

  // --- XỬ LÝ TẠO LỚP ---
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/classrooms/', newClass);
      setShowCreateForm(false);
      setSuccessDialog(true); // Hiện bảng thành công đẹp
      setNewClass({ name: '', grade: '12', description: '' });
      fetchData(); 
    } catch (error) {
      handleError(error);
    }
  };

  // --- XỬ LÝ THAM GIA LỚP ---
  const handleJoinSubmit = async () => {
    if (!joinCode.trim()) return;
    try {
      await axiosClient.post('/classrooms/join/', { invite_code: joinCode });
      setToast({ open: true, message: 'Tham gia lớp thành công!', severity: 'success' });
      setJoinDialog(false); // Tắt bảng nhập
      setJoinCode("");
      fetchData();
    } catch (error) {
      handleError(error);
    }
  };

  // --- XỬ LÝ XÓA LỚP ---
  // Bước 1: Mở bảng hỏi (Thay confirm)
  const openDeleteConfirm = (classId, e) => {
      e.stopPropagation();
      setDeleteDialog({ open: true, classId });
  };

  // Bước 2: Xác nhận xóa thật
  const confirmDeleteClass = async () => {
      try {
          await axiosClient.delete(`/classrooms/${deleteDialog.classId}/`);
          setToast({ open: true, message: 'Đã xóa lớp học thành công!', severity: 'success' });
          setClasses(classes.filter(c => c.id !== deleteDialog.classId));
      } catch (error) {
          setToast({ open: true, message: 'Lỗi xóa lớp. Bạn không phải giáo viên chủ nhiệm.', severity: 'error' });
      } finally {
          setDeleteDialog({ open: false, classId: null });
      }
  };

  const handleError = (error) => {
      const msg = error.response?.data?.message || "Có lỗi xảy ra";
      setToast({ open: true, message: msg, severity: 'error' });
  };

  if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;

  const isTeacher = currentUser?.profile?.occupation === 'teacher' || 
                    currentUser?.occupation === 'teacher' ||
                    currentUser?.profile_occupation === 'teacher';

  return (
    <div className="classroom-container">
      {/* HEADER */}
      <div className="header-section">
        <h1 className="page-title">🏫 Lớp học của tôi</h1>
        <div className="action-buttons">
          <button onClick={() => setJoinDialog(true)} className="btn-join">
            + Tham gia bằng Mã
          </button>
          {isTeacher && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-create">
              {showCreateForm ? 'Đóng lại' : '+ Tạo lớp mới'}
            </button>
          )}
        </div>
      </div>

      {/* FORM TẠO LỚP */}
      {showCreateForm && (
        <div className="create-form-container">
          <h3 style={{color: '#1a237e', marginBottom: '15px'}}>Thông tin lớp học mới</h3>
          <form onSubmit={handleCreateClass} className="form-grid">
            <div className="input-group">
                <input 
                  type="text" placeholder="Tên lớp (VD: 12A1 - Luyện đề)" required
                  className="input-field"
                  value={newClass.name}
                  onChange={e => setNewClass({...newClass, name: e.target.value})}
                />
            </div>
            <div className="input-group">
                <select 
                  className="input-field"
                  value={newClass.grade}
                  onChange={e => setNewClass({...newClass, grade: e.target.value})}
                >
                  {[12,11,10,9,8,7,6].map(g => <option key={g} value={g}>Khối {g}</option>)}
                </select>
            </div>
            <input 
              type="text" placeholder="Mô tả ngắn (Tùy chọn)"
              className="input-field input-full"
              value={newClass.description}
              onChange={e => setNewClass({...newClass, description: e.target.value})}
            />
            <button type="submit" className="btn-submit">XÁC NHẬN TẠO LỚP</button>
          </form>
        </div>
      )}

      {/* DANH SÁCH LỚP HỌC */}
      {classes.length > 0 ? (
        <div className="class-grid">
          {classes.map(cls => (
            <div key={cls.id} onClick={() => navigate(`/classrooms/${cls.id}`)} className="class-card" style={{ position: 'relative' }}>
              <div className="card-banner">
                <div className="banner-top">
                    <h2 className="class-name">{cls.name}</h2>
                    <div className="code-badge" onClick={(e) => handleCopyCode(cls.invite_code, e)}>
                        🔑 {cls.invite_code}
                    </div>
                </div>
                <p className="class-grade">Khối {cls.grade} • {cls.program_type === 'gifted' ? '🔥 Bồi dưỡng' : '📚 Cơ bản'}</p>
                <div className="teacher-badge">GV: {cls.teacher_name}</div>

                {/* 🔥 NÚT XÓA - Mở Dialog Xóa */}
                {cls.is_teacher && (
                    <IconButton 
                        onClick={(e) => openDeleteConfirm(cls.id, e)}
                        sx={{ 
                            position: 'absolute', top: 5, right: 5, 
                            color: 'white', bgcolor: 'rgba(211, 47, 47, 0.8)',
                            '&:hover': { bgcolor: '#b71c1c' }, zIndex: 10
                        }}
                        size="small"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                )}
              </div>
              <div className="card-body">
                <p className="class-desc">{cls.description || "Chưa có mô tả."}</p>
                <div className="card-footer">
                  <span>👥 {cls.member_count || 0} HS</span>
                  <button className="btn-copy-code" onClick={(e) => handleCopyCode(cls.invite_code, e)}>
                    <ContentCopyIcon style={{fontSize: 14, marginRight: 4}}/> Copy Mã
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>Bạn chưa tham gia lớp học nào.</h3>
          {isTeacher && <p>Hãy bấm nút "Tạo lớp mới" ở góc phải để bắt đầu nhé!</p>}
        </div>
      )}

      {/* ========================================= */}
      {/* 🔥 CÁC DIALOG ĐẸP THAY THẾ ALERT CŨ 🔥 */}
      {/* ========================================= */}

      {/* 1. DIALOG NHẬP MÃ LỚP (Thay prompt) */}
      <Dialog open={joinDialog} onClose={() => setJoinDialog(false)}>
        <DialogTitle sx={{fontWeight:'bold'}}>Tham gia lớp học</DialogTitle>
        <DialogContent>
            <Typography variant="body2" sx={{mb: 2}}>Nhập mã mời 6 ký tự do giáo viên cung cấp:</Typography>
            <TextField 
                autoFocus fullWidth label="Mã lớp" variant="outlined" 
                value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 2}}>
            <Button onClick={() => setJoinDialog(false)} color="inherit">Hủy</Button>
            <Button onClick={handleJoinSubmit} variant="contained">Tham gia</Button>
        </DialogActions>
      </Dialog>

      {/* 2. DIALOG XÁC NHẬN XÓA (Thay confirm) */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({open: false, classId: null})}>
        <DialogTitle sx={{color: '#d32f2f', display:'flex', alignItems:'center', gap: 1}}>
            <WarningAmberIcon /> Cảnh báo xóa lớp
        </DialogTitle>
        <DialogContent>
            <Typography>
                Bạn có chắc chắn muốn xóa lớp học này không? <br/>
                <b>Hành động này không thể hoàn tác.</b> Tất cả bài tập và danh sách thành viên sẽ bị xóa.
            </Typography>
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 2}}>
            <Button onClick={() => setDeleteDialog({open: false, classId: null})}>Hủy bỏ</Button>
            <Button onClick={confirmDeleteClass} variant="contained" color="error">Xóa vĩnh viễn</Button>
        </DialogActions>
      </Dialog>

      {/* 3. DIALOG TẠO THÀNH CÔNG (Đẹp lung linh) */}
      <Dialog open={successDialog} TransitionComponent={Transition} keepMounted onClose={() => setSuccessDialog(false)}
        PaperProps={{ style: { borderRadius: 20, padding: '10px', minWidth: '320px', textAlign: 'center' } }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Box sx={{
                width: 80, height: 80, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                animation: 'pulse 1.5s infinite', '@keyframes pulse': { '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' }, '70%': { boxShadow: '0 0 0 20px rgba(76, 175, 80, 0)' }, '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' } }
            }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 50, color: '#4caf50' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>Thành công!</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>Lớp học mới đã được tạo.</Typography>
            <Button variant="contained" fullWidth onClick={() => setSuccessDialog(false)} sx={{ borderRadius: 10, background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)' }}>Tuyệt vời</Button>
        </DialogContent>
      </Dialog>

      {/* 4. TOAST THÔNG BÁO CHUNG (Thay alert) */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.severity} sx={{ width: '100%', boxShadow: 3 }} onClose={() => setToast({...toast, open: false})}>
            {toast.message}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default ClassroomPage;