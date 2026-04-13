import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Award, Calendar, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';

const GRADE_COLORS = { 'A+': '#10b981', 'A': '#059669', 'A-': '#34d399', 'B+': '#3b82f6', 'B': '#2563eb', 'B-': '#60a5fa', 'C+': '#f59e0b', 'C': '#d97706', 'C-': '#fbbf24', 'D': '#f97316', 'F': '#f43f5e' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/me/dashboard')
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle className="w-12 h-12 text-amber-400" />
      <p className="text-gray-600 dark:text-gray-300 font-medium">{error}</p>
      <p className="text-sm text-gray-400">Contact your administrator to link your student profile.</p>
    </div>
  );

  const { stats, upcomingExams, recentGrades, recentSubmissions, gradeTrend, attendanceSummary } = data;

  const gradeHour = new Date().getHours();
  const greeting = gradeHour < 12 ? 'Good morning' : gradeHour < 18 ? 'Good afternoon' : 'Good evening';

  const attendancePieData = [
    { name: 'Present', value: attendanceSummary.present, color: '#10b981' },
    { name: 'Absent', value: attendanceSummary.absent, color: '#f43f5e' },
    { name: 'Late', value: attendanceSummary.late, color: '#f59e0b' },
    { name: 'Excused', value: attendanceSummary.excused, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium">{greeting}! 👋</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.name}</h1>
            <p className="text-emerald-100 text-sm mt-1">Student ID: {data.student?.studentId}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-2xl font-bold">{stats.avgGrade}%</p>
              <p className="text-xs text-emerald-100">Avg Grade</p>
            </div>
            <div className="bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
              <p className="text-xs text-emerald-100">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Classes', value: stats.totalClasses, icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20', link: '/student/classes' },
          { label: 'Upcoming Exams', value: stats.upcomingExams, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', link: '/student/exams' },
          { label: 'Submissions', value: stats.totalSubmissions, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', link: '/student/submissions' },
          { label: 'Pending', value: stats.pendingSubmissions, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', link: '/student/submissions' },
        ].map(item => (
          <Link key={item.label} to={item.link} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow duration-200">
            <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Grade Trend</h3>
            <Link to="/student/grades" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View all</Link>
          </div>
          {gradeTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={gradeTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [`${v}%`, 'Score']} />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} fill="url(#colorScore)" dot={{ fill: '#10b981', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No grades yet</div>
          )}
        </div>

        {/* Attendance Pie */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Attendance</h3>
            <Link to="/student/attendance" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">View all</Link>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={attendancePieData.length > 0 ? attendancePieData : [{ name: 'No data', value: 1, color: '#e5e7eb' }]}
                    cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value">
                    {(attendancePieData.length > 0 ? attendancePieData : [{ color: '#e5e7eb' }]).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: '10px', border: 'none', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{attendanceSummary.rate}%</span>
                <span className="text-xs text-gray-400">Present</span>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { label: 'Present', value: attendanceSummary.present, color: 'bg-emerald-500' },
              { label: 'Absent', value: attendanceSummary.absent, color: 'bg-rose-500' },
              { label: 'Late', value: attendanceSummary.late, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-gray-500">{item.label}</span>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Exams</h3>
            <Link to="/student/exams" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View all</Link>
          </div>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No upcoming exams</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map(exam => {
                const daysLeft = Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={exam._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (exam.class?.coverColor || '#6366f1') + '20' }}>
                      <ClipboardList className="w-5 h-5" style={{ color: exam.class?.coverColor || '#6366f1' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{exam.title}</p>
                      <p className="text-xs text-gray-400">{exam.class?.name} • {new Date(exam.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge label={exam.type} variant={exam.type} />
                      <p className={`text-xs mt-1 font-medium ${daysLeft <= 3 ? 'text-rose-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-gray-400'}`}>
                        {daysLeft <= 0 ? 'Today' : `${daysLeft}d left`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Grades</h3>
            <Link to="/student/grades" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View all</Link>
          </div>
          {recentGrades.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No grades yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGrades.map(g => (
                <div key={g._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-bold" style={{ color: GRADE_COLORS[g.letterGrade] || '#6366f1' }}>{g.letterGrade}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{g.exam?.title}</p>
                    <p className="text-xs text-gray-400">{g.class?.name} • {g.exam?.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{g.marksObtained}/{g.totalMarks}</p>
                    <p className="text-xs text-gray-400">{g.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
