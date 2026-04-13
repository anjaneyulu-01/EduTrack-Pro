import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GraduationCap, Eye, EyeOff, Sun, Moon, User, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'student', label: 'Student', icon: BookOpen, desc: 'Track your classes, grades & submissions', gradient: 'from-emerald-500 to-teal-600' },
  { value: 'teacher', label: 'Teacher', icon: User, desc: 'Manage classes, exams & student grades', gradient: 'from-blue-500 to-indigo-600' },
  { value: 'admin', label: 'Admin', icon: Shield, desc: 'Full access to all system features', gradient: 'from-violet-500 to-purple-600' },
];

export default function Register() {
  const { register: signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ defaultValues: { role: 'student' } });
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup({ ...data, role: selectedRole });
      toast.success(`Welcome! Your ${selectedRole} account has been created.`);
      navigate(selectedRole === 'student' ? '/student' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <button onClick={toggleTheme} className="fixed top-4 right-4 btn-ghost p-2.5 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
      </button>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EduManage</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create your account</p>
        </div>

        <div className="card p-8">
          {/* Role Selector */}
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">I am a...</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {ROLES.map(role => {
              const Icon = role.icon;
              return (
                <button key={role.value} type="button" onClick={() => setSelectedRole(role.value)}
                  className={`relative p-3 rounded-xl border-2 text-center transition-all duration-200 ${selectedRole === role.value
                    ? 'border-transparent shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  style={selectedRole === role.value ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : {}}>
                  {selectedRole === role.value && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${role.gradient} opacity-10`} />
                  )}
                  <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center mb-1.5 ${selectedRole === role.value ? `bg-gradient-to-br ${role.gradient}` : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Icon className={`w-4 h-4 ${selectedRole === role.value ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <p className={`text-xs font-semibold ${selectedRole === role.value ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{role.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block">{role.desc.split(' ').slice(0, 3).join(' ')}...</p>
                </button>
              );
            })}
          </div>

          {/* Student info banner */}
          {selectedRole === 'student' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30 mb-5">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                🎓 As a student, you'll get access to your personal dashboard with grades, classes, attendance, and submissions.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input {...register('name', { required: 'Name is required' })} placeholder="John Doe" className="input" />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email address</label>
                <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" placeholder="john@school.com" className="input" />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {selectedRole === 'student' && (
                <>
                  <div>
                    <label className="label">Phone (optional)</label>
                    <input {...register('phone')} placeholder="+1 234 567 890" className="input" />
                  </div>
                  <div>
                    <label className="label">Date of Birth (optional)</label>
                    <input {...register('dateOfBirth')} type="date" className="input" />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select {...register('gender')} className="select">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">City (optional)</label>
                    <input {...register('address.city')} placeholder="New York" className="input" />
                  </div>
                </>
              )}

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input pr-10" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input {...register('confirmPassword', { required: 'Required', validate: v => v === password || 'Passwords do not match' })} type="password" placeholder="••••••••" className="input" />
                {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full justify-center py-2.5 mt-2 btn-primary bg-gradient-to-r ${ROLES.find(r => r.value === selectedRole)?.gradient || 'from-primary-500 to-violet-600'} border-0`}>
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `Create ${selectedRole} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
