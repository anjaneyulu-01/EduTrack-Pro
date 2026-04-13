import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Award, CheckCircle, Users, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const fetchExam = async () => {
    try {
      const res = await api.get(`/exams/${id}`);
      setExam(res.data.data);
      setGrades(res.data.grades || []);
    } catch { toast.error('Failed to load exam'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExam(); }, [id]);

  const openGrade = async () => {
    if (exam?.class?.students) setStudents(exam.class.students);
    reset({ totalMarks: exam?.totalMarks, class: exam?.class?._id, exam: id });
    setShowGradeModal(true);
  };

  const onGradeSubmit = async (data) => {
    setSaving(true);
    try {
      await api.post('/grades', data);
      toast.success('Grade saved');
      setShowGradeModal(false);
      fetchExam();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save grade'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  if (!exam) return <div className="text-center py-16 text-gray-400">Exam not found</div>;

  const avg = grades.length ? (grades.reduce((s, g) => s + g.percentage, 0) / grades.length).toFixed(1) : 0;
  const passing = grades.filter(g => g.percentage >= exam.passingMarks / exam.totalMarks * 100).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/exams" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400">
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{exam.class?.name} ({exam.class?.code})</p>
            {exam.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{exam.description}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge label={exam.type} variant={exam.type} />
            <Badge label={exam.status} variant={exam.status} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          {[
            { icon: Calendar, label: 'Date', value: new Date(exam.date).toLocaleDateString() },
            { icon: Clock, label: 'Duration', value: `${exam.duration} mins` },
            { icon: Award, label: 'Total Marks', value: exam.totalMarks },
            { icon: CheckCircle, label: 'Passing', value: exam.passingMarks },
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

      {/* Grade Summary */}
      {grades.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Average Score', value: `${avg}%`, color: 'text-primary-600' },
            { label: 'Graded', value: grades.length, color: 'text-emerald-600' },
            { label: 'Passing', value: `${passing}/${grades.length}`, color: 'text-amber-600' },
          ].map(item => (
            <div key={item.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grades Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Grade Sheet ({grades.length})</h3>
          <button onClick={openGrade} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Grade</button>
        </div>
        {grades.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No grades recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-center">Marks</th>
                  <th className="px-4 py-3 text-center">Percentage</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(g => (
                  <tr key={g._id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {g.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{g.student?.name}</p>
                          <p className="text-xs font-mono text-gray-400">{g.student?.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">{g.marksObtained}/{g.totalMarks}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-2">
                          <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${g.percentage}%` }} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{g.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-sm ${g.gradePoints >= 3.7 ? 'text-emerald-500' : g.gradePoints >= 2.7 ? 'text-blue-500' : g.gradePoints >= 1.7 ? 'text-amber-500' : 'text-rose-500'}`}>{g.letterGrade}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">{g.feedback || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showGradeModal} onClose={() => setShowGradeModal(false)} title="Record Grade" size="md">
        <form onSubmit={handleSubmit(onGradeSubmit)} className="space-y-4">
          <input type="hidden" {...register('exam')} />
          <input type="hidden" {...register('class')} />
          <div>
            <label className="label">Student</label>
            <select {...register('student', { required: true })} className="select">
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Marks Obtained</label>
              <input {...register('marksObtained', { required: true, valueAsNumber: true })} type="number" className="input" placeholder="85" />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input {...register('totalMarks', { required: true, valueAsNumber: true })} type="number" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Feedback</label>
            <textarea {...register('feedback')} rows={2} className="textarea" placeholder="Great improvement! Keep it up..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowGradeModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />} Save Grade
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
