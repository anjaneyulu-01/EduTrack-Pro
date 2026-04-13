import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkClass, setBulkClass] = useState('');
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStudents, setBulkStudents] = useState([]);
  const [bulkStatuses, setBulkStatuses] = useState({});

  const { register, handleSubmit, reset } = useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.classId = classFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await api.get('/attendance', { params });
      setRecords(res.data.data);
    } catch { }
    finally { setLoading(false); }
  }, [statusFilter, classFilter, dateFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => {
    Promise.all([
      api.get('/classes', { params: { limit: 100 } }),
      api.get('/students', { params: { limit: 200 } }),
    ]).then(([c, s]) => { setClasses(c.data.data); setStudents(s.data.data); }).catch(() => {});
  }, []);

  const openBulk = async (classId) => {
    const cls = classes.find(c => c._id === classId);
    if (!cls) return toast.error('Select a class first');
    const res = await api.get(`/classes/${classId}`);
    setBulkStudents(res.data.data.students || []);
    const statuses = {};
    (res.data.data.students || []).forEach(s => { statuses[s._id] = 'present'; });
    setBulkStatuses(statuses);
    setBulkClass(classId);
    setShowBulkModal(true);
  };

  const handleBulkSubmit = async () => {
    setSaving(true);
    try {
      const records = bulkStudents.map(s => ({
        student: s._id, class: bulkClass,
        date: new Date(bulkDate).toISOString(), status: bulkStatuses[s._id] || 'present',
      }));
      await api.post('/attendance/bulk', { records });
      toast.success(`Attendance marked for ${records.length} students`);
      setShowBulkModal(false);
      fetchRecords();
    } catch { toast.error('Failed to mark attendance'); }
    finally { setSaving(false); }
  };

  const onSingleSubmit = async (data) => {
    setSaving(true);
    try {
      await api.post('/attendance', { ...data, date: new Date(data.date).toISOString() });
      toast.success('Attendance marked');
      setShowModal(false);
      fetchRecords();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  // Stats
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    excused: records.filter(r => r.status === 'excused').length,
  };

  // Weekly trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayRecords = records.filter(r => new Date(r.date).toISOString().split('T')[0] === dateStr);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      present: dayRecords.filter(r => r.status === 'present').length,
      absent: dayRecords.filter(r => r.status === 'absent').length,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{records.length} records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { reset({ status: 'present', date: new Date().toISOString().split('T')[0] }); setShowModal(true); }} className="btn-secondary"><Plus className="w-4 h-4" /> Single</button>
          <button onClick={() => setShowBulkModal(true)} className="btn-primary"><Users className="w-4 h-4" /> Bulk Mark</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: stats.present, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Excused', value: stats.excused, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
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

      {/* Weekly Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance This Week</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={last7Days} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
            <Bar dataKey="absent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="select flex-1 min-w-32">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select flex-1 min-w-32">
          <option value="">All Status</option>
          {['present','absent','late','excused'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input flex-1 min-w-36" />
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden">
        {loading ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Class</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {r.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.student?.name}</p>
                          <p className="text-xs font-mono text-gray-400">{r.student?.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{r.class?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge label={r.status} variant={r.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden lg:table-cell">{r.notes || '—'}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No attendance records</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Attendance Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Mark Attendance" size="sm">
        <form onSubmit={handleSubmit(onSingleSubmit)} className="space-y-4">
          <div>
            <label className="label">Student</label>
            <select {...register('student', { required: true })} className="select">
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
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
            <label className="label">Date</label>
            <input {...register('date', { required: true })} type="date" className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="select">
              {['present','absent','late','excused'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <input {...register('notes')} className="input" placeholder="Optional notes..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />} Mark
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Attendance Modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Attendance" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Class</label>
              <select value={bulkClass} onChange={e => { setBulkClass(e.target.value); openBulk(e.target.value); }} className="select">
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} className="input" />
            </div>
          </div>

          {bulkStudents.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
              {bulkStudents.map(s => (
                <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {s.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs font-mono text-gray-400">{s.studentId}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {['present','absent','late','excused'].map(st => (
                      <button key={st} type="button" onClick={() => setBulkStatuses(prev => ({ ...prev, [s._id]: st }))}
                        className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${bulkStatuses[s._id] === st
                          ? st === 'present' ? 'bg-emerald-500 text-white' : st === 'absent' ? 'bg-rose-500 text-white' : st === 'late' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                        {st.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Select a class to load students</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowBulkModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleBulkSubmit} disabled={saving || !bulkClass || bulkStudents.length === 0} className="btn-primary">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Mark {bulkStudents.length} Students
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
