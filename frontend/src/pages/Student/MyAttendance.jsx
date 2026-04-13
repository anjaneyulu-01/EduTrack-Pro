import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  useEffect(() => {
    const params = {};
    if (classFilter) params.classId = classFilter;
    api.get('/me/attendance', { params })
      .then(res => { setRecords(res.data.data); setBreakdown(res.data.breakdown || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [classFilter]);

  useEffect(() => {
    api.get('/me/classes').then(res => setClasses(res.data.data)).catch(() => {});
  }, []);

  const filtered = monthFilter
    ? records.filter(r => new Date(r.date).getMonth() === parseInt(monthFilter))
    : records;

  const stats = {
    present: filtered.filter(r => r.status === 'present').length,
    absent: filtered.filter(r => r.status === 'absent').length,
    late: filtered.filter(r => r.status === 'late').length,
    excused: filtered.filter(r => r.status === 'excused').length,
    total: filtered.length,
  };
  stats.rate = stats.total ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  // Weekly chart — last 4 weeks
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const weekRecords = records.filter(r => new Date(r.date) >= start && new Date(r.date) <= end);
    return {
      week: `W${4 - i}`,
      present: weekRecords.filter(r => r.status === 'present').length,
      absent: weekRecords.filter(r => r.status === 'absent').length,
      late: weekRecords.filter(r => r.status === 'late').length,
    };
  }).reverse();

  // Group records by month
  const byMonth = {};
  filtered.forEach(r => {
    const key = new Date(r.date).toLocaleDateString('en', { month: 'long', year: 'numeric' });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(r);
  });

  const STATUS_COLOR = { present: '#10b981', absent: '#f43f5e', late: '#f59e0b', excused: '#3b82f6' };
  const STATUS_ICON = { present: CheckCircle, absent: XCircle, late: Clock, excused: Shield };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Attendance</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{records.length} records total</p>
      </div>

      {/* Overall Rate Banner */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none"
                stroke={parseFloat(stats.rate) >= 75 ? '#10b981' : parseFloat(stats.rate) >= 60 ? '#f59e0b' : '#f43f5e'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${stats.rate} ${100 - parseFloat(stats.rate)}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.rate}%</span>
              <span className="text-xs text-gray-400">Rate</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full">
            {[
              { label: 'Present', value: stats.present, color: STATUS_COLOR.present, Icon: CheckCircle },
              { label: 'Absent', value: stats.absent, color: STATUS_COLOR.absent, Icon: XCircle },
              { label: 'Late', value: stats.late, color: STATUS_COLOR.late, Icon: Clock },
              { label: 'Excused', value: stats.excused, color: STATUS_COLOR.excused, Icon: Shield },
            ].map(item => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <item.Icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
                <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Class Breakdown */}
      {breakdown.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance by Class</h3>
          <div className="space-y-4">
            {breakdown.map((cls, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cls.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${parseFloat(cls.rate) >= 75 ? 'text-emerald-500' : parseFloat(cls.rate) >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{cls.rate}%</span>
                    <span className="text-xs text-gray-400">{cls.present}/{cls.total}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${cls.rate}%`,
                    backgroundColor: parseFloat(cls.rate) >= 75 ? '#10b981' : parseFloat(cls.rate) >= 60 ? '#f59e0b' : '#f43f5e'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Overview (Last 4 Weeks)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeks} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
            <Bar dataKey="absent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Absent" />
            <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="select flex-1 min-w-36">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="select flex-1 min-w-36">
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(2024, i).toLocaleString('en', { month: 'long' })}</option>
          ))}
        </select>
      </div>

      {/* Records by month */}
      {Object.keys(byMonth).length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-400">No attendance records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byMonth).map(([month, monthRecords]) => (
            <div key={month} className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{month}</h3>
                <span className="text-xs text-gray-400">{monthRecords.filter(r => r.status === 'present').length}/{monthRecords.length} present</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {monthRecords.map(r => {
                  const Icon = STATUS_ICON[r.status] || CheckCircle;
                  return (
                    <div key={r._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" style={{ color: STATUS_COLOR[r.status] }} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(r.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-gray-400">{r.class?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.notes && <span className="text-xs text-gray-400 hidden sm:block">{r.notes}</span>}
                        <Badge label={r.status} variant={r.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
