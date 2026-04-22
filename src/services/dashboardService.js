import api from './api';

export const dashboardService = {
  getSummary: async () => {
    // Gọi đúng endpoint [HttpGet("monthly")] trong DashboardController
    const response = await api.get('/dashboard/monthly'); 
    return response.data;
  },
  
  getChartData: async (period) => {
    // Nếu BE chưa có route /chart, tạm thời dùng chung /monthly 
    // hoặc đợi BE viết thêm [HttpGet("chart")]
    const response = await api.get('/dashboard/monthly'); 
    return response.data;
  }
};
