import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
      // Mock data for demo if API endpoint is not giving data
      if (users.length === 0) {
        setUsers([
          { id: 1, fullName: 'John Doe', email: 'john@example.com', role: 'User', isLocked: false },
          { id: 2, fullName: 'Jane Smith', email: 'jane@example.com', role: 'User', isLocked: true },
          { id: 3, fullName: 'Admin User', email: 'admin@example.com', role: 'Admin', isLocked: false },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) return <div>Loading Users...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-600" /> Admin Dashboard
        </h2>
      </div>

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
                      {u.isLocked ? <Unlock className="w-5 h-5"/> : <Lock className="w-5 h-5"/>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
