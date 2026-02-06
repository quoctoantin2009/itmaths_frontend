import axios from 'axios';

// [CẤU HÌNH CHUẨN] Luôn trỏ về Server Online
// Đảm bảo không có dấu / ở cuối để dễ nối chuỗi
const baseURL = 'https://api.itmaths.vn/api';

console.log("🌏 API đang kết nối tới:", baseURL); 

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token vào mỗi yêu cầu
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi chung (để debug dễ hơn)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Lỗi API:", error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default axiosClient;