import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', type: 'Expense' });

    // 1. Định nghĩa hàm fetchCategories
    const fetchCategories = useCallback(async () => {
        try {
            const data = await categoryService.getAll();

            // Lọc trùng tên ngay tại FE để đảm bảo giao diện không bị gấp đôi
            const uniqueData = (data || []).filter((value, index, self) =>
                index === self.findIndex((t) => t.name === value.name)
            );

            setCategories(uniqueData);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Gọi fetchCategories khi load trang (Chỉ dùng 1 useEffect duy nhất)
    useEffect(() => {
        let isMounted = true; // Chống memory leak

        const loadData = async () => {
            if (isMounted) {
                await fetchCategories();
            }
        };

        loadData();

        return () => { isMounted = false; };
    }, [fetchCategories]); // Dependency chuẩn là fetchCategories vì đã dùng useCallback

    const openModal = (cat = null) => {
        if (cat) {
            // Chuyển đổi type từ số sang chữ để đồng bộ với <select>
            const displayType = cat.type === 1 ? 'Income' : 'Expense';
            setFormData({ ...cat, type: displayType });
        } else {
            setFormData({ id: null, name: '', type: 'Expense' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ id: null, name: '', type: 'Expense' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                name: formData.name,
                type: formData.type === 'Income' ? 1 : 2
            };

            if (formData.id) {
                await categoryService.update(formData.id, dataToSubmit);
            } else {
                await categoryService.create(dataToSubmit);
            }

            toast.success('Category saved');
            fetchCategories(); // Reload danh sách sau khi lưu
            closeModal();
        } catch (err) {
            console.error(err);
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await categoryService.delete(id);
                toast.success('Deleted successfully');
                fetchCategories(); // Reload danh sách sau khi xóa
            } catch (err) {
                console.error(err);
                toast.error('Delete failed');
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Categories...</div>;

    return (
        <div className="p-4 md:p-0">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="h-5 w-5" /> Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {categories.map(cat => (
                    <div key={cat.id} className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
                        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                                onClick={(e) => { e.stopPropagation(); openModal(cat); }}
                                className="p-2 bg-white/90 rounded-full text-indigo-600 hover:bg-white shadow-sm"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                                className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-white shadow-sm"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${(cat.type === 1 || cat.type === 'Income') ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                            {cat.type === 1 || cat.type === 'Income' ? 'Income' : 'Expense'}
                        </p>

                        <h3 className="text-xl font-bold text-slate-800">
                            {cat.name}
                        </h3>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-4 text-lg font-bold">{formData.id ? 'Edit Category' : 'Add Category'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Name</label>
                                <input
                                    required
                                    autoFocus
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Type</label>
                                <select
                                    className="input-field"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Expense">Expense</option>
                                    <option value="Income">Income</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
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

export default Categories;