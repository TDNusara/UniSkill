import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, authAPI, adminAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Mail,
  Lock,
  Building2,
  Code2,
  Share2,
  Globe,
  Save,
  KeyRound,
  Sparkles,
} from 'lucide-react';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department?._id || user?.department || '');
  const [degree, setDegree] = useState(user?.degree || user?.education?.[0]?.degree || '');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [batchYear, setBatchYear] = useState(user?.batchYear || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [officeLocation, setOfficeLocation] = useState(user?.officeLocation || '');
  const [researchInterestsInput, setResearchInterestsInput] = useState(
    user?.researchInterests ? user.researchInterests.join(', ') : ''
  );

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await adminAPI.getDepartments();
        if (res.data?.departments) {
          setDepartmentsList(res.data.departments);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepts();
  }, []);

  const selectedDept = departmentsList.find((d) => d._id === department);

  const [github, setGithub] = useState(user?.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [portfolio, setPortfolio] = useState(user?.socialLinks?.portfolio || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      const payload = {
        name,
        avatar,
        bio,
        phone,
        department: department || undefined,
        degree: user?.role === 'student' ? degree : undefined,
        studentId: user?.role === 'student' ? studentId : undefined,
        batchYear: user?.role === 'student' ? batchYear : undefined,
        socialLinks:
          user?.role === 'student'
            ? { github, linkedin, portfolio }
            : undefined,
        designation: user?.role === 'supervisor' ? designation : undefined,
        officeLocation: user?.role === 'supervisor' ? officeLocation : undefined,
        researchInterests:
          user?.role === 'supervisor'
            ? researchInterestsInput.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined,
      };

      const res = await userAPI.updateProfile(payload);
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters');
      return;
    }

    try {
      setPasswordSaving(true);
      await authAPI.updatePassword({ currentPassword, newPassword });
      showSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Account & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Update your public profile, social links, contact information, and security preferences.
        </p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bio & Academic Interests
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your academic background and project aspirations..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Department
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setDegree('');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              >
                <option value="">Select Department (e.g. SE, EEE, IT, CSE, DSAI...)</option>
                {departmentsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {user?.role === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Degree / Academic Program
                </label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  disabled={!department}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white disabled:opacity-50"
                >
                  {!department ? (
                    <option value="">Select Department first</option>
                  ) : selectedDept?.degrees && selectedDept.degrees.length > 0 ? (
                    <>
                      <option value="">Select Degree Program</option>
                      {selectedDept.degrees.map((deg, idx) => (
                        <option key={deg._id || idx} value={deg.name}>
                          {deg.name} {deg.code ? `(${deg.code})` : ''}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value={degree || "General Degree"}>{degree || "General Degree"}</option>
                  )}
                </select>
              </div>
            )}

            {user?.role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Batch / Graduation Year
                  </label>
                  <input
                    type="text"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>
              </>
            )}

            {user?.role === 'supervisor' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Research Interests (comma separated)
                  </label>
                  <input
                    type="text"
                    value={researchInterestsInput}
                    onChange={(e) => setResearchInterestsInput(e.target.value)}
                    placeholder="e.g. Distributed Systems, Edge AI, Cloud Computing"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Social / Portfolio Links for Students */}
        {user?.role === 'student' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Public Portfolio & Social Links</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Personal Portfolio URL
                </label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://yourname.dev"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Password Security Form */}
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Security & Password</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
