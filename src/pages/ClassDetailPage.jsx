import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AssessmentIcon from '@mui/icons-material/Assessment'; 
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload'; 
import ForumIcon from '@mui/icons-material/Forum'; 
import SendIcon from '@mui/icons-material/Send';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay'; // 🟢 Icon Đặt lại

import { Snackbar, Alert, Slide, IconButton, Tooltip, CircularProgress, Box, Typography, Paper, TextField, Button, Switch, FormControlLabel, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import './ClassDetail.css';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [classroom, setClassroom] = useState(null);
  const [topics, setTopics] = useState([]); 
  const [members, setMembers] = useState([]);
  const [reportData, setReportData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stream'); 
  const [currentUser, setCurrentUser] = useState(null);

  const [examSource, setExamSource] = useState('system');

  const [selectedGrade, setSelectedGrade] = useState('12'); 
  const [filteredTopics, setFilteredTopics] = useState([]); 
  const [selectedTopicId, setSelectedTopicId] = useState(''); 
  
  const [examFolders, setExamFolders] = useState([]);
  const [selectedExamFolderId, setSelectedExamFolderId] = useState('');
  const [personalExams, setPersonalExams] = useState([]);

  const [filteredExams, setFilteredExams] = useState([]);   
  const [selectedExamId, setSelectedExamId] = useState(''); 

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
      start_time: '', end_time: '', point_mcq: 0.25, point_short: 0.5,
      point_tf_4: 1.0, point_tf_3: 0.5, point_tf_2: 0.25, point_tf_1: 0.1
  });

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [chatImagePreview, setChatImagePreview] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const [notification, setNotification] = useState({
    open: false, message: '', severity: 'success'
  });

  const [deleteAssignConfirm, setDeleteAssignConfirm] = useState({ open: false, assignId: null });

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (activeTab === 'grades' && currentUser?.id === classroom?.teacher) fetchReport();
    if (activeTab === 'chat') fetchMessages();
  }, [activeTab]);

  useEffect(() => {
      if (activeTab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  useEffect(() => {
    if (Array.isArray(topics) && topics.length > 0) {
        const gradeNum = parseInt(selectedGrade);
        setFilteredTopics(topics.filter(t => t.grade === gradeNum));
        setSelectedTopicId('');
        setFilteredExams([]);
        setSelectedExamId('');
    }
  }, [selectedGrade, topics]);

  useEffect(() => {
    if (selectedTopicId) {
        const topic = (Array.isArray(topics) ? topics : []).find(t => t.id === parseInt(selectedTopicId));
        setFilteredExams(topic && Array.isArray(topic.exercises) ? topic.exercises : []);
    } else {
        setFilteredExams([]);
    }
    setSelectedExamId('');
  }, [selectedTopicId, topics]);

  useEffect(() => {
      if (examSource === 'personal') {
          const fetchPersonalExams = async () => {
              try {
                  const folderQuery = selectedExamFolderId ? `folder=${selectedExamFolderId}&` : '';
                  const res = await axiosClient.get(`/exams/?${folderQuery}is_public=false`);
                  setPersonalExams(Array.isArray(res.data) ? res.data : (res.data?.results || []));
              } catch (error) {
                  console.error("Lỗi tải đề cá nhân", error);
              }
          };
          fetchPersonalExams();
      }
  }, [examSource, selectedExamFolderId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await axiosClient.get('/user/me/');
      setCurrentUser(userRes.data);

      const classRes = await axiosClient.get(`/classrooms/${id}/`);
      setClassroom(classRes.data);

      const membersRes = await axiosClient.get(`/classrooms/${id}/members/`);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);

      const topicRes = await axiosClient.get('/topics/');
      setTopics(Array.isArray(topicRes.data) ? topicRes.data : (topicRes.data?.results || []));

      if (userRes.data.id === classRes.data.teacher) {
          const folderRes = await axiosClient.get('/exam-folders/');
          setExamFolders(Array.isArray(folderRes.data) ? folderRes.data : []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Lỗi:", error);
      setLoading(false);
    }
  };

  const fetchReport = async () => {
      try {
          const res = await axiosClient.get(`/classrooms/${id}/report/`);
          setReportData(Array.isArray(res.data) ? res.data : []);
      } catch (error) { console.error("Lỗi tải báo cáo:", error); }
  };

  const fetchMessages = async () => {
      try {
          const res = await axiosClient.get(`/classrooms/${id}/chat/`);
          setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (error) { setMessages([]); }
  };

  const handleImageSelect = (e) => {
      const file = e.target.files[0];
      if (file) { setChatImage(file); setChatImagePreview(URL.createObjectURL(file)); }
  };

  const handleRemoveImage = () => {
      setChatImage(null); setChatImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSendMessage = async () => {
      if (!newMessage.trim() && !chatImage) return;
      setSendingMsg(true);
      const formData = new FormData();
      formData.append('content', newMessage);
      if (chatImage) formData.append('image', chatImage);

      try {
          const res = await axiosClient.post(`/classrooms/${id}/chat/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          setMessages([...(Array.isArray(messages) ? messages : []), res.data]);
          setNewMessage(''); handleRemoveImage();
      } catch (error) { showNotification("Lỗi khi gửi tin nhắn", "error"); } 
      finally { setSendingMsg(false); }
  };

  const handleDeleteMessage = async (msgId) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này không?")) return;
      try {
          await axiosClient.delete(`/classrooms/chat/${msgId}/delete/`);
          setMessages((Array.isArray(messages) ? messages : []).filter(m => m.id !== msgId));
          showNotification("Đã xóa tin nhắn", "success");
      } catch (error) { showNotification("Lỗi khi xóa tin nhắn", "error"); }
  };

  const showNotification = (msg, type = 'success') => setNotification({ open: true, message: msg, severity: type });
  const handleCloseNotification = (e, reason) => { if (reason !== 'clickaway') setNotification({ ...notification, open: false }); };
  const handleCopyCode = () => {
    if (classroom?.invite_code) {
        navigator.clipboard.writeText(classroom.invite_code);
        showNotification(`Đã sao chép mã lớp: ${classroom.invite_code}`, 'success');
    }
  };

  const handleAssignExam = async () => {
    if (!selectedExamId) { showNotification("Vui lòng chọn một đề thi cụ thể!", "warning"); return; }
    
    if (showAdvanced && advancedSettings.start_time && advancedSettings.end_time) {
        const startDate = new Date(advancedSettings.start_time);
        const endDate = new Date(advancedSettings.end_time);

        if (startDate >= endDate) {
            showNotification("⚠️ Lỗi: Hạn chót nộp bài phải diễn ra sau Thời gian mở đề!", "error");
            return;
        }
    }

    try {
      const payload = { classroom: id, exam: selectedExamId };
      if (showAdvanced) {
          if (advancedSettings.start_time) payload.start_time = new Date(advancedSettings.start_time).toISOString();
          if (advancedSettings.end_time) payload.end_time = new Date(advancedSettings.end_time).toISOString();
          payload.point_mcq = parseFloat(advancedSettings.point_mcq);
          payload.point_short = parseFloat(advancedSettings.point_short);
          payload.point_tf_4 = parseFloat(advancedSettings.point_tf_4);
          payload.point_tf_3 = parseFloat(advancedSettings.point_tf_3);
          payload.point_tf_2 = parseFloat(advancedSettings.point_tf_2);
          payload.point_tf_1 = parseFloat(advancedSettings.point_tf_1);
      }
      await axiosClient.post('/class_assignments/', payload);
      showNotification("✅ Giao bài thành công!", "success");
      fetchData(); setSelectedExamId(''); setShowAdvanced(false); 
    } catch (error) {
        let msg = "❌ Có lỗi xảy ra";
        const data = error.response?.data;
        if (data) {
            if (data.message) msg = "⚠️ " + data.message;
            else if (data.non_field_errors) msg = "⚠️ Bài tập này đã có trong lớp rồi!";
            else if (data.exam) msg = "⚠️ Lỗi đề thi: " + data.exam[0];
            else msg = "❌ Lỗi: " + JSON.stringify(data);
        } else msg = "❌ Lỗi kết nối Server";
        showNotification(msg, "error");
    }
  };

  const confirmDeleteAssignment = async () => {
      const assignId = deleteAssignConfirm.assignId;
      setDeleteAssignConfirm({ open: false, assignId: null });
      try {
          await axiosClient.delete(`/class_assignments/${assignId}/`);
          showNotification("✅ Đã thu hồi bài tập khỏi lớp!", "success");
          fetchData(); 
      } catch (error) {
          showNotification("❌ Lỗi khi thu hồi bài tập!", "error");
      }
  };

  const handleOpenExam = (examId) => navigate(`/exams/${examId}?classroom_id=${id}`); 
  const handleViewResult = (resultId) => navigate(`/history/${resultId}`);
  const handleDownloadExcel = async () => {
    try {
        const response = await axiosClient.get(`/classrooms/${id}/export-excel/`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a'); link.href = url;
        link.setAttribute('download', `Bang_Diem_Lop_${classroom?.name || 'Class'}.xlsx`);
        document.body.appendChild(link); link.click(); link.parentNode.removeChild(link); window.URL.revokeObjectURL(url);
        showNotification("✅ Tải xuống thành công!", "success");
    } catch (error) { showNotification("❌ Không thể tải file Excel. Vui lòng thử lại.", "error"); }
  };

  const handleAdvancedChange = (field, value) => setAdvancedSettings(prev => ({ ...prev, [field]: value }));

  if (loading) return <div className="loading-screen">Đang tải dữ liệu lớp học...</div>;
  if (!classroom) return <div className="error-screen">Không tìm thấy lớp học 😔</div>;

  const isTeacher = currentUser?.id === classroom.teacher; 
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="class-detail-container">
      <div className="class-banner">
        <div className="banner-content">
          <h1 className="banner-title">{classroom.name}</h1>
          <p className="banner-subtitle">Khối {classroom.grade} • {classroom.program_type === 'gifted' ? 'Bồi dưỡng' : 'Cơ bản'}</p>
          <p className="teacher-name">GVCN: <strong>{classroom.teacher_name}</strong></p>
        </div>
        <div className="class-code-box" onClick={handleCopyCode} title="Bấm để sao chép">
            <span className="code-label">Mã lớp</span>
            <div className="code-value">{classroom.invite_code} <ContentCopyIcon fontSize="small" style={{marginLeft: 5}}/></div>
        </div>
      </div>

      <div className="class-nav">
        <button className={`nav-item ${activeTab === 'stream' ? 'active' : ''}`} onClick={() => setActiveTab('stream')}>Bảng tin & Bài tập</button>
        <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>Thảo luận chung</button>
        <button className={`nav-item ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Thành viên ({Array.isArray(members) ? members.length : 0})</button>
        {isTeacher && <button className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>Bảng điểm</button>}
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
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <Box sx={{ bgcolor: '#f1f2f6', borderRadius: 10, p: 0.5, display: 'inline-flex' }}>
                                    <Button onClick={() => { setExamSource('system'); setSelectedExamId(''); }} sx={{ borderRadius: 10, px: 3, py: 1, fontWeight: 'bold', bgcolor: examSource === 'system' ? '#4a148c' : 'transparent', color: examSource === 'system' ? 'white' : '#333' }}>🏫 Ngân hàng Hệ thống</Button>
                                    <Button onClick={() => { setExamSource('personal'); setSelectedExamId(''); }} sx={{ borderRadius: 10, px: 3, py: 1, fontWeight: 'bold', bgcolor: examSource === 'personal' ? '#e67e22' : 'transparent', color: examSource === 'personal' ? 'white' : '#333' }}>🎒 Kho Đề Cá Nhân</Button>
                                </Box>
                            </Box>

                            <div className="assign-filter-container">
                                {examSource === 'system' ? (
                                    <>
                                        <div className="filter-item">
                                            <label>1. Chọn Khối:</label>
                                            <select className="topic-select" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
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
                                            <select className="topic-select" value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} disabled={filteredTopics.length === 0}>
                                                <option value="">-- Chọn chuyên đề --</option>
                                                {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="filter-item full-width">
                                            <label>3. Chọn Đề thi / Bài tập:</label>
                                            <select className="topic-select" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} disabled={!selectedTopicId}>
                                                <option value="">-- Chọn bài tập --</option>
                                                {filteredExams.length > 0 ? filteredExams.map(ex => <option key={ex.id} value={ex.id}>📄 {ex.title} ({ex.duration} phút)</option>) : <option disabled>Không có bài tập nào</option>}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="filter-item">
                                            <label>1. Lọc theo Thư mục cá nhân:</label>
                                            <select className="topic-select" value={selectedExamFolderId} onChange={(e) => setSelectedExamFolderId(e.target.value)}>
                                                <option value="">-- Tất cả đề cá nhân --</option>
                                                {examFolders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="filter-item full-width">
                                            <label>2. Chọn Đề thi / Bài tập cá nhân:</label>
                                            <select className="topic-select" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                                                <option value="">-- Chọn bài tập --</option>
                                                {personalExams.length > 0 ? personalExams.map(ex => <option key={ex.id} value={ex.id}>📄 {ex.title} ({ex.duration} phút)</option>) : <option disabled>Không có bài tập nào</option>}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <FormControlLabel control={<Switch checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} color="primary" />} label={<Typography fontWeight="bold" color="primary">Cài đặt nâng cao (Thời gian & Thang điểm)</Typography>} />
                                {showAdvanced && (
                                    <Box sx={{ mt: 2 }}>
                                        {/* 🟢 NÚT HỦY THỜI GIAN ĐƯỢC ĐẶT Ở ĐÂY (Chỉ hiện khi đã chọn giờ) */}
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="subtitle2" color="textSecondary">⏰ Cài đặt Thời gian</Typography>
                                            {(advancedSettings.start_time || advancedSettings.end_time) && (
                                                <Button size="small" color="error" startIcon={<ReplayIcon fontSize="small"/>} onClick={() => setAdvancedSettings(prev => ({...prev, start_time: '', end_time: ''}))}>
                                                    Hủy thời gian
                                                </Button>
                                            )}
                                        </Box>
                                        
                                        <Grid container spacing={2} mb={3}>
                                            <Grid item xs={12} sm={6}><TextField fullWidth type="datetime-local" label="Thời gian mở đề (Bỏ trống = Mở ngay)" InputLabelProps={{ shrink: true }} value={advancedSettings.start_time} onChange={(e) => handleAdvancedChange('start_time', e.target.value)} size="small" /></Grid>
                                            <Grid item xs={12} sm={6}><TextField fullWidth type="datetime-local" label="Hạn chót nộp bài (Bỏ trống = Không giới hạn)" InputLabelProps={{ shrink: true }} value={advancedSettings.end_time} onChange={(e) => handleAdvancedChange('end_time', e.target.value)} size="small" /></Grid>
                                        </Grid>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" color="textSecondary" mb={1}>🎯 Tùy chỉnh Thang điểm</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Trắc nghiệm (1 câu)" inputProps={{ step: "0.1" }} value={advancedSettings.point_mcq} onChange={(e) => handleAdvancedChange('point_mcq', e.target.value)} size="small" /></Grid>
                                            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Trả lời ngắn (1 câu)" inputProps={{ step: "0.1" }} value={advancedSettings.point_short} onChange={(e) => handleAdvancedChange('point_short', e.target.value)} size="small" /></Grid>
                                            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Đ/S (Đúng 4 ý)" inputProps={{ step: "0.1" }} value={advancedSettings.point_tf_4} onChange={(e) => handleAdvancedChange('point_tf_4', e.target.value)} size="small" color="success" focused/></Grid>
                                            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Đ/S (Đúng 3 ý)" inputProps={{ step: "0.1" }} value={advancedSettings.point_tf_3} onChange={(e) => handleAdvancedChange('point_tf_3', e.target.value)} size="small" /></Grid>
                                            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Đ/S (Đúng 2 ý)" inputProps={{ step: "0.1" }} value={advancedSettings.point_tf_2} onChange={(e) => handleAdvancedChange('point_tf_2', e.target.value)} size="small" /></Grid>
                                            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Đ/S (Đúng 1 ý)" inputProps={{ step: "0.1" }} value={advancedSettings.point_tf_1} onChange={(e) => handleAdvancedChange('point_tf_1', e.target.value)} size="small" /></Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ mt: 3, textAlign: 'right' }}>
                                <Button variant="contained" color="primary" onClick={handleAssignExam} disabled={!selectedExamId} size="large" sx={{ px: 4, py: 1.5, borderRadius: 5, fontWeight: 'bold' }}>
                                    GIAO BÀI TẬP NÀY
                                </Button>
                            </Box>
                        </div>
                    )}

                    <div className="assignment-list">
                        {Array.isArray(classroom.assignments) && classroom.assignments.length > 0 ? (
                            classroom.assignments.map((assign, index) => (
                                <div key={index} className="stream-card" onClick={() => handleOpenExam(assign.exam)} title="Nhấn để làm bài" style={{ position: 'relative' }}>
                                    <div className="card-icon"><AssignmentIcon sx={{ color: 'white' }} /></div>
                                    <div className="card-content" style={{ flex: 1 }}>
                                        <h4 className="card-title">Giáo viên đã đăng bài tập: <span className="topic-highlight"> {assign.exam_title}</span></h4>
                                        <p className="sub-info">Chuyên đề: {assign.topic_title || "Cá nhân"} ({assign.exam_duration} phút)</p>
                                        <p className="card-date">
                                            Đăng ngày: {new Date(assign.created_at).toLocaleDateString('vi-VN')}
                                            {assign.end_time && (
                                                <span style={{color: '#e74c3c', fontWeight: 'bold', marginLeft: '10px'}}>
                                                    ⏳ Hạn nộp: {new Date(assign.end_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} {new Date(assign.end_time).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    
                                    {isTeacher && (
                                        <Tooltip title="Thu hồi bài tập khỏi lớp">
                                            <IconButton 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    setDeleteAssignConfirm({ open: true, assignId: assign.id });
                                                }}
                                                sx={{ color: '#e74c3c', '&:hover': { bgcolor: '#fdeaea' } }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
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

        {activeTab === 'chat' && (
            <div className="chat-layout" style={{ display: 'flex', flexDirection: 'column', height: '600px', backgroundColor: '#f0f2f5', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    {safeMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '100px', color: '#888' }}>
                            <ForumIcon sx={{ fontSize: 60, color: '#ccc' }} />
                            <p>Chưa có tin nhắn nào. Hãy gửi lời chào đến cả lớp!</p>
                        </div>
                    ) : (
                        safeMessages.map((msg) => {
                            const isMine = msg.sender_id === currentUser?.id;
                            const canDelete = isTeacher || isMine;

                            return (
                                <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: msg.is_teacher ? '#d35400' : 'gray', fontWeight: msg.is_teacher ? 'bold' : 'normal', mb: 0.5, px: 1 }}>
                                        {msg.is_teacher ? '👨‍🏫 Giáo viên' : msg.sender_name}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                                        <Paper elevation={1} sx={{ p: 1.5, maxWidth: '70%', bgcolor: isMine ? '#dcf8c6' : 'white', border: msg.is_teacher && !isMine ? '2px solid #f39c12' : 'none', borderRadius: isMine ? '15px 0px 15px 15px' : '0px 15px 15px 15px' }}>
                                            {msg.image && <img src={msg.image} alt="Đính kèm" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: msg.content ? '10px' : '0', cursor: 'pointer' }} onClick={() => window.open(msg.image, '_blank')} />}
                                            {msg.content && <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</Typography>}
                                        </Paper>
                                        {canDelete && (
                                            <Tooltip title="Xóa tin nhắn">
                                                <IconButton size="small" onClick={() => handleDeleteMessage(msg.id)} sx={{ color: '#e74c3c', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#bbb', mt: 0.5, px: 1, fontSize: '0.7rem' }}>
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </Typography>
                                </Box>
                            );
                        })
                    )}
                    <div ref={chatEndRef} />
                </div>
                {chatImagePreview && (
                    <Box sx={{ p: 2, bgcolor: '#e0e0e0', borderTop: '1px solid #ccc', position: 'relative' }}>
                        <img src={chatImagePreview} alt="Preview" style={{ height: '80px', borderRadius: '5px' }} />
                        <IconButton size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }} onClick={handleRemoveImage}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
                    <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageSelect} />
                    <Tooltip title="Đính kèm ảnh bài tập"><IconButton color="primary" sx={{ mr: 1 }} onClick={() => fileInputRef.current?.click()} disabled={sendingMsg}><AddPhotoAlternateIcon /></IconButton></Tooltip>
                    <TextField fullWidth size="small" placeholder="Nhập nội dung thảo luận hoặc hỏi bài..." variant="outlined" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} disabled={sendingMsg} sx={{ bgcolor: '#f9f9f9', borderRadius: '20px', '& fieldset': { border: 'none' } }} />
                    <Button variant="contained" color="primary" endIcon={sendingMsg ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} onClick={handleSendMessage} disabled={sendingMsg || (!newMessage.trim() && !chatImage)} sx={{ ml: 2, borderRadius: '20px', px: 3 }}>Gửi</Button>
                </Box>
            </div>
        )}

        {activeTab === 'members' && (
            <div className="members-layout">
                <div className="section-header"><h2 className="section-title">Giáo viên</h2><div className="divider"></div></div>
                <div className="member-row teacher-row">
                    <div className="member-avatar teacher-avatar">{classroom?.teacher_name ? classroom.teacher_name.charAt(0) : 'G'}</div>
                    <span className="member-name">{classroom?.teacher_name || 'Giáo viên'}</span>
                </div>
                <div className="section-header" style={{marginTop: '40px'}}><div className="title-row"><h2 className="section-title">Học sinh</h2><span className="student-count">{Array.isArray(members) ? members.length : 0} sinh viên</span></div><div className="divider"></div></div>
                {Array.isArray(members) && members.length > 0 ? (
                    <div className="student-list">
                         {members.map(mem => (
                            <div key={mem.id} className="member-row">
                                <div className="member-left" style={{display: 'flex', alignItems: 'center'}}>
                                    <div className="member-avatar" style={{marginRight: '15px'}}>{mem?.student_name ? mem.student_name.charAt(0) : 'H'}</div>
                                    <div><div className="member-name">{mem?.student_name || 'Học sinh'}</div><div style={{fontSize: '0.8rem', color: '#888'}}>{mem?.student_email}</div></div>
                                </div>
                                {isTeacher && <Tooltip title="Xóa khỏi lớp"><IconButton size="small"><PersonRemoveIcon fontSize="small" color="disabled"/></IconButton></Tooltip>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-members"><GroupIcon sx={{ fontSize: 60, color: '#ddd' }}/><p>Chưa có học sinh nào tham gia lớp học.</p></div>
                )}
            </div>
        )}

        {activeTab === 'grades' && isTeacher && (
            <div className="grades-layout">
                <div className="section-header">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <div><h2 className="section-title">Bảng điểm lớp học</h2><p className="grades-subtitle">Kết quả các bài tập đã giao ({Array.isArray(reportData) ? reportData.length : 0} học sinh)</p></div>
                        <button className="btn-assign" onClick={handleDownloadExcel} style={{backgroundColor: '#28a745', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem'}}><FileDownloadIcon fontSize="small"/> Xuất Excel</button>
                    </div>
                    <div className="divider"></div>
                </div>
                {Array.isArray(reportData) && reportData.length > 0 ? (
                    <div className="grades-container">
                        {reportData.map((student) => (
                            <div key={student.student_id} className="student-grade-card">
                                <div className="student-header">
                                    <div className="student-info">
                                        <div className="member-avatar">{student?.student_name ? student.student_name.charAt(0) : 'H'}</div>
                                        <div><span className="student-name-bold">{student?.student_name}</span><span className="student-username"> ({student?.username})</span></div>
                                    </div>
                                    <div className="score-summary">Đã làm: <strong>{Array.isArray(student.results) ? student.results.length : 0}</strong> bài</div>
                                </div>
                                {Array.isArray(student.results) && student.results.length > 0 ? (
                                    <table className="grade-table">
                                        <thead><tr><th>Bài tập / Đề thi</th><th>Chuyên đề</th><th>Ngày làm</th><th>Điểm số</th><th>Chi tiết</th></tr></thead>
                                        <tbody>
                                            {student.results.map((res, idx) => (
                                                <tr key={idx} className="grade-row-clickable" onClick={() => handleViewResult(res.id)}>
                                                    <td>{res.exam_title}</td><td>{res.topic_title}</td>
                                                    <td>{new Date(res.date).toLocaleDateString('vi-VN')} {new Date(res.date).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</td>
                                                    <td><span className={`score-badge ${res.score >= 5 ? 'pass' : 'fail'}`}>{res.score}</span></td>
                                                    <td><VisibilityIcon fontSize="small" color="action"/></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="no-grade-text">Học sinh này chưa làm bài tập nào.</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-stream"><AssessmentIcon sx={{ fontSize: 60, color: '#ddd' }}/><p>Chưa có dữ liệu điểm số nào.</p></div>
                )}
            </div>
        )}
      </div>

      <Dialog open={deleteAssignConfirm.open} onClose={() => setDeleteAssignConfirm({ open: false, assignId: null })} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#e74c3c' }}>⚠️ Xác nhận thu hồi</DialogTitle>
          <DialogContent>
              <Typography>Bạn có chắc chắn muốn thu hồi bài tập này khỏi lớp không?</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>(Đề thi gốc vẫn được giữ nguyên trong Kho đề của bạn)</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDeleteAssignConfirm({ open: false, assignId: null })} color="inherit">Hủy</Button>
              <Button onClick={confirmDeleteAssignment} variant="contained" color="error">Thu hồi</Button>
          </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleCloseNotification} TransitionComponent={TransitionDown} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%', fontSize: '1rem', boxShadow: 3 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ClassDetail;