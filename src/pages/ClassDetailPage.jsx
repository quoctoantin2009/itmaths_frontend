import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

// Import Icon đẹp
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import './ClassDetail.css';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [classroom, setClassroom] = useState(null);
  const [topics, setTopics] = useState([]); // Danh sách chuyên đề để giao
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'members'
  const [currentUser, setCurrentUser] = useState(null);

  // State giao bài
  const [selectedTopic, setSelectedTopic] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy thông tin User
      const userRes = await axiosClient.get('/user/me/');
      setCurrentUser(userRes.data);

      // 2. Lấy chi tiết lớp học
      const classRes = await axiosClient.get(`/classrooms/${id}/`);
      setClassroom(classRes.data);

      // 3. Lấy danh sách chuyên đề (nếu là GV)
      const topicRes = await axiosClient.get('/topics/');
      setTopics(topicRes.data);

      setLoading(false);
    } catch (error) {
      console.error("Lỗi:", error);
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.invite_code);
    alert(`Đã sao chép mã: ${classroom.invite_code}`);
  };

  const handleAssignTopic = async () => {
    if (!selectedTopic) return alert("Vui lòng chọn chuyên đề!");
    try {
      await axiosClient.post('/class_assignments/', {
        classroom: id,
        topic: selectedTopic
      });
      alert("✅ Giao bài thành công!");
      fetchData(); // Load lại để thấy bài mới
      setSelectedTopic('');
    } catch (error) {
      alert("Lỗi khi giao bài (Có thể bài này đã giao rồi)");
    }
  };

  if (loading) return <div className="loading-screen">Đang tải dữ liệu lớp học...</div>;
  if (!classroom) return <div className="error-screen">Không tìm thấy lớp học 😔</div>;

  const isTeacher = currentUser?.id === classroom.teacher; 
  // (Logic check GV đơn giản: so sánh ID người dùng với ID giáo viên của lớp)

  return (
    <div className="class-detail-container">
      
      {/* 1. BANNER LỚP HỌC */}
      <div className="class-banner">
        <div className="banner-content">
          <h1 className="banner-title">{classroom.name}</h1>
          <p className="banner-subtitle">
            Khối {classroom.grade} • {classroom.program_type === 'gifted' ? 'Bồi dưỡng' : 'Cơ bản'}
          </p>
          <p className="teacher-name">Giáo viên chủ nhiệm: <strong>{classroom.teacher_name}</strong></p>
        </div>
        
        {/* Box Mã Lớp nổi bật */}
        <div className="class-code-box" onClick={handleCopyCode} title="Bấm để sao chép">
            <span className="code-label">Mã lớp</span>
            <div className="code-value">
                {classroom.invite_code}
                <ContentCopyIcon fontSize="small" style={{marginLeft: 5}}/>
            </div>
        </div>
      </div>

      {/* 2. THANH TAB ĐIỀU HƯỚNG */}
      <div className="class-nav">
        <button 
            className={`nav-item ${activeTab === 'stream' ? 'active' : ''}`}
            onClick={() => setActiveTab('stream')}
        >
            Bảng tin & Bài tập
        </button>
        <button 
            className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
        >
            Thành viên ({classroom.member_count})
        </button>
      </div>

      {/* 3. NỘI DUNG CHÍNH */}
      <div className="class-body">
        
        {/* === TAB BẢNG TIN === */}
        {activeTab === 'stream' && (
            <div className="stream-layout">
                {/* Cột trái: Thông báo bài tập sắp đến hạn (Placeholder) */}
                <div className="stream-left">
                    <div className="upcoming-box">
                        <h5>Sắp đến hạn</h5>
                        <p className="no-work">Tuyệt vời, không có bài tập nào cần nộp gấp!</p>
                        <a href="#" className="view-all-link">Xem tất cả</a>
                    </div>
                </div>

                {/* Cột phải: Danh sách bài tập */}
                <div className="stream-center">
                    
                    {/* KHUNG GIAO BÀI (Chỉ GV mới thấy) */}
                    {isTeacher && (
                        <div className="assign-box">
                            <div className="assign-header">
                                <AddCircleIcon color="primary"/>
                                <h3>Giao bài tập mới</h3>
                            </div>
                            <div className="assign-body">
                                <select 
                                    className="topic-select"
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                >
                                    <option value="">-- Chọn chuyên đề từ Kho --</option>
                                    {topics.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.title} (Lớp {t.grade})
                                        </option>
                                    ))}
                                </select>
                                <button className="btn-assign" onClick={handleAssignTopic}>
                                    GIAO NGAY
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DANH SÁCH BÀI ĐÃ GIAO */}
                    <div className="assignment-list">
                        {classroom.assignments && classroom.assignments.length > 0 ? (
                            classroom.assignments.map((assign, index) => (
                                <div key={index} className="stream-card">
                                    <div className="card-icon">
                                        <AssignmentIcon sx={{ color: 'white' }} />
                                    </div>
                                    <div className="card-content">
                                        <h4 className="card-title">
                                            Giáo viên đã đăng một bài tập mới: 
                                            <span className="topic-highlight"> {assign.topic_title}</span>
                                        </h4>
                                        <p className="card-date">{new Date(assign.created_at).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-stream">
                                <img src="https://cdni.iconscout.com/illustration/premium/thumb/sleeping-cat-illustration-download-in-svg-png-gif-file-formats--sleep-animal-pet-rest-pack-nature-illustrations-3652899.png" alt="Empty" width="150"/>
                                <p>Chưa có bài tập nào được giao cho lớp này.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* === TAB THÀNH VIÊN === */}
        {activeTab === 'members' && (
            <div className="members-layout">
                <div className="section-header">
                    <h2 className="section-title">Giáo viên</h2>
                    <div className="divider"></div>
                </div>
                <div className="member-row teacher-row">
                    <div className="member-avatar teacher-avatar">{classroom.teacher_name.charAt(0)}</div>
                    <span className="member-name">{classroom.teacher_name}</span>
                </div>

                <div className="section-header" style={{marginTop: '40px'}}>
                    <div className="title-row">
                        <h2 className="section-title">Học sinh</h2>
                        <span className="student-count">{classroom.member_count} sinh viên</span>
                    </div>
                    <div className="divider"></div>
                </div>
                
                {/* Ở đây tạm thời chưa có list members chi tiết từ API, ta hiển thị placeholder */}
                {classroom.member_count > 0 ? (
                    <div className="student-list-placeholder">
                        <p>Danh sách học sinh sẽ hiển thị tại đây.</p>
                        {/* Sau này bạn có thể bổ sung API lấy list members để map vào đây */}
                    </div>
                ) : (
                    <div className="empty-members">
                        <GroupIcon sx={{ fontSize: 60, color: '#ddd' }}/>
                        <p>Chưa có học sinh nào tham gia lớp học.</p>
                        <p className="invite-hint">Hãy gửi mã <strong>{classroom.invite_code}</strong> để mời học sinh.</p>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default ClassDetail;