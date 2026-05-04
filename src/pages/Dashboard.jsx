import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [overview, setOverview] = useState({ actualTotalBalance: 0, totalIncome: 0, totalExpense: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Concurrent API calls for performance optimization
        const [ov, mon, cat, wal, trd] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getMonthly(7),
          dashboardService.getCategorySummary(),
          dashboardService.getWalletSummary(),
          dashboardService.getMonthlyTrend(6)
        ]);

        setOverview(ov); // Maps to DashboardOverviewDto[cite: 1, 2]
        setMonthlyData(mon.chartData || []); // Maps to MonthlySummaryDto.ChartData[cite: 1, 2]
        setCategoryData(cat || []); // Maps to List<CategorySummaryDto>[cite: 1, 2]
        setWallets(wal || []); // Maps to List<WalletSummaryDto>[cite: 1, 2]
        setTrendData(trd || []); // Maps to List<MonthlyTrendDto>[cite: 1, 2]
      } catch (err) {
        console.error("API Error:", err);
        toast.error('Failed to fetch data from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Delay for CSS Grid stability
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center text-slate-500 font-medium">
      Loading Dashboard...
    </div>
  );

  const cards = [
    { title: 'Total Balance', amount: overview.actualTotalBalance, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Monthly Income', amount: overview.totalIncome, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'Monthly Expense', amount: overview.totalExpense, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-100' },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
      {/* 1. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg border border-white/20">
              <div className={`p-4 rounded-xl ${card.bg}`}>
                <Icon className={`w-7 h-7 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {card.amount.toLocaleString()} <span className="text-sm font-normal text-slate-400">VND</span>
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Monthly Area Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Cash Flow (Last 7 Days)</h3>
          <div className="h-80 w-full">
            {isReady && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" fill="url(#colorExpense)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Category Pie Chart */}
        <div className="glass rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">Spending by Category</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="categoryName"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Monthly Trend Line Chart */}
        <div className="glass rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Long-term Trends (6 Months)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Wallet Summary List */}
        <div className="glass rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Account Wallets</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {wallets.map((wallet, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/40 rounded-xl border border-slate-100 hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-lg">
                    <Wallet className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="font-semibold text-slate-700">{wallet.walletName}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-900">
                    {wallet.balance.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium uppercase">{wallet.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;