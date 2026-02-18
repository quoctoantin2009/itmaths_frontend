import React, { useEffect, useState } from 'react';
import axiosClient from '../services/axiosClient'; // ✅ Giữ nguyên axiosClient

// --- Danh sách tỉnh ---
const VIETNAM_PROVINCES = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", 
    "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", 
    "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", 
    "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", 
    "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", 
    "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", 
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", 
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", 
    "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", 
    "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    occupation: 'student', 
    school_name: '',
    actual_class: '',
    province: '' // ✅ Thêm trường province
  });
  const [message, setMessage] = useState('');

  // 1. Lấy dữ liệu hiện tại
  useEffect(() => {
    axiosClient.get('/user/me/').then(res => {
      const data = res.data;
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.profile_phone || '',
        occupation: data.profile_occupation || 'student',
        school_name: data.profile_school_name || '',
        actual_class: data.profile_actual_class || '',
        province: data.profile_province || data.province || '' // ✅ Map dữ liệu tỉnh
      });
    });
  }, []);

  // 2. Xử lý lưu
  const handleSave = async () => {
    try {
      await axiosClient.put('/user/me/', formData);
      setMessage('✅ Cập nhật hồ sơ thành công!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage('❌ Lỗi cập nhật.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Hồ sơ cá nhân</h2>
      
      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ</label>
          <input type="text" className="w-full border p-2 rounded" 
            value={formData.last_name} 
            onChange={e => setFormData({...formData, last_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên</label>
          <input type="text" className="w-full border p-2 rounded" 
            value={formData.first_name} 
            onChange={e => setFormData({...formData, first_name: e.target.value})} />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input type="text" className="w-full border p-2 rounded" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>

        {/* ✅ [SỬA ĐỔI] Thêm ô chọn Tỉnh vào đây */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tỉnh / Thành phố</label>
          <select className="w-full border p-2 rounded bg-white"
            value={formData.province}
            onChange={e => setFormData({...formData, province: e.target.value})}
          >
            <option value="">-- Chọn Tỉnh --</option>
            {VIETNAM_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Nghề nghiệp */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bạn là?</label>
          <select className="w-full border p-2 rounded bg-gray-50"
            value={formData.occupation}
            onChange={e => setFormData({...formData, occupation: e.target.value})}
          >
            <option value="student">👨‍🎓 Học sinh</option>
            <option value="teacher">👨‍🏫 Giáo viên</option>
            <option value="other">Khác</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">*Chọn "Giáo viên" để được quyền tạo lớp học.</p>
        </div>

        {/* Trường lớp */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Trường học</label>
          <input type="text" className="w-full border p-2 rounded" 
            placeholder="VD: THPT Chuyên..."
            value={formData.school_name} 
            onChange={e => setFormData({...formData, school_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Lớp (Thực tế)</label>
          <input type="text" className="w-full border p-2 rounded" 
            placeholder="VD: 12A1"
            value={formData.actual_class} 
            onChange={e => setFormData({...formData, actual_class: e.target.value})} />
        </div>
      </div>

      <button onClick={handleSave} className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
        LƯU THAY ĐỔI
      </button>
    </div>
  );
};

export default ProfilePage;