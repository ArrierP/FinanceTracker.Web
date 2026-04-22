import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', type: 'Expense' });

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
      if (categories.length === 0) {
        setCategories([
          { id: 1, name: 'Food & Dining', type: 'Expense' },
          { id: 2, name: 'Salary', type: 'Income' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (cat = null) => {
    if (cat) setFormData(cat);
    else setFormData({ id: null, name: '', type: 'Expense' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: '', type: 'Expense' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn hóa dữ liệu trước khi gửi
      const dataToSubmit = {
        name: formData.name,
        // Chuyển "Income" thành 1, "Expense" thành 2 (Khớp với Enum của bạn)
        type: formData.type === 'Income' ? 1 : 2
      };

      if (formData.id) {
        await categoryService.update(formData.id, dataToSubmit);
      } else {
        await categoryService.create(dataToSubmit);
      }

      toast.success('Category saved');
      fetchCategories();
      closeModal();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this category?')) {
      try {
        await categoryService.delete(id);
        toast.success('Deleted successfully');
        fetchCategories();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <div>Loading Categories...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="glass rounded-2xl p-6 relative group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
            {/* Thêm z-10 để đảm bảo nút nằm trên lớp glass */}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); openModal(cat); }}
                className="p-2 bg-white/90 rounded-full text-indigo-600 hover:bg-white shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-white shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Xử lý hiển thị dựa trên cả số (BE) và chữ (Mock) */}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{formData.id ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required autoFocus type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="input-field"
                  value={formData.type === 1 ? 'Income' : formData.type === 2 ? 'Expense' : formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
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

export default Categories;
