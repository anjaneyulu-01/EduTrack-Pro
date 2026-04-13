import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/me/classes')
      .then(res => { setClasses(res.data.data); if (res.data.data.length > 0) setSelected(res.data.data[0]._id); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const selectedClass = classes.find(c => c._id === selected);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Classes</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enrolled in {classes.length} class{classes.length !== 1 ? 'es' : ''}</p>
      </div>

      {classes.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">You're not enrolled in any classes yet</p>
          <p className="text-sm text-gray-400 mt-1">Contact your administrator to get enrolled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class list */}
          <div className="space-y-3">
            {classes.map(cls => (
              <button key={cls._id} onClick={() => setSelected(cls._id)}
                className={`w-full card p-4 text-left transition-all duration-200 hover:shadow-md ${selected === cls._id ? 'ring-2 ring-emerald-500' : ''}`}>
                <div className="h-1 rounded-full mb-3" style={{ backgroundColor: cls.coverColor || '#6366f1' }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{cls.name}</p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{cls.code}</p>
                    <p className="text-xs text-gray-500 mt-1">{cls.subject}</p>
                  </div>
                  <Badge label={cls.status} variant={cls.status} />
                </div>
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{cls.students?.length || 0} students</span>
                  <span className="mx-1">•</span>
                  <span>{cls.semester} {cls.year}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Class Detail */}
          {selectedClass && (
            <div className="lg:col-span-2 space-y-4">
              {/* Header card */}
              <div className="card overflow-hidden">
                <div className="h-2" style={{ backgroundColor: selectedClass.coverColor || '#6366f1' }} />
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedClass.name}</h2>
                  <p className="font-mono text-sm text-gray-400">{selectedClass.code} • {selectedClass.subject}</p>
                  {selectedClass.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{selectedClass.description}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Badge label={selectedClass.status} variant={selectedClass.status} />
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{selectedClass.semester} {selectedClass.year}</span>
                  </div>
                </div>
              </div>

              {/* Teacher card */}
              {selectedClass.teacher && (
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Teacher</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {selectedClass.teacher.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedClass.teacher.name}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5" /><span>{selectedClass.teacher.email}</span>
                        </div>
                        {selectedClass.teacher.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-3.5 h-3.5" /><span>{selectedClass.teacher.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule */}
              {selectedClass.schedule?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Class Schedule</h3>
                  <div className="space-y-3">
                    {selectedClass.schedule.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.day}</p>
                          <p className="text-xs text-gray-400">{s.startTime} – {s.endTime} {s.room && `• ${s.room}`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Classmates */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Classmates ({selectedClass.students?.length || 0})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedClass.students?.slice(0, 10).map(s => (
                    <div key={s._id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                        <p className="text-xs font-mono text-gray-400">{s.studentId}</p>
                      </div>
                    </div>
                  ))}
                  {(selectedClass.students?.length || 0) > 10 && (
                    <p className="text-xs text-gray-400 p-2">+{selectedClass.students.length - 10} more classmates</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
