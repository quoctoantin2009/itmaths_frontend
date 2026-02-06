import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classroomService from '../services/classroomService';
import axiosClient from '../services/axiosClient';

// 👉 [QUAN TRỌNG] Import file CSS vừa tạo
import './ClassroomPage.css';

const ClassroomPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State cho Form tạo lớp
  const [showForm, setShowForm] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', grade: '12', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Lấy thông tin user
      const userRes = await axiosClient.get('/user/me/');
      setCurrentUser(userRes.data);

      // 2. Lấy danh sách lớp
      const classRes = await classroomService.getAll();
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
      await classroomService.create(newClass);
      alert("✅ Tạo lớp thành công!");
      setShowForm(false);
      setNewClass({ name: '', grade: '12', description: '' });
      fetchData(); 
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.error || "Không thể tạo lớp"));
    }
  };

  const handleJoinClass = async () => {
    const code = prompt("Nhập mã lớp (Invite Code) do giáo viên cung cấp:");
    if (!code) return;
    try {
      await classroomService.join(code);
      alert("✅ Tham gia lớp thành công!");
      fetchData();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Mã lớp không đúng"));
    }
  };

  if (loading) return <div className="loading-text">Đang tải danh sách lớp...</div>;

  const isTeacher = currentUser?.profile_occupation === 'teacher' || currentUser?.occupation === 'teacher';

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

      {/* FORM TẠO LỚP (Hiện ra khi bấm nút) */}
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

      {/* DANH SÁCH LỚP HỌC (GRID) */}
      {classes.length > 0 ? (
        <div className="class-grid">
          {classes.map(cls => (
            <div 
              key={cls.id} 
              onClick={() => navigate(`/classrooms/${cls.id}`)}
              className="class-card"
            >
              {/* Phần Banner Màu Sắc */}
              <div className="card-banner">
                <h2 className="class-name">{cls.name}</h2>
                <p className="class-grade">Khối {cls.grade}</p>
                <div className="teacher-badge">{cls.teacher_name}</div>
              </div>

              {/* Phần Nội Dung */}
              <div className="card-body">
                <p className="class-desc">
                  {cls.description || "Chưa có mô tả."}
                </p>
                
                <div className="card-footer">
                  <span>👥 {cls.member_count || 0} thành viên</span>
                  <span className="access-link">Truy cập &rarr;</span>
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
    </div>
  );
};

export default ClassroomPage;