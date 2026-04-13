import { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Clock, Award, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

const TYPE_ICONS = { quiz: '📝', midterm: '📋', final: '🎓', assignment: '📌', project: '🏗️', lab: '🔬' };
const GRADE_COLORS = { 'A+': '#10b981', 'A': '#059669', 'A-': '#34d399', 'B+': '#3b82f6', 'B': '#2563eb', 'B-': '#60a5fa', 'C+': '#f59e0b', 'C': '#d97706', 'C-': '#fbbf24', 'D': '#f97316', 'F': '#f43f5e' };

export default function MyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    api.get('/me/exams').then(res => setExams(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = exams.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (filter === 'upcoming') return ['upcoming', 'ongoing'].includes(e.status) && new Date(e.date) >= new Date();
    if (filter === 'graded') return e.myGrade !== null;
    if (filter === 'pending') return !e.myGrade && ['completed', 'ongoing'].includes(e.status);
    return true;
  });

  const upcoming = exams.filter(e => ['upcoming', 'ongoing'].includes(e.status) && new Date(e.date) >= new Date());
  const graded = exams.filter(e => e.myGrade);
  const avgScore = graded.length ? (graded.reduce((s, e) => s + e.myGrade.percentage, 0) / graded.length).toFixed(1) : 0;

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Exams</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{exams.length} total exams across all classes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Exams', value: exams.length, icon: ClipboardList, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Graded', value: graded.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: Award, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
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
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {['all', 'upcoming', 'graded', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
              {f}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="select w-auto text-xs">
          <option value="">All Types</option>
          {['quiz', 'midterm', 'final', 'assignment', 'project', 'lab'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      {/* Exams Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-400">No exams found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(exam => {
            const daysLeft = Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24));
            const isPast = new Date(exam.date) < new Date();
            return (
              <div key={exam._id} className={`card overflow-hidden hover:shadow-md transition-shadow duration-200 ${!isPast && daysLeft <= 3 ? 'ring-2 ring-amber-400/50' : ''}`}>
                <div className="h-1.5" style={{ backgroundColor: exam.class?.coverColor || '#6366f1' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{TYPE_ICONS[exam.type] || '📝'}</span>
                    <div className="flex flex-col items-end gap-1">
                      <Badge label={exam.status} variant={exam.status} />
                      {!isPast && daysLeft <= 7 && (
                        <span className={`text-xs font-medium ${daysLeft <= 3 ? 'text-rose-500' : 'text-amber-500'}`}>
                          {daysLeft <= 0 ? '⚡ Today!' : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{exam.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{exam.class?.name} ({exam.class?.code})</p>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(exam.date).toLocaleDateString()}</div>
                    {exam.duration > 0 && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration} minutes</div>}
                    <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> {exam.totalMarks} marks</div>
                  </div>

                  {/* Grade result */}
                  {exam.myGrade ? (
                    <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: (GRADE_COLORS[exam.myGrade.letterGrade] || '#6366f1') + '15' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Your Score</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{exam.myGrade.marksObtained}/{exam.myGrade.totalMarks}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold" style={{ color: GRADE_COLORS[exam.myGrade.letterGrade] || '#6366f1' }}>
                            {exam.myGrade.letterGrade}
                          </span>
                          <p className="text-xs text-gray-400">{exam.myGrade.percentage}%</p>
                        </div>
                      </div>
                      {exam.myGrade.feedback && (
                        <p className="text-xs text-gray-500 mt-2 italic">"{exam.myGrade.feedback}"</p>
                      )}
                    </div>
                  ) : !isPast ? (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {daysLeft <= 0 ? 'Exam is today!' : `Prepare! ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-xs text-gray-400">Not yet graded</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
