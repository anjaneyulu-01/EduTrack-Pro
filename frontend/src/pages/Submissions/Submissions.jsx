import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);

  const { register, handleSubmit, reset } = useForm();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions', { params: { status: statusFilter, limit: 50 } });
      setSubmissions(res.data.data);
    } catch { }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
  useEffect(() => {
    Promise.all([
      api.get('/students', { params: { limit: 200 } }),
      api.get('/exams', { params: { limit: 200 } }),
      api.get('/classes', { params: { limit: 100 } }),
    ]).then(([s, e, c]) => { setStudents(s.data.data); setExams(e.data.data); setClasses(c.data.data); }).catch(() => {});
  }, []);

  const openAdd = () => { reset({ status: 'submitted' }); setShowModal(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.post('/submissions', data);
      toast.success('Submission recorded');
      setShowModal(false);
      fetchSubmissions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/submissions/${id}`, { status });
      toast.success('Status updated');
      fetchSubmissions();
    } catch { toast.error('Failed to update'); }
  };

  const filtered = submissions.filter(s =>
    !search || s.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.exam?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    late: submissions.filter(s => s.status === 'late').length,
    missing: submissions.filter(s => s.status === 'missing').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Submissions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stats.total} total submissions</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Submission</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Submitted', value: stats.submitted, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Graded', value: stats.graded, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Missing', value: stats.missing, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        ].map(item => (
          <div key={item.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or exam..." className="input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select w-full sm:w-40">
          <option value="">All Status</option>
          {['submitted','graded','late','missing','resubmitted'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Exam</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Class</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Submitted At</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">Late</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.student?.name}</p>
                          <p className="text-xs font-mono text-gray-400">{s.student?.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{s.exam?.title}</p>
                      {s.exam?.type && <Badge label={s.exam.type} variant={s.exam.type} />}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{s.class?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden lg:table-cell">{new Date(s.submittedAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge label={s.status} variant={s.status} /></td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {s.isLate ? <span className="text-rose-400 text-xs font-medium">Yes</span> : <span className="text-gray-300 text-xs">No</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <select value={s.status} onChange={e => updateStatus(s._id, e.target.value)} className="text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-2 py-1">
                          {['submitted','graded','late','missing','resubmitted'].map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No submissions found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Submission" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Student</label>
            <select {...register('student', { required: true })} className="select">
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Exam</label>
            <select {...register('exam', { required: true })} className="select">
              <option value="">Select exam</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.title} — {e.class?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Class</label>
            <select {...register('class', { required: true })} className="select">
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Content / Notes</label>
            <textarea {...register('content')} rows={3} className="textarea" placeholder="Submission notes..." />
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="select">
              {['submitted','graded','late','missing'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />} Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
