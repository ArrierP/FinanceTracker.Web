import api from './api';

export const dashboardService = {
  // 1. Lấy tổng quan: Số dư thực, Tổng thu, Tổng chi tháng hiện tại
  // Khớp với [HttpGet("overview")] trong DashboardController
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  // 2. Thống kê biểu đồ cột (mặc định 7 ngày)
  // Khớp với [HttpGet("monthly")] trong DashboardController
  getMonthly: async (days = 7) => {
    const response = await api.get(`/dashboard/monthly?days=${days}`);
    return response.data;
  },

  // 3. Thống kê theo danh mục (Biểu đồ tròn)
  // Khớp với [HttpGet("categories")] trong DashboardController[cite: 3]
  getCategorySummary: async () => {
    const response = await api.get('/dashboard/categories');
    return response.data;
  },

  // 4. Tóm tắt danh sách ví
  // Khớp với [HttpGet("wallets")] trong DashboardController[cite: 3]
  getWalletSummary: async () => {
    const response = await api.get('/dashboard/wallets');
    return response.data;
  },

  // 5. Xu hướng chi tiêu nhiều tháng (Biểu đồ đường)
  // Khớp với [HttpGet("trend")] trong DashboardController[cite: 3]
  getMonthlyTrend: async (months = 6) => {
    const response = await api.get(`/dashboard/trend?months=${months}`);
    return response.data;
  }
};