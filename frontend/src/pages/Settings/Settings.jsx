import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Moon, Sun, Bell, Shield, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || '', avatar: user?.avatar || '' }
  });

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, watch, reset: resetPwd } = useForm();
  const newPassword = watch('newPassword');

  const onProfileSave = async (data) => {
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', data);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingProfile(false); }
  };

  const onPasswordSave = async (data) => {
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed');
      resetPwd();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPassword(false); }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'appearance', icon: Sun, label: 'Appearance' },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{user?.role} • {user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfile(onProfileSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input {...regProfile('name', { required: 'Required' })} className="input" />
                {profileErrors.name && <p className="text-rose-500 text-xs mt-1">{profileErrors.name.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...regProfile('phone')} className="input" placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="label">Avatar URL</label>
                <input {...regProfile('avatar')} className="input" placeholder="https://..." />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={handlePwd(onPasswordSave)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input {...regPwd('currentPassword', { required: 'Required' })} type="password" className="input" placeholder="••••••••" />
              {pwdErrors.currentPassword && <p className="text-rose-500 text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...regPwd('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input" placeholder="••••••••" />
              {pwdErrors.newPassword && <p className="text-rose-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input {...regPwd('confirmPassword', { required: 'Required', validate: v => v === newPassword || 'Passwords must match' })} type="password" className="input" placeholder="••••••••" />
              {pwdErrors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{pwdErrors.confirmPassword.message}</p>}
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingPassword} className="btn-primary">
                {savingPassword ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Theme</h3>
              <p className="text-sm text-gray-400 mt-0.5">Choose between light and dark mode</p>
            </div>
            <button onClick={toggleTheme} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-7' : ''}`}>
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              </span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {['light', 'dark'].map(t => (
              <button key={t} onClick={() => t !== theme && toggleTheme()}
                className={`p-4 rounded-xl border-2 transition-all ${theme === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <div className={`h-16 rounded-lg mb-3 ${t === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-900'}`}>
                  <div className={`h-3 w-full rounded-t-lg ${t === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`} />
                  <div className="flex gap-1 p-2">
                    <div className={`h-2 rounded w-1/3 ${t === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />
                    <div className={`h-2 rounded w-1/4 ${t === 'light' ? 'bg-primary-200' : 'bg-primary-900'}`} />
                  </div>
                </div>
                <p className={`text-sm font-medium capitalize ${theme === t ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>{t} Mode</p>
                {theme === t && <p className="text-xs text-primary-500 mt-0.5">Active</p>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
