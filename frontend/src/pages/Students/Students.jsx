import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Eye, UserCheck, UserX, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loading, { TableSkeleton } from '../../components/ui/Loading';
import toast from 'react-hot-toast';

const INITIAL_FORM = { name:'',email:'',phone:'',gender:'male',status:'active',dateOfBirth:'',guardianName:'',guardianPhone:'',address:{city:'',country:''} };

export default function Students() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: { page, limit: 10, search, status: statusFilter } });
      setStudents(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const s = searchParams.get('search');
    if (s) setSearch(s);
  }, [searchParams]);

  const openAdd = () => { reset(INITIAL_FORM); setEditStudent(null); setShowModal(true); };
  const openEdit = (s) => { reset(s); setEditStudent(s); setShowModal(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent._id}`, data);
        toast.success('Student updated');
      } else {
        await api.post('/students', data);
        toast.success('Student added');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      setDeleteConfirm(null);
      fetchStudents();
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} total students enrolled</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email, ID..." className="input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="select w-full sm:w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-head">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Student ID</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Enrolled</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7}><TableSkeleton rows={8} cols={7} /></td></tr> :
                students.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <UserX className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No students found</p>
                  </td></tr>
                ) : students.map((s, i) => (
                  <tr key={s._id} className="table-row">
                    <td className="px-4 py-3 text-sm text-gray-400">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell font-mono">{s.studentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{new Date(s.enrollmentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge label={s.status} variant={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/students/${s._id}`} className="btn-ghost p-1.5 text-gray-400 hover:text-primary-500" title="View"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => openEdit(s)} className="btn-ghost p-1.5 text-gray-400 hover:text-amber-500" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(s)} className="btn-ghost p-1.5 text-gray-400 hover:text-rose-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</p>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-2 py-1.5 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-2 py-1.5 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editStudent ? 'Edit Student' : 'Add New Student'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input {...register('name', { required: 'Required' })} className="input" placeholder="John Doe" />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input {...register('email', { required: 'Required' })} type="email" className="input" placeholder="john@example.com" />
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input" placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input {...register('dateOfBirth')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select {...register('gender')} className="select">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="label">Guardian Name</label>
              <input {...register('guardianName')} className="input" placeholder="Parent/Guardian" />
            </div>
            <div>
              <label className="label">Guardian Phone</label>
              <input {...register('guardianPhone')} className="input" placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="label">City</label>
              <input {...register('address.city')} className="input" placeholder="New York" />
            </div>
            <div>
              <label className="label">Country</label>
              <input {...register('address.country')} className="input" placeholder="USA" />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} rows={3} className="textarea" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {editStudent ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Student" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm._id)} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
