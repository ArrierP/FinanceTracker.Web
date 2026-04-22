import { useState, useEffect } from 'react';
import { walletService } from '../services/walletService';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', initialBalance: 0 });

  const fetchWallets = async () => {
    try {
      const data = await walletService.getAll();
      setWallets(data);
    } catch (err) {
      toast.error('Failed to load wallets');
      // Mock data for display if API gives error
      if (wallets.length === 0) {
        setWallets([{ id: 1, name: 'Cash', balance: 500 }, { id: 2, name: 'Bank Card', balance: 12000 }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const openModal = (wallet = null) => {
    if (wallet) {
      setFormData(wallet);
    } else {
      setFormData({ id: null, name: '', initialBalance: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: '', initialBalance: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await walletService.update(formData.id, formData);
        toast.success('Wallet updated');
      } else {
        await walletService.create(formData);
        toast.success('Wallet created');
      }
      fetchWallets();
      closeModal();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this wallet?')) {
      try {
        await walletService.delete(id);
        toast.success('Wallet deleted');
        fetchWallets();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Your Wallets</h2>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map(w => (
          <div key={w.id} className="glass rounded-2xl p-6 relative group overflow-hidden transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-50">
              <button onClick={() => openModal(w)} className="p-2 bg-white/80 rounded-full text-indigo-600 hover:bg-white"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(w.id)} className="p-2 bg-white/80 rounded-full text-red-600 hover:bg-white"><Trash2 className="w-4 h-4" /></button>
            </div>
            <p className="text-slate-500 font-medium mb-1 drop-shadow-sm">{w.name}</p>
            <h3 className="text-3xl font-bold text-slate-800">
              ${Number(w.balance).toLocaleString()}
            </h3>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-primary rounded-full">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{formData.id ? 'Edit Wallet' : 'Add New Wallet'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Wallet Name</label>
                <input
                  required autoFocus type="text" className="input-field"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Initial Balance</label>
                <input
                  required type="number" step="0.01" className="input-field"
                  value={formData.initialBalance} onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      initialBalance: val === '' ? '' : parseFloat(val) // Giữ chuỗi rỗng nếu người dùng xóa hết
                    });
                  }}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
