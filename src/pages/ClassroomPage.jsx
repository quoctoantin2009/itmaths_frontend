import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

// Import thêm các component đẹp của MUI
import { 
    Dialog, DialogContent, Button, Typography, Box, Slide, IconButton 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete'; // 🔥 Icon xóa lớp

import './ClassroomPage.css';

// Hiệu ứng trượt lên khi hiện bảng thông báo
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ClassroomPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State cho Form tạo lớp
  const [showForm, setShowForm] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', grade: '12', description: '' });

  // State cho bảng thông báo đẹp (Dialog)
  const [openSuccess, setOpenSuccess] = useState(false);

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
      
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/classrooms/', newClass);
      
      // ✅ THAY ĐỔI: Không dùng alert nữa, mở bảng đẹp lên
      setShowForm(false);
      setOpenSuccess(true); 
      
      // Reset form
      setNewClass({ name: '', grade: '12', description: '' });
      fetchData(); 
    } catch (error) {
      handleError(error);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };

  const handleCopyCode = (code, e) => {
    e.stopPropagation(); 
    navigator.clipboard.writeText(code);
    alert(`✅ Đã sao chép mã lớp: ${code}`); 
  };

  // 🔥 [MỚI] HÀM XÓA LỚP
  const handleDeleteClass = async (classId, e) => {
      e.stopPropagation(); // Ngăn sự kiện click vào thẻ lớp
      if (!window.confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa lớp này không?\n\nMọi dữ liệu bài tập và danh sách thành viên sẽ bị xóa vĩnh viễn!")) return;

      try {
          await axiosClient.delete(`/classrooms/${classId}/`);
          alert("✅ Đã xóa lớp học thành công!");
          // Cập nhật lại danh sách ngay lập tức (xóa khỏi state)
          setClasses(classes.filter(c => c.id !== classId));
      } catch (error) {
          alert("❌ Lỗi khi xóa lớp. Có thể bạn không phải là giáo viên chủ nhiệm.");
      }
  };

  const handleJoinClass = async () => {
    const code = prompt("Nhập mã lớp (Invite Code) do giáo viên cung cấp:");
    if (!code) return;
    try {
      await axiosClient.post('/classrooms/join/', { invite_code: code });
      alert("✅ Tham gia lớp thành công!"); 
      fetchData();
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
      console.error(error);
      const serverData = error.response?.data;
      if (typeof serverData === 'string' && serverData.trim().startsWith('<')) {
          alert("⚠️ Lỗi Server. Vui lòng thử lại sau.");
      } else if (serverData && serverData.message) {
          alert("❌ " + serverData.message);
      } else {
          alert("❌ Có lỗi xảy ra.");
      }
  };

  if (loading) return <div className="loading-text">Đang tải danh sách lớp...</div>;

  const isTeacher = currentUser?.profile?.occupation === 'teacher' || 
                    currentUser?.occupation === 'teacher' ||
                    currentUser?.profile_occupation === 'teacher';

  return (
    <div className="classroom-container">
      {/* HEADER */}
      <div className="header-section">
        <h1 className="page-title">🏫 Lớp học của tôi</h1>
        
        <div className="action-buttons">
          <button onClick={handleJoinClass} className="btn-join">
            + Tham gia bằng Mã
          </button>

          {isTeacher && (
            <button onClick={() => setShowForm(!showForm)} className="btn-create">
              {showForm ? 'Đóng lại' : '+ Tạo lớp mới'}
            </button>
          )}
        </div>
      </div>

      {/* FORM TẠO LỚP */}
      {showForm && (
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
                  <option value="12">Khối 12</option>
                  <option value="11">Khối 11</option>
                  <option value="10">Khối 10</option>
                  <option value="9">Khối 9</option>
                  <option value="8">Khối 8</option>
                  <option value="7">Khối 7</option>
                  <option value="6">Khối 6</option>
                </select>
            </div>

            <input 
              type="text" placeholder="Mô tả ngắn (Tùy chọn)"
              className="input-field input-full"
              value={newClass.description}
              onChange={e => setNewClass({...newClass, description: e.target.value})}
            />

            <button type="submit" className="btn-submit">
              XÁC NHẬN TẠO LỚP
            </button>
          </form>
        </div>
      )}

      {/* DANH SÁCH LỚP HỌC */}
      {classes.length > 0 ? (
        <div className="class-grid">
          {classes.map(cls => (
            <div 
              key={cls.id} 
              onClick={() => navigate(`/classrooms/${cls.id}`)}
              className="class-card"
            >
              {/* ✅ [CẬP NHẬT] Banner có Mã lớp */}
              <div className="card-banner">
                <div className="banner-top">
                    <h2 className="class-name">{cls.name}</h2>
                    {/* Hiển thị Mã lớp ngay góc trên */}
                    <div className="code-badge" onClick={(e) => handleCopyCode(cls.invite_code, e)}>
                        🔑 {cls.invite_code}
                    </div>
                </div>
                
                <p className="class-grade">
                    Khối {cls.grade} • {cls.program_type === 'gifted' ? '🔥 Bồi dưỡng' : '📚 Cơ bản'}
                </p>
                
                <div className="teacher-badge">GV: {cls.teacher_name}</div>

                {/* 🔥 [MỚI] NÚT XÓA LỚP (CHỈ HIỆN NẾU LÀ GIÁO VIÊN CỦA LỚP ĐÓ) */}
                {cls.is_teacher && (
                    <IconButton 
                        onClick={(e) => handleDeleteClass(cls.id, e)}
                        sx={{ 
                            position: 'absolute', top: 5, right: 5, 
                            color: 'white', bgcolor: 'rgba(211, 47, 47, 0.8)',
                            '&:hover': { bgcolor: '#b71c1c' }
                        }}
                        size="small"
                        title="Xóa lớp học này"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                )}
              </div>
              
              {/* Phần Nội Dung */}
              <div className="card-body">
                <p className="class-desc">
                  {cls.description || "Chưa có mô tả."}
                </p>
                
                <div className="card-footer">
                  <span>👥 {cls.member_count || 0} HS</span>
                  
                  {/* ✅ [MỚI] Nút Copy mã lớp tiện lợi */}
                  <button 
                    className="btn-copy-code"
                    onClick={(e) => handleCopyCode(cls.invite_code, e)}
                    title="Bấm để sao chép mã mời"
                  >
                    Copy Mã
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

      {/* ✨ PHẦN DIALOG ĐẸP LUNG LINH ✨ */}
      <Dialog 
        open={openSuccess} 
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseSuccess}
        PaperProps={{
            style: { borderRadius: 20, padding: '10px', minWidth: '320px', textAlign: 'center' }
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Box sx={{
                width: 80, height: 80, borderRadius: '50%', bgcolor: '#e8f5e9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
                    '70%': { boxShadow: '0 0 0 20px rgba(76, 175, 80, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
                }
            }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 50, color: '#4caf50' }} />
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                Thành công!
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Lớp học mới đã được tạo.<br/>Bạn có thể bắt đầu thêm bài tập ngay.
            </Typography>
            
            <Button 
                variant="contained" 
                fullWidth 
                onClick={handleCloseSuccess}
                sx={{ 
                    borderRadius: 10, py: 1.5, fontSize: '1rem',
                    background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
                    textTransform: 'none', fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(76, 175, 80, 0.4)'
                }}
            >
                Tuyệt vời
            </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassroomPage;