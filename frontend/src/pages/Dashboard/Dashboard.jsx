import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, FileText, BarChart3, Calendar, TrendingUp, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';
import StatsCard from '../../components/ui/StatsCard';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';

const GRADE_COLORS = { 'A+': '#10b981', 'A': '#059669', 'A-': '#34d399', 'B+': '#3b82f6', 'B': '#2563eb', 'B-': '#60a5fa', 'C+': '#f59e0b', 'C': '#d97706', 'C-': '#fbbf24', 'D': '#f97316', 'F': '#f43f5e' };

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const { stats, upcomingExams, recentStudents, recentGrades, gradeDistribution, monthlyEnrollment } = data;

  const pieData = gradeDistribution.map(g => ({ name: g._id, value: g.count, color: GRADE_COLORS[g._id] || '#94a3b8' }));
  const enrollmentData = monthlyEnrollment.map(m => ({ month: monthNames[m._id.month - 1], students: m.count }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening at your institution today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.totalStudents} icon={Users} color="primary" trend="up" trendValue="+12%" subtitle="this month" />
        <StatsCard title="Active Classes" value={stats.totalClasses} icon={BookOpen} color="emerald" subtitle="currently running" />
        <StatsCard title="Total Exams" value={stats.totalExams} icon={ClipboardList} color="amber" subtitle="all time" />
        <StatsCard title="Avg. Grade" value={`${stats.avgGrade}%`} icon={Award} color="violet" trend="up" trendValue="+3.2%" subtitle="vs last month" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Active Students" value={stats.activeStudents} icon={TrendingUp} color="cyan" subtitle="enrolled now" />
        <StatsCard title="Submissions" value={stats.totalSubmissions} icon={FileText} color="rose" subtitle="total received" />
        <StatsCard title="Present Today" value={stats.todayAttendance} icon={Calendar} color="emerald" subtitle="students checked in" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment trend */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Student Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={enrollmentData}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2} fill="url(#colorStudents)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, `Grade ${n}`]} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend formatter={(v) => <span className="text-xs">Grade {v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-gray-400 text-sm">No grade data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Exams</h3>
            <Link to="/exams" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">View all</Link>
          </div>
          {upcomingExams.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map(exam => (
                <Link key={exam._id} to={`/exams/${exam._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{exam.title}</p>
                    <p className="text-xs text-gray-400">{exam.class?.name} • {new Date(exam.date).toLocaleDateString()}</p>
                  </div>
                  <Badge label={exam.type} variant={exam.type} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Students */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Students</h3>
            <Link to="/students" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">View all</Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No students yet</p>
          ) : (
            <div className="space-y-3">
              {recentStudents.map(student => (
                <Link key={student._id} to={`/students/${student._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.studentId}</p>
                  </div>
                  <Badge label={student.status} variant={student.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
