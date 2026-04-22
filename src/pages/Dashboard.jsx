import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Gọi API thật từ Backend
        const data = await dashboardService.getSummary();

        // BE trả về result từ GetMonthlySummaryAsync()
        // Giả sử kết quả trả về có cấu trúc khớp với state của bạn
        setSummary({
          totalBalance: data.totalBalance || 0,
          totalIncome: data.totalIncome || 0,
          totalExpense: data.totalExpense || 0
        });

        // Nếu BE trả về mảng dữ liệu biểu đồ trong cùng một object
        setChartData(data.chartData || []);

      } catch (err) {
        console.error("API Error:", err);
        toast.error('Không thể kết nối đến Server, đang dùng dữ liệu mẫu.');
        useMockData(); // Gọi hàm mock data khi API thực tế lỗi
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      setSummary({ totalBalance: 45000, totalIncome: 120000, totalExpense: 75000 });
      setChartData([
        { date: 'Mon', income: 4000, expense: 2400 },
        { date: 'Tue', income: 3000, expense: 1398 },
        { date: 'Wed', income: 2000, expense: 9800 },
        { date: 'Thu', income: 2780, expense: 3908 },
        { date: 'Fri', income: 1890, expense: 4800 },
        { date: 'Sat', income: 2390, expense: 3800 },
        { date: 'Sun', income: 3490, expense: 4300 },
      ]);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Đợi 200ms để CSS và Grid ổn định hoàn toàn
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const cards = [
    { title: 'Total Balance', amount: summary.totalBalance, icon: DollarSign, color: 'text-primary', bg: 'bg-indigo-100' },
    { title: 'Total Income', amount: summary.totalIncome, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'Total Expense', amount: summary.totalExpense, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass rounded-2xl p-6 flex items-center gap-4 transition-transform hover:scale-105 duration-300">
              <div className={`p-4 rounded-full ${card.bg}`}>
                <Icon className={`w-8 h-8 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  ${card.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Income vs Expense (Last 7 Days)</h3>
        <div className="h-80 w-full" style={{ minHeight: '320px' }}>
          {isReady && chartData.length > 0 ? (<ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>) : (<div className="flex items-center justify-center h-full text-slate-400">
            Loading chart...
          </div>)}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
