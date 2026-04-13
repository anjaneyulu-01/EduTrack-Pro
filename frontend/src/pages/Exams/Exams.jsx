import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, ClipboardList, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams', { params: { search, type: typeFilter, status: statusFilter, limit: 50 } });
      setExams(res.data.data);
    } catch { toast.error('Failed to load exams'); }
    finally { setLoading(false); }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => { fetchExams(); }, [fetchExams]);
  useEffect(() => { api.get('/classes', { params: { limit: 100 } }).then(r => setClasses(r.data.data)).catch(() => {}); }, []);

  const openAdd = () => {
    reset({ type: 'quiz', totalMarks: 100, passingMarks: 40, duration: 60, status: 'upcoming' });
    setEditExam(null); setShowModal(true);
  };
  const openEdit = (e) => { reset({ ...e, class: e.class?._id }); setEditExam(e); setShowModal(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editExam) { await api.put(`/exams/${editExam._id}`, data); toast.success('Exam updated'); }
      else { await api.post('/exams', data); toast.success('Exam created'); }
      setShowModal(false); fetchExams();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/exams/${id}`); toast.success('Exam deleted'); setDeleteConfirm(null); fetchExams(); }
    catch { toast.error('Failed to delete'); }
  };

  const typeIcons = { quiz: '📝', midterm: '📋', final: '🎓', assignment: '📌', project: '🏗️', lab: '🔬' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{exams.length} exams scheduled</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Create Exam</button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exams..." className="input pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="select w-full sm:w-36">
          <option value="">All Types</option>
          {['quiz','midterm','final','assignment','project','lab'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select w-full sm:w-36">
          <option value="">All Status</option>
          {['upcoming','ongoing','completed','cancelled','draft'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left">Exam</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Class</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Marks</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam._id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{typeIcons[exam.type] || '📝'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.title}</p>
                          <Badge label={exam.type} variant={exam.type} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{exam.class?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(exam.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden lg:table-cell">{exam.totalMarks} pts</td>
                    <td className="px-4 py-3"><Badge label={exam.status} variant={exam.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/exams/${exam._id}`} className="btn-ghost p-1.5 text-gray-400 hover:text-primary-500"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => openEdit(exam)} className="btn-ghost p-1.5 text-gray-400 hover:text-amber-500"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(exam)} className="btn-ghost p-1.5 text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No exams found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editExam ? 'Edit Exam' : 'Create Exam'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input {...register('title', { required: 'Required' })} className="input" placeholder="Midterm Exam - Chapter 1-5" />
              {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Class *</label>
              <select {...register('class', { required: 'Required' })} className="select">
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
              {errors.class && <p className="text-rose-500 text-xs mt-1">{errors.class.message}</p>}
            </div>
            <div>
              <label className="label">Type</label>
              <select {...register('type')} className="select">
                {['quiz','midterm','final','assignment','project','lab'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input {...register('date', { required: 'Required' })} type="datetime-local" className="input" />
              {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="label">Duration (mins)</label>
              <input {...register('duration', { valueAsNumber: true })} type="number" className="input" placeholder="60" />
            </div>
            <div>
              <label className="label">Total Marks *</label>
              <input {...register('totalMarks', { required: true, valueAsNumber: true })} type="number" className="input" placeholder="100" />
            </div>
            <div>
              <label className="label">Passing Marks</label>
              <input {...register('passingMarks', { valueAsNumber: true })} type="number" className="input" placeholder="40" />
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="select">
                {['draft','upcoming','ongoing','completed','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} className="textarea" placeholder="Exam description or instructions..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editExam ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Exam" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Delete <strong>{deleteConfirm?.title}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
