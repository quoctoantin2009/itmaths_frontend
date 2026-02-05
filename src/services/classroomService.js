import axiosClient from "./axiosClient";

const classroomService = {
  // Lấy danh sách lớp
  getAll: () => axiosClient.get('/classrooms/'),
  
  // Lấy chi tiết 1 lớp
  get: (id) => axiosClient.get(`/classrooms/${id}/`),
  
  // Tạo lớp mới
  create: (data) => axiosClient.post('/classrooms/', data),
  
  // Tham gia lớp (cho HS)
  join: (code) => axiosClient.post('/classrooms/join/', { invite_code: code }),

  // Lấy thành viên
  getMembers: (id) => axiosClient.get(`/classrooms/${id}/members/`),
  
  // Giao bài (cho GV)
  assignTopic: (id, topicId) => axiosClient.post(`/classrooms/${id}/assign_topic/`, { topic_id: topicId }),
  
  // Xem báo cáo điểm
  getReport: (id) => axiosClient.get(`/classrooms/${id}/report/`),
};

export default classroomService;