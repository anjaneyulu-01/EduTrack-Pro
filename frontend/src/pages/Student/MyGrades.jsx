import { useState, useEffect } from 'react';
import { Award, TrendingUp, BookOpen, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

const GRADE_COLORS = { 'A+': '#10b981', 'A': '#059669', 'A-': '#34d399', 'B+': '#3b82f6', 'B': '#2563eb', 'B-': '#60a5fa', 'C+': '#f59e0b', 'C': '#d97706', 'C-': '#fbbf24', 'D': '#f97316', 'F': '#f43f5e' };
const GPA_SCALE = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };

export default function MyGrades() {
  const [grades, setGrades] = useState([]);
  const [classGPA, setClassGPA] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    api.get('/me/grades').then(res => { setGrades(res.data.data); setClassGPA(res.data.classGPA || []); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const uniqueClasses = [...new Map(grades.map(g => [g.class?._id, g.class])).values()].filter(Boolean);
  const filtered = classFilter ? grades.filter(g => g.class?._id === classFilter) : grades;

  const avgGrade = filtered.length ? (filtered.reduce((s, g) => s + g.percentage, 0) / filtered.length).toFixed(1) : 0;
  const gpa = filtered.length ? (filtered.reduce((s, g) => s + (g.gradePoints || 0), 0) / filtered.length).toFixed(2) : '0.00';
  const highest = filtered.length ? Math.max(...filtered.map(g => g.percentage)) : 0;

  // Chart data
  const trendData = filtered.slice().reverse().slice(0, 10).map((g, i) => ({
    name: g.exam?.title?.slice(0, 10) || `#${i + 1}`,
    score: g.percentage,
    gp: g.gradePoints,
  }));

  const radarData = classGPA.map(c => ({ subject: c.name?.split(' ')[0] || 'Class', score: parseFloat(c.avgScore) }));

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Grades</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{grades.length} grades recorded</p>
      </div>

      {/* GPA Banner */}
      <div className="card p-5 bg-gradient-to-br from-primary-500 to-violet-600 text-white border-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'GPA', value: gpa, sublabel: 'out of 4.0' },
            { label: 'Average', value: `${avgGrade}%`, sublabel: 'overall' },
            { label: 'Highest', value: `${highest}%`, sublabel: 'best score' },
            { label: 'Graded', value: filtered.length, sublabel: 'exams' },
          ].map(item => (
            <div key={item.label} className="bg-white/20 rounded-2xl py-3 px-2">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-white/70 mt-0.5">{item.label}</p>
              <p className="text-xs text-white/50">{item.sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Score Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [`${v}%`, 'Score']} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No data yet</div>}
        </div>

        {radarData.length >= 3 ? (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance by Class</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99,102,241,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [`${v}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance by Class</h3>
            <div className="space-y-3 mt-4">
              {classGPA.map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{c.name}</p>
                      <p className="text-sm font-bold text-primary-600">{c.avgScore}%</p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${c.avgScore}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {classGPA.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No class data</p>}
            </div>
          </div>
        )}
      </div>

      {/* Filter + Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Grade Details</h3>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="select w-auto text-sm">
            <option value="">All Classes</option>
            {uniqueClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No grades yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(g => (
              <div key={g._id} className="p-4 flex flex-wrap items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                {/* Grade letter */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-xl border-2"
                  style={{ color: GRADE_COLORS[g.letterGrade] || '#6366f1', borderColor: (GRADE_COLORS[g.letterGrade] || '#6366f1') + '40', backgroundColor: (GRADE_COLORS[g.letterGrade] || '#6366f1') + '10' }}>
                  {g.letterGrade}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{g.exam?.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <p className="text-xs text-gray-400">{g.class?.name}</p>
                    <Badge label={g.exam?.type || ''} variant={g.exam?.type || ''} />
                    <p className="text-xs text-gray-400">{new Date(g.gradedAt || g.createdAt).toLocaleDateString()}</p>
                  </div>
                  {g.feedback && <p className="text-xs text-gray-500 mt-1 italic">💬 "{g.feedback}"</p>}
                </div>
                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{g.marksObtained}/{g.totalMarks}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${g.percentage}%`, backgroundColor: GRADE_COLORS[g.letterGrade] || '#6366f1' }} />
                    </div>
                    <span className="text-xs text-gray-500">{g.percentage}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">GPA: {g.gradePoints?.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
