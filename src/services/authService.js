import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Kiểm tra xem dữ liệu trả về có thực sự tồn tại user không
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // FIX: Chỉ stringify nếu user tồn tại, nếu không hãy lưu chuỗi rỗng hoặc object trống
      const userData = response.data.user || response.data; // Thử lấy data nếu user bị bọc sai chỗ
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
  },
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    // FIX: Kiểm tra thêm trường hợp userStr là chuỗi "undefined"
    if (userStr && userStr !== "undefined") {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Lỗi parse user từ localStorage", e);
        return null;
      }
    }
    return null;
  }
};
