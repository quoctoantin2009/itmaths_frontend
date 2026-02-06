import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

import { Snackbar, Alert, Slide, IconButton, Tooltip } from '@mui/material';

import './ClassDetail.css';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook dùng để chuyển trang
  
  const [classroom, setClassroom] = useState(null);
  const [topics, setTopics] = useState([]); 
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stream'); 
  const [currentUser, setCurrentUser] = useState(null);

  // --- STATE CHO BỘ LỌC 3 CẤP ---
  const [selectedGrade, setSelectedGrade] = useState('12'); 
  const [filteredTopics, setFilteredTopics] = useState([]); 
  const [selectedTopicId, setSelectedTopicId] = useState(''); 
  const [filteredExams, setFilteredExams] = useState([]);   
  const [selectedExamId, setSelectedExamId] = useState(''); 

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (topics.length > 0) {
        const gradeNum = parseInt(selectedGrade);
        const newFilteredTopics = topics.filter(t => t.grade === gradeNum);
        setFilteredTopics(newFilteredTopics);
        setSelectedTopicId('');
        setFilteredExams([]);
        setSelectedExamId('');
    }
  }, [selectedGrade, topics]);

  useEffect(() => {
    if (selectedTopicId) {
        const topic = topics.find(t => t.id === parseInt(selectedTopicId));
        if (topic && topic.exercises) {
            setFilteredExams(topic.exercises);
        } else {
            setFilteredExams([]);
        }
    } else {
        setFilteredExams([]);
    }
    setSelectedExamId('');
  }, [selectedTopicId, topics]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await axiosClient.get('/user/me/');
      setCurrentUser(userRes.data);

      const classRes = await axiosClient.get(`/classrooms/${id}/`);
      setClassroom(classRes.data);

      const membersRes = await axiosClient.get(`/classrooms/${id}/members/`);
      setMembers(membersRes.data);

      const topicRes = await axiosClient.get('/topics/');
      setTopics(topicRes.data);

      setLoading(false);
    } catch (error) {
      console.error("Lỗi:", error);
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ open: true, message: msg, severity: type });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.invite_code);
    showNotification(`Đã sao chép mã lớp: ${classroom.invite_code}`, 'success');
  };

  const handleAssignExam = async () => {
    if (!selectedExamId) {
        showNotification("Vui lòng chọn một đề thi cụ thể!", "warning");
        return;
    }
    
    try {
      await axiosClient.post('/class_assignments/', {
        classroom: id,
        exam: selectedExamId 
      });
      
      showNotification("✅ Giao bài thành công!", "success");
      fetchData(); 
      setSelectedExamId(''); 
    } catch (error) {
        console.error("Lỗi giao bài:", error);
        
        let msg = "❌ Có lỗi xảy ra";
        const data = error.response?.data;

        if (data) {
            if (data.message) {
                msg = "⚠️ " + data.message;
            } else if (data.non_field_errors) {
                msg = "⚠️ Bài tập này đã có trong lớp rồi!";
            } else if (data.exam) {
                msg = "⚠️ Lỗi đề thi: " + data.exam[0];
            } else {
                msg = "❌ Lỗi: " + JSON.stringify(data);
            }
        } else {
            msg = "❌ Lỗi kết nối Server";
        }
        
        showNotification(msg, "error");
    }
  };

  // ✅ [MỚI] Hàm xử lý khi bấm vào bài tập để làm bài
  const handleOpenExam = (examId) => {
      // Chuyển hướng đến trang chi tiết đề thi
      // Bạn kiểm tra lại đường dẫn router của bạn, thường là /exams/:id hoặc /exam/:id
      navigate(`/exams/${examId}`); 
  };

  if (loading) return <div className="loading-screen">Đang tải dữ liệu lớp học...</div>;
  if (!classroom) return <div className="error-screen">Không tìm thấy lớp học 😔</div>;

  const isTeacher = currentUser?.id === classroom.teacher; 

  return (
    <div className="class-detail-container">
      
      <div className="class-banner">
        <div className="banner-content">
          <h1 className="banner-title">{classroom.name}</h1>
          <p className="banner-subtitle">
            Khối {classroom.grade} • {classroom.program_type === 'gifted' ? 'Bồi dưỡng' : 'Cơ bản'}
          </p>
          <p className="teacher-name">GVCN: <strong>{classroom.teacher_name}</strong></p>
        </div>
        
        <div className="class-code-box" onClick={handleCopyCode} title="Bấm để sao chép">
            <span className="code-label">Mã lớp</span>
            <div className="code-value">
                {classroom.invite_code}
                <ContentCopyIcon fontSize="small" style={{marginLeft: 5}}/>
            </div>
        </div>
      </div>

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
            Thành viên ({members.length})
        </button>
      </div>

      <div className="class-body">
        
        {activeTab === 'stream' && (
            <div className="stream-layout">
                <div className="stream-left">
                    <div className="upcoming-box">
                        <h5>Sắp đến hạn</h5>
                        <p className="no-work">Tuyệt vời, không có bài tập nào cần nộp gấp!</p>
                        <a href="#" className="view-all-link">Xem tất cả</a>
                    </div>
                </div>

                <div className="stream-center">
                    
                    {isTeacher && (
                        <div className="assign-box">
                            <div className="assign-header">
                                <AddCircleIcon color="primary"/>
                                <h3>Giao bài tập mới</h3>
                            </div>
                            
                            <div className="assign-filter-container">
                                <div className="filter-item">
                                    <label>1. Chọn Khối:</label>
                                    <select 
                                        className="topic-select"
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                    >
                                        <option value="12">Toán 12 & Ôn thi TN</option>
                                        <option value="11">Toán 11</option>
                                        <option value="10">Toán 10</option>
                                        <option value="9">Toán 9</option>
                                        <option value="8">Toán 8</option>
                                        <option value="7">Toán 7</option>
                                        <option value="6">Toán 6</option>
                                    </select>
                                </div>

                                <div className="filter-item">
                                    <label>2. Chọn Chuyên đề:</label>
                                    <select 
                                        className="topic-select"
                                        value={selectedTopicId}
                                        onChange={(e) => setSelectedTopicId(e.target.value)}
                                        disabled={filteredTopics.length === 0}
                                    >
                                        <option value="">-- Chọn chuyên đề --</option>
                                        {filteredTopics.map(t => (
                                            <option key={t.id} value={t.id}>{t.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-item full-width">
                                    <label>3. Chọn Đề thi / Bài tập:</label>
                                    <div className="action-row">
                                        <select 
                                            className="topic-select"
                                            value={selectedExamId}
                                            onChange={(e) => setSelectedExamId(e.target.value)}
                                            disabled={!selectedTopicId}
                                        >
                                            <option value="">-- Chọn bài tập --</option>
                                            {filteredExams.length > 0 ? (
                                                filteredExams.map(ex => (
                                                    <option key={ex.id} value={ex.id}>
                                                        📄 {ex.title} ({ex.duration} phút)
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>Không có bài tập nào</option>
                                            )}
                                        </select>
                                        
                                        <button 
                                            className="btn-assign" 
                                            onClick={handleAssignExam}
                                            disabled={!selectedExamId}
                                        >
                                            GIAO BÀI
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="assignment-list">
                        {classroom.assignments && classroom.assignments.length > 0 ? (
                            classroom.assignments.map((assign, index) => (
                                // 🔥 [MỚI] Thêm onClick để chuyển hướng khi bấm vào thẻ
                                <div 
                                    key={index} 
                                    className="stream-card"
                                    onClick={() => handleOpenExam(assign.exam)} 
                                    title="Nhấn để làm bài"
                                >
                                    <div className="card-icon">
                                        <AssignmentIcon sx={{ color: 'white' }} />
                                    </div>
                                    <div className="card-content">
                                        <h4 className="card-title">
                                            Giáo viên đã đăng bài tập: 
                                            <span className="topic-highlight"> {assign.exam_title}</span>
                                        </h4>
                                        <p className="sub-info">Chuyên đề: {assign.topic_title} ({assign.exam_duration} phút)</p>
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

        {activeTab === 'members' && (
            <div className="members-layout">
                {/* (Giữ nguyên phần Members cũ của bạn) */}
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
                        <span className="student-count">{members.length} sinh viên</span>
                    </div>
                    <div className="divider"></div>
                </div>
                
                {members.length > 0 ? (
                    <div className="student-list">
                         {members.map(mem => (
                            <div key={mem.id} className="member-row">
                                <div className="member-left" style={{display: 'flex', alignItems: 'center'}}>
                                    <div className="member-avatar" style={{marginRight: '15px'}}>
                                        {mem.student_avatar}
                                    </div>
                                    <div>
                                        <div className="member-name">{mem.student_name}</div>
                                        <div style={{fontSize: '0.8rem', color: '#888'}}>{mem.student_email}</div>
                                    </div>
                                </div>
                                {isTeacher && (
                                    <Tooltip title="Xóa khỏi lớp">
                                        <IconButton size="small">
                                            <PersonRemoveIcon fontSize="small" color="disabled"/>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-members">
                        <GroupIcon sx={{ fontSize: 60, color: '#ddd' }}/>
                        <p>Chưa có học sinh nào tham gia lớp học.</p>
                    </div>
                )}
            </div>
        )}

      </div>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        TransitionComponent={TransitionDown}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            variant="filled"
            sx={{ width: '100%', fontSize: '1rem', boxShadow: 3 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default ClassDetail;