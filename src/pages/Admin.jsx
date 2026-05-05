import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';
import { Lock, Unlock, ShieldAlert, Users, Activity, Repeat, TrendingUp, Layers } from 'lucide-react';
import AdminCategoryManager from './AdminCategoryManger';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLockToggle = async (userId, currentlyLocked) => {
    try {
      if (currentlyLocked) {
        await adminService.unlockUser(userId);
        toast.success('User unlocked successfully');
      } else {
        await adminService.lockUser(userId);
        toast.success('User locked successfully');
      }
      fetchData();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Suite...</div>;

  return (
    <div className='space-y-8'>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Active (24h)"
          value={stats?.activeUsers24h || 0}
          icon={<Activity className="w-6 h-6" />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Transactions (24h)"
          value={stats?.totalTransactions24h || 0}
          icon={<Repeat className="w-6 h-6" />}
          color="bg-amber-500"
        />
        {/* <StatCard
          title="Top Category"
          value={stats?.topCategories?.[0]?.categoryName || 'N/A'}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-indigo-500"
        /> */}
      </div>
      <div className="glass p-6 rounded-2xl shadow-sm border border-white/20 mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Top 5 Most Used Categories
        </h3>
        <div className="space-y-4">
          {stats?.topCategories?.map((cat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-700">{cat.categoryName}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${(cat.usageCount / stats.topCategories[0].usageCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-500">{cat.usageCount} txns</span>
              </div>
            </div>
          ))}
          {(!stats?.topCategories || stats?.topCategories.length === 0) && (
            <p className="text-center text-slate-400 py-4">No data available</p>
          )}
        </div>
      </div>
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 font-medium transition-all flex items-center gap-2 ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Users size={20} /> User Management
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-4 px-4 font-medium transition-all flex items-center gap-2 ${activeTab === 'categories' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Layers size={20} /> Default Categories
        </button>
      </div>


      <div className="mt-6">
        {activeTab === 'users' ? (
          <div className="glass rounded-2xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{u.fullName}</div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {u.isLocked ? (
                        <span className="text-red-500 bg-red-50 px-2 py-1 rounded-full">Locked</span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {u.role !== 'Admin' && (
                        <button
                          onClick={() => handleLockToggle(u.id, u.isLocked)}
                          className={`p-2 rounded-full transition-colors ${u.isLocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
                          title={u.isLocked ? "Unlock user" : "Lock user"}
                        >
                          {u.isLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminCategoryManager />
        )}
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass p-6 rounded-2xl shadow-sm border border-white/20 flex items-center gap-4">
    <div className={`p-3 rounded-xl text-white ${color} shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

export default Admin;
