import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, User, BookOpen, Award, Clock, FileText } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get(`/students/${id}`),
      api.get(`/students/${id}/stats`)
    ]).then(([sRes, stRes]) => {
      setStudent(sRes.data.data);
      setStats(stRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!student) return <div className="text-center py-16 text-gray-400">Student not found</div>;

  const tabs = ['overview', 'grades', 'attendance', 'submissions'];

  const gradeChartData = stats?.grades?.slice(0, 10).map(g => ({
    name: g.exam?.title?.slice(0, 12) || 'Exam',
    score: g.percentage,
    marks: g.marksObtained,
  })) || [];

  const attendanceSummary = {
    present: stats?.attendance?.filter(a => a.status === 'present').length || 0,
    absent: stats?.attendance?.filter(a => a.status === 'absent').length || 0,
    late: stats?.attendance?.filter(a => a.status === 'late').length || 0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/students" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Link>

      {/* Profile Hero */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
                <p className="text-gray-400 font-mono text-sm mt-0.5">{student.studentId}</p>
              </div>
              <Badge label={student.status} variant={student.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { icon: Mail, label: student.email },
                { icon: Phone, label: student.phone || 'N/A' },
                { icon: Calendar, label: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A' },
                { icon: MapPin, label: [student.address?.city, student.address?.country].filter(Boolean).join(', ') || 'N/A' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          {[
            { label: 'Classes', value: student.classes?.length || 0, color: 'text-primary-600' },
            { label: 'Avg Grade', value: `${stats?.avgGrade || 0}%`, color: 'text-emerald-600' },
            { label: 'Attendance', value: `${stats?.attendanceRate || 0}%`, color: 'text-amber-600' },
            { label: 'Submissions', value: stats?.submissions?.length || 0, color: 'text-violet-600' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Info</h3>
            <dl className="space-y-3">
              {[
                ['Gender', student.gender],
                ['Guardian', student.guardianName || 'N/A'],
                ['Guardian Phone', student.guardianPhone || 'N/A'],
                ['Enrollment Date', new Date(student.enrollmentDate).toLocaleDateString()],
                ['GPA', student.gpa?.toFixed(2) || '0.00'],
              ].map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <dt className="text-sm text-gray-500">{key}</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white capitalize">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Enrolled Classes</h3>
            {student.classes?.length === 0 ? <p className="text-sm text-gray-400">No classes enrolled</p> : (
              <div className="space-y-2">
                {student.classes?.map(cls => (
                  <Link key={cls._id} to={`/classes/${cls._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cls.name}</p>
                      <p className="text-xs text-gray-400">{cls.code} • {cls.subject}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grade History</h3>
          {gradeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [`${v}%`, 'Score']} />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No grades recorded</p>}
          <div className="mt-4 space-y-2">
            {stats?.grades?.map(g => (
              <div key={g._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{g.exam?.title}</p>
                  <p className="text-xs text-gray-400">{g.class?.name} • {g.exam?.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{g.marksObtained}/{g.totalMarks}</p>
                  <p className="text-xs text-primary-500 font-medium">{g.letterGrade} ({g.percentage}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Present', value: attendanceSummary.present, color: 'bg-emerald-500' },
              { label: 'Absent', value: attendanceSummary.absent, color: 'bg-rose-500' },
              { label: 'Late', value: attendanceSummary.late, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label} className="card p-4 text-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance Log</h3>
            <div className="space-y-2">
              {stats?.attendance?.slice(0, 20).map(a => (
                <div key={a._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">{new Date(a.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{a.class?.name}</p>
                  </div>
                  <Badge label={a.status} variant={a.status} />
                </div>
              ))}
              {(!stats?.attendance || stats.attendance.length === 0) && <p className="text-sm text-gray-400 text-center py-6">No attendance records</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Submissions</h3>
          <div className="space-y-3">
            {stats?.submissions?.map(s => (
              <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.exam?.title}</p>
                  <p className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleDateString()}</p>
                </div>
                <Badge label={s.status} variant={s.status} />
              </div>
            ))}
            {(!stats?.submissions || stats.submissions.length === 0) && <p className="text-sm text-gray-400 text-center py-8">No submissions yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}
