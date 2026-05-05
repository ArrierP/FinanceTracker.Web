import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { walletService } from '../services/walletService';
import { toast } from 'react-toastify';
import { Plus, Trash2, ArrowRightLeft, TrendingUp, TrendingDown, Pencil } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        walletId: '',
        toWalletId: '',
        categoryId: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
        type: 2
    });

    // Tách riêng logic lấy Category mặc định để dùng chung
    const getDefaultCategory = (typeId, allCategories) => {
        const currentType = Number(typeId);
        if (currentType === 3) return ''; // Transfer không cần category
        const filtered = allCategories.filter(c => Number(c.type) === currentType);
        return filtered.length > 0 ? filtered[0].id : '';
    };

    const fetchData = useCallback(async () => {
        try {
            const [txs, cats, wals] = await Promise.all([
                transactionService.getAll(),
                categoryService.getAll(),
                walletService.getAll()
            ]);
            setTransactions(txs);
            setCategories(cats);
            setWallets(wals);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true; // Kỹ thuật cleanup để tránh lỗi memory leak nếu fetch chưa xong đã đóng modal/page

        const loadData = async () => {
            if (isMounted) {
                await fetchData();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [fetchData]);

    // Xử lý thay đổi Type trực tiếp tại UI
    const handleTypeChange = (newType) => {
        const defaultCatId = getDefaultCategory(newType, categories);
        setFormData(prev => ({
            ...prev,
            type: newType,
            categoryId: defaultCatId,
            toWalletId: newType === 3 ? prev.toWalletId : '' // Reset toWallet nếu không phải transfer
        }));
    };

    const openModal = (transaction = null) => {
        if (transaction) {
            setEditingId(transaction.id);
            setFormData({
                walletId: transaction.walletId,
                toWalletId: transaction.toWalletId || '',
                categoryId: transaction.categoryId || '',
                amount: Math.abs(transaction.amount),
                date: transaction.transactionDate.slice(0, 10),
                notes: transaction.description || '',
                type: transaction.type
            });
        } else {
            setEditingId(null);
            const defaultType = 2;
            setFormData({
                walletId: wallets[0]?.id || '',
                toWalletId: '',
                categoryId: getDefaultCategory(defaultType, categories),
                amount: '',
                date: new Date().toISOString().slice(0, 10),
                notes: '',
                type: defaultType
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const type = Number(formData.type);
        const walletId = Number(formData.walletId);
        const categoryId = type === 3 ? null : Number(formData.categoryId);
        const toWalletId = type === 3 ? Number(formData.toWalletId) : null;

        if (!walletId || (type !== 3 && !categoryId) || (type === 3 && !toWalletId)) {
            toast.warn("Please select all required fields");
            return;
        }

        try {
            const dataToSubmit = {
                amount: parseFloat(formData.amount),
                description: formData.notes,
                transactionDate: new Date(formData.date).toISOString(),
                type: type,
                walletId: walletId,
                categoryId: categoryId,
                toWalletId: toWalletId
            };

            if (editingId) {
                await transactionService.update(editingId, dataToSubmit);
                toast.success('Transaction updated');
            } else {
                await transactionService.create(dataToSubmit);
                toast.success('Transaction added');
            }

            fetchData();
            setIsModalOpen(false);
        } catch {
            toast.error('Save failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this transaction?')) {
            try {
                await transactionService.delete(id);
                toast.success('Deleted');
                fetchData();
            } catch {
                toast.error('Delete failed');
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading transactions...</div>;

    return (
        <div className="mx-auto max-w-6xl p-4">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="h-5 w-5" /> Add Transaction
                </button>
            </div>

            <div className="glass overflow-hidden rounded-2xl border border-white/20 shadow-sm">
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
                    <tbody className="divide-y divide-slate-100 bg-white/40">
                        {transactions.map(t => (
                            <tr key={t.id} className="transition-colors hover:bg-white/60">
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600">
                                    {new Date(t.transactionDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-800">
                                    {t.type === 3 ? 'Transfer' : (t.categoryName || t.category?.name || 'Uncategorized')}
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500 italic">
                                    {t.description || 'No notes'}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${t.type === 1 ? 'text-emerald-600' : t.type === 2 ? 'text-rose-600' : 'text-indigo-600'
                                    }`}>
                                    {t.type === 1 ? '+' : t.type === 2 ? '-' : ''}
                                    {Math.abs(t.amount).toLocaleString()}đ
                                </td>
                                <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                                    <button onClick={() => openModal(t)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 mr-2">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-50 transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
                    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl">
                        <h3 className="mb-6 text-xl font-bold text-slate-800">
                            {editingId ? 'Edit Transaction' : 'New Transaction'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                                {[
                                    { id: 1, label: 'Income', icon: TrendingUp },
                                    { id: 2, label: 'Expense', icon: TrendingDown },
                                    { id: 3, label: 'Transfer', icon: ArrowRightLeft }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => handleTypeChange(type.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${Number(formData.type) === type.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <type.icon className="h-4 w-4" /> {type.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Source Wallet</label>
                                    <select
                                        required
                                        className="input-field w-full rounded-lg border p-2"
                                        value={formData.walletId}
                                        onChange={e => setFormData({ ...formData, walletId: Number(e.target.value) })}
                                    >
                                        <option value="" disabled>Select</option>
                                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                {Number(formData.type) !== 3 && (
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Category</label>
                                        <select
                                            required
                                            className="input-field w-full rounded-lg border p-2"
                                            value={formData.categoryId}
                                            onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                                        >
                                            <option value="" disabled>Select</option>
                                            {categories
                                                .filter(c => Number(c.type) === Number(formData.type))
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {Number(formData.type) === 3 && (
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">To Wallet</label>
                                    <select
                                        required
                                        className="input-field w-full rounded-lg border p-2"
                                        value={formData.toWalletId}
                                        onChange={e => setFormData({ ...formData, toWalletId: Number(e.target.value) })}
                                    >
                                        <option value="" disabled>Select Destination</option>
                                        {wallets.filter(w => w.id !== Number(formData.walletId)).map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Amount</label>
                                    <input
                                        required
                                        type="number"
                                        className="input-field w-full rounded-lg border p-2"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="input-field w-full rounded-lg border p-2"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Description</label>
                                <input
                                    type="text"
                                    className="input-field w-full rounded-lg border p-2"
                                    placeholder="What was this for?"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                                <button type="submit" className="rounded-xl bg-blue-600 px-8 py-2 font-semibold text-white shadow-lg hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;