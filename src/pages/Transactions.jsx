import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { walletService } from '../services/walletService';
import { toast } from 'react-toastify';
import { Plus, Trash2, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    walletId: '', 
    toWalletId: 0,
    categoryId: '', 
    amount: 0, 
    date: new Date().toISOString().slice(0, 10), 
    notes: '',
    type: 2 // Mặc định là Expense (Chi tiêu) theo Enum
  });

  const fetchData = async () => {
    try {
      const [txs, cats, wals] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
        walletService.getAll()
      ]);
      setTransactions(txs);
      setCategories(cats);
      setWallets(wals);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = () => {
    setFormData({ 
      walletId: wallets[0]?.id || '', 
      toWalletId: 0,
      categoryId: categories[0]?.id || '', 
      amount: 0, 
      date: new Date().toISOString().slice(0, 10), 
      notes: '',
      type: 2 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map dữ liệu sang đúng Schema Backend
      const dataToSubmit = {
        amount: parseFloat(formData.amount),
        description: formData.notes,
        transactionDate: new Date(formData.date).toISOString(),
        type: parseInt(formData.type),
        walletId: parseInt(formData.walletId),
        categoryId: parseInt(formData.categoryId),
        toWalletId: formData.type === 3 ? parseInt(formData.toWalletId) : 0
      };

      await transactionService.create(dataToSubmit);
      toast.success('Transaction added successfully');
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await transactionService.delete(id);
        toast.success('Deleted');
        fetchData();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading transactions...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
        <button onClick={openModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Transaction
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-sm border border-white/20">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Notes</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/40 divide-y divide-slate-100">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-white/60 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {new Date(t.transactionDate).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                  {t.categoryName || t.category?.name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 italic">
                  {t.description || 'No notes'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                  t.type === 1 ? 'text-emerald-600' : t.type === 2 ? 'text-rose-600' : 'text-indigo-600'
                }`}>
                  {t.type === 1 ? '+' : t.type === 2 ? '-' : ''}
                  ${Math.abs(t.amount).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button onClick={() => handleDelete(t.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-50 transition-all">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold mb-6 text-slate-800">New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                {[
                  { id: 1, label: 'Income', icon: TrendingUp },
                  { id: 2, label: 'Expense', icon: TrendingDown },
                  { id: 3, label: 'Transfer', icon: ArrowRightLeft }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({...formData, type: type.id})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.type === type.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <type.icon className="w-4 h-4" /> {type.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source Wallet</label>
                  <select required className="input-field" value={formData.walletId} onChange={e => setFormData({...formData, walletId: e.target.value})}>
                    <option value="" disabled>Select</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select required className="input-field" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="" disabled>Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {formData.type === 3 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To Wallet</label>
                  <select required className="input-field" value={formData.toWalletId} onChange={e => setFormData({...formData, toWalletId: e.target.value})}>
                    <option value={0} disabled>Select Destination</option>
                    {wallets.filter(w => w.id != formData.walletId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                  <input required type="number" step="0.01" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (Notes)</label>
                <input type="text" className="input-field" placeholder="What was this for?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary px-8">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;