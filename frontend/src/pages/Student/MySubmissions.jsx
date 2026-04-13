import { useState, useEffect } from 'react';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [pendingExams, setPendingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm();
  const selectedExamId = watch('exam');

  const fetchData = async () => {
    try {
      const res = await api.get('/me/submissions');
      setSubmissions(res.data.data);
      setPendingExams(res.data.pendingExams || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedExamId) {
      const exam = pendingExams.find(e => e._id === selectedExamId);
      setSelectedExam(exam || null);
    }
  }, [selectedExamId, pendingExams]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.post('/me/submissions', { exam: data.exam, content: data.content });
      toast.success('Submission sent!');
      setShowModal(false);
      reset();
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSaving(false); }
  };

  const filtered = statusFilter ? submissions.filter(s => s.status === statusFilter) : submissions;

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => ['submitted', 'resubmitted'].includes(s.status)).length,
    graded: submissions.filter(s => s.status === 'graded').length,
    late: submissions.filter(s => s.status === 'late').length,
  };

  const STATUS_ICONS = {
    submitted: <CheckCircle className="w-4 h-4 text-blue-500" />,
    graded: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    late: <Clock className="w-4 h-4 text-amber-500" />,
    missing: <AlertCircle className="w-4 h-4 text-rose-500" />,
    resubmitted: <Send className="w-4 h-4 text-violet-500" />,
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">My Submissions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{submissions.length} total submissions</p>
        </div>
        {pendingExams.length > 0 && (
          <button onClick={() => { reset(); setShowModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> New Submission
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Submitted', value: stats.submitted, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Graded', value: stats.graded, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Late', value: stats.late, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(item => (
          <div key={item.label} className={`card p-4 text-center cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setStatusFilter(s => s === item.label.toLowerCase() ? '' : item.label.toLowerCase())}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Exams alert */}
      {pendingExams.length > 0 && (
        <div className="card p-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">{pendingExams.length} exam{pendingExams.length !== 1 ? 's' : ''} pending submission</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pendingExams.map(e => (
                  <button key={e._id} onClick={() => { reset({ exam: e._id }); setShowModal(true); }}
                    className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 transition-colors">
                    📝 {e.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex gap-2 flex-wrap items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
        {['', 'submitted', 'graded', 'late', 'missing', 'resubmitted'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${statusFilter === s ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-400">No submissions found</p>
          {pendingExams.length > 0 && (
            <button onClick={() => setShowModal(true)} className="mt-4 btn-primary mx-auto text-sm">
              <Plus className="w-4 h-4" /> Make a Submission
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s._id} className="card p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-wrap items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (s.class?.coverColor || '#6366f1') + '20' }}>
                  <FileText className="w-5 h-5" style={{ color: s.class?.coverColor || '#6366f1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{s.exam?.title}</h3>
                    <Badge label={s.exam?.type || ''} variant={s.exam?.type || ''} />
                    {s.isLate && <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Late</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{s.class?.name}</p>
                  <p className="text-xs text-gray-400">Submitted: {new Date(s.submittedAt).toLocaleString()}</p>
                  {s.content && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{s.content}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    {STATUS_ICONS[s.status]}
                    <Badge label={s.status} variant={s.status} />
                  </div>
                  {s.grade && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{s.grade.marksObtained}/{s.grade.totalMarks}</p>
                      <p className="text-xs text-primary-500 font-medium">{s.grade.letterGrade} ({s.grade.percentage}%)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit Assignment / Exam" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Select Exam / Assignment</label>
            <select {...register('exam', { required: true })} className="select">
              <option value="">Choose exam to submit...</option>
              {pendingExams.map(e => (
                <option key={e._id} value={e._id}>
                  {e.title} — {e.class?.name} (Due: {new Date(e.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">{selectedExam.title}</p>
              <p className="text-xs text-blue-500 mt-0.5">
                {selectedExam.totalMarks} marks • Due: {new Date(selectedExam.date).toLocaleDateString()}
                {new Date() > new Date(selectedExam.date) && <span className="ml-2 text-amber-500">⚠️ Past due — will be marked late</span>}
              </p>
              {selectedExam.description && <p className="text-xs text-blue-500 mt-1">{selectedExam.description}</p>}
            </div>
          )}

          <div>
            <label className="label">Your Answer / Notes</label>
            <textarea
              {...register('content', { required: 'Please write something' })}
              rows={6}
              className="textarea"
              placeholder="Write your answer, notes, or describe your submission here...&#10;&#10;If submitting a physical document, describe it here."
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
