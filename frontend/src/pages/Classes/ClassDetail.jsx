import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Clock, MapPin, UserPlus, Trash2, Calendar } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export default function ClassDetail() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const fetchClass = async () => {
    try {
      const res = await api.get(`/classes/${id}`);
      setCls(res.data.data);
    } catch { toast.error('Failed to load class'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClass(); }, [id]);

  const openEnroll = async () => {
    const res = await api.get('/students', { params: { limit: 200 } });
    const enrolled = cls?.students?.map(s => s._id) || [];
    setAllStudents(res.data.data.filter(s => !enrolled.includes(s._id)));
    setShowEnrollModal(true);
  };

  const handleEnroll = async () => {
    if (!selectedStudent) return;
    setEnrolling(true);
    try {
      await api.post(`/classes/${id}/enroll`, { studentId: selectedStudent });
      toast.success('Student enrolled');
      setShowEnrollModal(false);
      setSelectedStudent('');
      fetchClass();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to enroll'); }
    finally { setEnrolling(false); }
  };

  const handleUnenroll = async (studentId) => {
    try {
      await api.delete(`/classes/${id}/unenroll/${studentId}`);
      toast.success('Student unenrolled');
      fetchClass();
    } catch { toast.error('Failed to unenroll'); }
  };

  if (loading) return <Loading />;
  if (!cls) return <div className="text-center py-16 text-gray-400">Class not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/classes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400">
        <ArrowLeft className="w-4 h-4" /> Back to Classes
      </Link>

      <div className="card overflow-hidden">
        <div className="h-3" style={{ backgroundColor: cls.coverColor || '#6366f1' }} />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cls.name}</h1>
              <p className="font-mono text-sm text-gray-400 mt-0.5">{cls.code}</p>
              {cls.description && <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{cls.description}</p>}
            </div>
            <div className="flex gap-3 flex-wrap">
              <Badge label={cls.status} variant={cls.status} />
              <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{cls.semester} {cls.year}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            {[
              { icon: BookOpen, label: 'Subject', value: cls.subject },
              { icon: Users, label: 'Enrollment', value: `${cls.students?.length || 0}/${cls.capacity}` },
              { icon: Users, label: 'Teacher', value: cls.teacher?.name || 'N/A' },
              { icon: Calendar, label: 'Schedule', value: cls.schedule?.length > 0 ? `${cls.schedule.length} sessions` : 'Not set' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Enrolled Students ({cls.students?.length || 0})</h3>
          <button onClick={openEnroll} className="btn-primary text-sm"><UserPlus className="w-4 h-4" /> Enroll Student</button>
        </div>
        {cls.students?.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No students enrolled yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">ID</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cls.students?.map(s => (
                  <tr key={s._id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <Link to={`/students/${s._id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600">{s.name}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400 hidden sm:table-cell">{s.studentId}</td>
                    <td className="px-4 py-3 hidden md:table-cell"><Badge label={s.status} variant={s.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleUnenroll(s._id)} className="btn-ghost p-1.5 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="Enroll Student" size="sm">
        <div className="space-y-4">
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="select">
            <option value="">Select a student</option>
            {allStudents.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
          </select>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowEnrollModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleEnroll} disabled={!selectedStudent || enrolling} className="btn-primary">
              {enrolling && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />} Enroll
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
