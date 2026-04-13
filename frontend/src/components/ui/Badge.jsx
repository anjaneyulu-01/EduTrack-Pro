const variants = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  graduated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  suspended: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  excused: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  graded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  missing: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  upcoming: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ongoing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  draft: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  quiz: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  midterm: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  final: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  assignment: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  project: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function Badge({ label, variant }) {
  const cls = variants[variant?.toLowerCase()] || variants.inactive;
  return <span className={`badge ${cls}`}>{label}</span>;
}
