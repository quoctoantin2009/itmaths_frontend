import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classroomService from '../services/classroomService';
import axiosClient from '../services/axiosClient';

const ClassDetailPage = () => {
  const { id } = useParams(); // Lấy ID lớp từ URL
  const navigate = useNavigate();
  
  const [classroom, setClassroom] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('stream'); // stream | members | grades
  const [loading, setLoading] = useState(true);

  // State cho giáo viên giao bài
  const [topicId, setTopicId] = useState('');
  const [topics, setTopics] = useState([]); // Danh sách chuyên đề để chọn

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Lấy thông tin user
      const userRes = await axiosClient.get('/user/me/');
      setCurrentUser(userRes.data);

      // 2. Lấy thông tin lớp
      const classRes = await classroomService.get(id);
      setClassroom(classRes.data);

      // 3. Lấy thành viên
      const memRes = await classroomService.getMembers(id);
      setMembers(memRes.data);

      // 4. Nếu là GV -> Lấy thêm danh sách chuyên đề để giao
      if (userRes.data.profile_occupation === 'teacher' || userRes.data.occupation === 'teacher') {
        const topicRes = await axiosClient.get('/topics/');
        setTopics(topicRes.data);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("Không thể truy cập lớp học này.");
      navigate('/classrooms');
    }
  };

  const handleAssignTopic = async () => {
    if (!topicId) return alert("Vui lòng chọn chuyên đề!");
    try {
      await classroomService.assignTopic(id, topicId);
      alert("✅ Đã giao bài thành công!");
      fetchData(); // Load lại để hiện bài vừa giao
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể giao bài"));
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu lớp học...</div>;
  if (!classroom) return null;

  const isTeacher = currentUser?.id === classroom.teacher; // Kiểm tra có phải GV của lớp này không

  return (
    <div className="container mx-auto p-4 min-h-screen max-w-5xl">
      {/* HEADER LỚP HỌC */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">{classroom.name}</h1>
          <p className="opacity-90 mt-1">Khối {classroom.grade} • {classroom.program_type === 'standard' ? 'Cơ bản' : 'Nâng cao'}</p>
          <div className="mt-4 flex gap-4">
             <span className="bg-white/20 px-3 py-1 rounded text-sm">
                GV: {classroom.teacher_name}
             </span>
             <span className="bg-white/20 px-3 py-1 rounded text-sm">
                Mã lớp: <strong>{classroom.invite_code}</strong>
             </span>
          </div>
        </div>
      </div>

      {/* THANH MENU (TAB) */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-6 py-3 font-medium ${activeTab === 'stream' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stream')}
        >
          📚 Bài tập & Bảng tin
        </button>
        <button 
          className={`px-6 py-3 font-medium ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Thành viên ({members.length})
        </button>
        {isTeacher && (
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'grades' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('grades')}
          >
            📊 Báo cáo điểm
          </button>
        )}
      </div>

      {/* NỘI DUNG TAB */}
      
      {/* 1. TAB BÀI TẬP */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
             <h3 className="font-bold text-lg text-gray-700">Bài tập đã giao</h3>
             {classroom.assignments && classroom.assignments.length > 0 ? (
               classroom.assignments.map((assign) => (
                 <div key={assign.id} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">📝</div>
                      <div>
                        <h4 className="font-bold">{assign.topic_title}</h4>
                        <p className="text-xs text-gray-500">Đã giao: {new Date(assign.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/exams?topic=${assign.topic}`)}
                      className="text-blue-600 font-medium text-sm hover:underline"
                    >
                      Làm bài ngay &rarr;
                    </button>
                 </div>
               ))
             ) : (
               <p className="text-gray-500 italic">Chưa có bài tập nào được giao.</p>
             )}
          </div>

          {/* Cột bên phải: Chỉ hiện cho GV để giao bài */}
          {isTeacher && (
            <div className="bg-gray-50 p-4 rounded-lg border h-fit">
              <h3 className="font-bold text-gray-800 mb-3">Giao bài mới</h3>
              <select 
                className="w-full p-2 border rounded mb-3"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">-- Chọn chuyên đề --</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title} (Khối {t.grade})</option>
                ))}
              </select>
              <button onClick={handleAssignTopic} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
                + GIAO CHO LỚP
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. TAB THÀNH VIÊN */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {members.map(mem => (
                <tr key={mem.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{mem.student_name}</td>
                  <td className="p-4 text-gray-600">{mem.student_username}</td>
                  <td className="p-4 text-gray-500">{new Date(mem.joined_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. TAB BÁO CÁO (CHỈ GV) */}
      {activeTab === 'grades' && isTeacher && (
        <ReportView classId={id} />
      )}
    </div>
  );
};

// Component con để xem báo cáo điểm (Tách ra cho gọn)
const ReportView = ({ classId }) => {
  const [report, setReport] = useState([]);
  
  useEffect(() => {
    classroomService.getReport(classId).then(res => setReport(res.data));
  }, [classId]);

  return (
    <div className="space-y-6">
      {report.map(student => (
        <div key={student.student_id} className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-bold text-lg text-blue-800 mb-2">👤 {student.student_name}</h4>
          {student.results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                   <tr className="text-gray-500 border-b">
                     <th className="text-left py-2">Bài thi</th>
                     <th className="text-left py-2">Điểm số</th>
                     <th className="text-left py-2">Ngày làm</th>
                   </tr>
                </thead>
                <tbody>
                  {student.results.map((res, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2">{res.exam_title}</td>
                      <td className="py-2 font-bold text-red-600">{res.score} đ</td>
                      <td className="py-2 text-gray-500">{new Date(res.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Chưa làm bài tập nào.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClassDetailPage;