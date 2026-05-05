import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';
import { Tag, Plus, Trash2, Edit2, X, Check, Layers } from 'lucide-react';

const AdminCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mặc định chọn Income (1) cho state tạo mới
  const [newCat, setNewCat] = useState({ name: '', type: 'Income' });
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', type: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDefaultCategories();
      setCategories(data);
      console.log(categories)
    } catch {
      toast.error('Cannot fetching data from server.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuyển đổi String sang Enum Int trước khi gửi lên API
  const convertToEnum = (typeString) => (typeString === 'Income' ? 1 : 2);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return toast.warn("Please sign in name category!");
    
    try {
      const dataToSubmit = {
        name: newCat.name,
        type: convertToEnum(newCat.type) // Chuyển đổi sang 1 hoặc 2
      };
      
      await adminService.createDefaultCategory(dataToSubmit);
      toast.success("Created Default Category Successfully!");
      setNewCat({ name: '', type: 'Income' });
      fetchCategories();
    } catch {
      toast.error("Error while creating category...");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const dataToSubmit = {
        name: editForm.name,
        type: convertToEnum(editForm.type) // Chuyển đổi sang 1 hoặc 2
      };
      
      await adminService.updateDefaultCategory(id, dataToSubmit);
      toast.success("Updated Successfully!");
      setEditingId(null);
      fetchCategories();
    } catch {
      toast.error("Error while updating...");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to deleting this default category?")) return;
    try {
      await adminService.deleteDefaultCategory(id);
      toast.success("Deleted Successfully!");
      fetchCategories();
    } catch {
      toast.error("Error while deleting category...");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    // Nếu API trả về số (1/2), ta nên chuyển ngược lại String để hiển thị trên Select
    setEditForm({ 
      name: cat.name, 
      type: cat.type === 1 || cat.type === 'Income' ? 'Income' : 'Expense' 
    });
  };

  if (loading && categories.length === 0) return <div className="p-4">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-slate-800">Global Categories</h2>
      </div>

      {/* Form tạo mới */}
      <form onSubmit={handleCreate} className="glass p-5 rounded-2xl border border-white/20 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-600 mb-1">Category Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newCat.name}
            onChange={(e) => setNewCat({...newCat, name: e.target.value})}
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
          <select 
            className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
            value={newCat.type}
            onChange={(e) => setNewCat({...newCat, type: e.target.value})}
          >
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 h-[42px]">
          <Plus size={20} /> Add
        </button>
      </form>

      {/* Danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="glass p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            {editingId === cat.id ? (
              <div className="flex flex-1 gap-2 items-center">
                <input 
                  className="flex-1 px-2 py-1 border rounded-lg text-sm"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
                <select 
                  className="px-1 py-1 border rounded-lg text-xs"
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
                <button onClick={() => handleUpdate(cat.id)} className="text-emerald-600"><Check size={18}/></button>
                <button onClick={() => setEditingId(null)} className="text-slate-400"><X size={18}/></button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cat.type === 1 || cat.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{cat.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {cat.type === 1 || cat.type === 'Income' ? 'Income' : 'Expense'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(cat)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategoryManager;