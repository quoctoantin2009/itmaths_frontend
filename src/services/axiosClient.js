import axios from 'axios';

// =================================================================
// 💡 MẸO THÔNG MINH (Smart Auto-Switch)
// =================================================================
// Kiểm tra xem Web đang chạy ở chế độ nào:
// - True: Nếu đang chạy trên mạng (Production/Build)
// - False: Nếu đang chạy code dưới máy (Development)
const isProduction = import.meta.env.PROD; 

// Tự động chọn đường dẫn phù hợp
// [QUAN TRỌNG] Vẫn giữ đuôi /api như bạn yêu cầu
const baseURL = isProduction 
  ? 'https://api.itmaths.vn/api'   // ☁️ Khi lên mạng dùng link này
  : 'http://127.0.0.1:8000/api';   // 💻 Khi ở nhà dùng link này

console.log("🌏 API đang kết nối tới:", baseURL); 
// =================================================================

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log lỗi ra Console để kiểm tra
    console.error("❌ Lỗi API:", error.config?.url, error.response?.status);
    throw error;
  }
);

export default axiosClient;