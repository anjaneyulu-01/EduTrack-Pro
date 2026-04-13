import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Award, TrendingUp, Filter } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

const GRADE_COLORS = { 'A+': '#10b981', 'A': '#059669', 'A-': '#34d399', 'B+': '#3b82f6', 'B': '#2563eb', 'B-': '#60a5fa', 'C+': '#f59e0b', 'C': '#d97706', 'C-': '#fbbf24', 'D': '#f97316', 'F': '#f43f5e' };

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (classFilter) params.classId = classFilter;
      const res = await api.get('/grades', { params });
      setGrades(res.data.data);
      if (classFilter) {
        const sum = await api.get(`/grades/summary/${classFilter}`);
        setSummary(sum.data.data);
      } else {
        setSummary(null);
      }
    } catch { }
    finally { setLoading(false); }
  }, [classFilter]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);
  useEffect(() => { api.get('/classes', { params: { limit: 100 } }).then(r => setClasses(r.data.data)).catch(() => {}); }, []);

  // Distribution chart data
  const distData = Object.entries(
    grades.reduce((acc, g) => { acc[g.letterGrade] = (acc[g.letterGrade] || 0) + 1; return acc; }, {})
  ).map(([grade, count]) => ({ grade, count, fill: GRADE_COLORS[grade] || '#94a3b8' }));

  // Performance trend
  const trendData = grades.slice(0, 20).reverse().map((g, i) => ({
    index: i + 1,
    score: g.percentage,
    student: g.student?.name,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Grades & Performance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{grades.length} grades recorded</p>
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="select w-full sm:w-52">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      {grades.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Graded', value: grades.length, color: 'text-primary-600' },
            { label: 'Average Score', value: `${grades.length ? (grades.reduce((s, g) => s + g.percentage, 0) / grades.length).toFixed(1) : 0}%`, color: 'text-emerald-600' },
            { label: 'Highest Score', value: `${grades.length ? Math.max(...grades.map(g => g.percentage)).toFixed(1) : 0}%`, color: 'text-amber-600' },
            { label: 'Pass Rate', value: `${grades.length ? ((grades.filter(g => g.percentage >= 60).length / grades.length) * 100).toFixed(0) : 0}%`, color: 'text-violet-600' },
          ].map(item => (
            <div key={item.label} className="card p-5 text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
          {distData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [v, 'Count']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No grade data</div>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Score Trend (Recent)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="index" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [`${v}%`, 'Score']} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No data</div>}
        </div>
      </div>

      {/* Grades Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">All Grades</h3>
        </div>
        {loading ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Exam</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Class</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">%</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Feedback</th>
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
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{g.exam?.title}</p>
                      <Badge label={g.exam?.type || ''} variant={g.exam?.type || ''} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{g.class?.name}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">{g.marksObtained}/{g.totalMarks}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{g.percentage}%</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div className="h-1.5 rounded-full" style={{ width: `${g.percentage}%`, backgroundColor: GRADE_COLORS[g.letterGrade] || '#6366f1' }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-base font-bold" style={{ color: GRADE_COLORS[g.letterGrade] || '#6366f1' }}>{g.letterGrade}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 hidden lg:table-cell truncate max-w-xs">{g.feedback || '—'}</td>
                  </tr>
                ))}
                {grades.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No grades recorded</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
