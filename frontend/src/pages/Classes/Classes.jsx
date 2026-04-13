import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, BookOpen, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b','#10b981','#3b82f6','#06b6d4'];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes', { params: { search, limit: 50 } });
      setClasses(res.data.data);
    } catch (err) { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  useEffect(() => {
    api.get('/auth/users').then(res => setTeachers(res.data.data?.filter(u => u.role === 'teacher' || u.role === 'admin') || [])).catch(() => {});
  }, []);

  const openAdd = () => { reset({ semester: 'Fall', year: new Date().getFullYear(), capacity: 30, status: 'active', coverColor: COLORS[Math.floor(Math.random() * COLORS.length)] }); setEditClass(null); setShowModal(true); };
  const openEdit = (c) => { reset(c); setEditClass(c); setShowModal(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editClass) { await api.put(`/classes/${editClass._id}`, data); toast.success('Class updated'); }
      else { await api.post('/classes', data); toast.success('Class created'); }
      setShowModal(false); fetchClasses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/classes/${id}`); toast.success('Class deleted'); setDeleteConfirm(null); fetchClasses(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{classes.length} active classes</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Class</button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search classes..." className="input pl-9" />
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map(cls => (
            <div key={cls._id} className="card overflow-hidden hover:shadow-md transition-shadow duration-200 group">
              <div className="h-2" style={{ backgroundColor: cls.coverColor || '#6366f1' }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (cls.coverColor || '#6366f1') + '20' }}>
                    <BookOpen className="w-5 h-5" style={{ color: cls.coverColor || '#6366f1' }} />
                  </div>
                  <Badge label={cls.status} variant={cls.status} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{cls.name}</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{cls.code}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cls.subject}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{cls.students?.length || 0}/{cls.capacity} students</span>
                  <span className="mx-1">•</span>
                  <span>{cls.semester} {cls.year}</span>
                </div>
                {cls.teacher && (
                  <p className="text-xs text-gray-400 mt-1">👤 {cls.teacher.name}</p>
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/classes/${cls._id}`} className="flex-1 btn-secondary justify-center text-xs py-1.5"><Eye className="w-3.5 h-3.5" /> View</Link>
                  <button onClick={() => openEdit(cls)} className="btn-ghost p-1.5"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(cls)} className="btn-ghost p-1.5 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No classes found</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editClass ? 'Edit Class' : 'Create New Class'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Class Name *</label>
              <input {...register('name', { required: 'Required' })} className="input" placeholder="Mathematics 101" />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Class Code *</label>
              <input {...register('code', { required: 'Required' })} className="input" placeholder="MATH101" />
              {errors.code && <p className="text-rose-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="label">Subject *</label>
              <input {...register('subject', { required: 'Required' })} className="input" placeholder="Mathematics" />
              {errors.subject && <p className="text-rose-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="label">Teacher</label>
              <select {...register('teacher')} className="select">
                <option value="">Select teacher</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select {...register('semester')} className="select">
                {['Fall','Spring','Summer','Winter'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input {...register('year', { required: 'Required', valueAsNumber: true })} type="number" className="input" placeholder="2024" />
            </div>
            <div>
              <label className="label">Capacity</label>
              <input {...register('capacity', { valueAsNumber: true })} type="number" className="input" placeholder="30" />
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} className="textarea" placeholder="Class description..." />
          </div>
          <div>
            <label className="label">Cover Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" {...register('coverColor')} value={c} className="sr-only" />
                  <div className="w-7 h-7 rounded-lg border-2 border-transparent hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Class" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Delete <strong>{deleteConfirm?.name}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
