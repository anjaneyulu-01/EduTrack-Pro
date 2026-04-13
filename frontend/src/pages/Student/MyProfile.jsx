import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, X, BookOpen, Hash } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchProfile = async () => {
    try {
      const res = await api.get('/me/profile');
      setProfile(res.data.data);
      reset(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile not found');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.put('/me/profile', {
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
        address: data.address,
        notes: data.notes,
      });
      setProfile(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;
  if (!profile) return (
    <div className="text-center py-16">
      <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p className="text-gray-500">Student profile not linked to your account.</p>
      <p className="text-sm text-gray-400 mt-1">Please contact your administrator.</p>
    </div>
  );

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="section-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your student information</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-secondary">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <button onClick={() => { setEditing(false); reset(profile); }} className="btn-secondary text-rose-500">
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      {/* Profile Hero */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{profile.email}</p>
              </div>
              <Badge label={profile.status} variant={profile.status} />
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Hash className="w-4 h-4 text-emerald-500" />
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{profile.studentId}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>{profile.classes?.length || 0} classes enrolled</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Enrolled {new Date(profile.enrollmentDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Classes */}
      {profile.classes?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Enrolled Classes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.classes.map(cls => (
              <div key={cls._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="w-3 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: cls.coverColor || '#6366f1' }} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{cls.name}</p>
                  <p className="text-xs text-gray-400">{cls.code} • {cls.semester} {cls.year}</p>
                </div>
                <Badge label={cls.status} variant={cls.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Info */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-5 space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input value={profile.name} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={profile.email} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              {editing ? <input {...register('phone')} className="input" placeholder="+1 234 567 890" /> :
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 py-2.5">{profile.phone || <span className="text-gray-400">Not set</span>}</div>}
            </div>
            <div>
              <label className="label">Date of Birth</label>
              {editing ? <input {...register('dateOfBirth')} type="date" className="input" /> :
                <div className="text-sm text-gray-700 dark:text-gray-300 py-2.5">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : <span className="text-gray-400">Not set</span>}</div>}
            </div>
            <div>
              <label className="label">Gender</label>
              {editing ? (
                <select {...register('gender')} className="select">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : <div className="text-sm text-gray-700 dark:text-gray-300 py-2.5 capitalize">{profile.gender}</div>}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'address.street', label: 'Street', placeholder: '123 Main St' },
              { key: 'address.city', label: 'City', placeholder: 'New York' },
              { key: 'address.state', label: 'State', placeholder: 'NY' },
              { key: 'address.country', label: 'Country', placeholder: 'USA' },
              { key: 'address.zipCode', label: 'ZIP Code', placeholder: '10001' },
            ].map(field => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                {editing ? <input {...register(field.key)} className="input" placeholder={field.placeholder} /> :
                  <div className="text-sm text-gray-700 dark:text-gray-300 py-2.5">
                    {field.key.split('.').reduce((o, k) => o?.[k], profile) || <span className="text-gray-400">Not set</span>}
                  </div>}
              </div>
            ))}
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Guardian / Parent</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'guardianName', label: 'Name', placeholder: 'Guardian name' },
              { key: 'guardianPhone', label: 'Phone', placeholder: '+1 234 567 890' },
              { key: 'guardianEmail', label: 'Email', placeholder: 'guardian@email.com' },
            ].map(field => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                {editing ? <input {...register(field.key)} className="input" placeholder={field.placeholder} /> :
                  <div className="text-sm text-gray-700 dark:text-gray-300 py-2.5">{profile[field.key] || <span className="text-gray-400">Not set</span>}</div>}
              </div>
            ))}
          </div>

          {editing && (
            <>
              <hr className="border-gray-100 dark:border-gray-700" />
              <div>
                <label className="label">Notes</label>
                <textarea {...register('notes')} rows={3} className="textarea" placeholder="Any additional notes..." />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary" style={{ backgroundColor: '#10b981' }}>
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
