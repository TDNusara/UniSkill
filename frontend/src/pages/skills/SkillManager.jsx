import React, { useState, useEffect } from 'react';
import { skillAPI, userAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Save,
  HelpCircle,
} from 'lucide-react';

const SkillManager = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add Skill Form State
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Intermediate');

  // Suggest New Skill Modal
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Web Development');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await skillAPI.getSkills();
      if (res.data?.skills) {
        setAvailableSkills(res.data.skills);
        if (res.data.skills.length > 0) {
          setSelectedSkillId(res.data.skills[0]._id);
        }
      }
      if (user?.skills) {
        setUserSkills(
          user.skills.map((s) => ({
            skill: s.skill?._id || s.skill,
            name: s.skill?.name || '',
            category: s.skill?.category || '',
            level: s.level || 'Intermediate',
            verified: s.verified || false,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddSkillToProfile = () => {
    if (!selectedSkillId) return;
    const exists = userSkills.some((s) => (s.skill?._id || s.skill) === selectedSkillId);
    if (exists) {
      showError('This skill is already present in your profile. You can modify its level.');
      return;
    }

    const foundSkill = availableSkills.find((s) => s._id === selectedSkillId);
    if (!foundSkill) return;

    setUserSkills([
      ...userSkills,
      {
        skill: foundSkill._id,
        name: foundSkill.name,
        category: foundSkill.category,
        level: selectedLevel,
        verified: false,
      },
    ]);
  };

  const handleRemoveSkill = (skillId) => {
    setUserSkills(userSkills.filter((s) => (s.skill?._id || s.skill) !== skillId));
  };

  const handleChangeLevel = (skillId, newLevel) => {
    setUserSkills(
      userSkills.map((s) =>
        (s.skill?._id || s.skill) === skillId ? { ...s, level: newLevel } : s
      )
    );
  };

  const handleSaveSkills = async () => {
    try {
      setSaving(true);
      const payload = userSkills.map((s) => ({
        skill: s.skill?._id || s.skill,
        level: s.level,
        verified: s.verified,
      }));

      const res = await userAPI.updateSkills(payload);
      if (res.data?.skills) {
        updateUser({ ...user, skills: res.data.skills });
      }
      showSuccess('Skill proficiencies saved to your academic profile!');
    } catch (err) {
      showError('Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      setSuggesting(true);
      const res = await skillAPI.createSkill({
        name: newSkillName,
        category: newSkillCategory,
        description: newSkillDesc,
      });
      showSuccess(res.data?.message || 'Skill added to repository!');
      setSuggestModalOpen(false);
      setNewSkillName('');
      setNewSkillDesc('');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Error suggesting skill');
    } finally {
      setSuggesting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading skill repository..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            <span>Manage My Skill Proficiencies</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build your verified skill taxonomy to get matched with capstone teams and academic supervisors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSuggestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Suggest New Skill</span>
        </button>
      </div>

      {/* Add Skill Widget */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Add Skill to Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Skill from Catalog
            </label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              {availableSkills.map((sk) => (
                <option key={sk._id} value={sk._id}>
                  {sk.name} ({sk.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Self-Assessed Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleAddSkillToProfile}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Profile List</span>
          </button>
        </div>
      </div>

      {/* Current Skill List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Profile Skills ({userSkills.length})</h2>
            <p className="text-xs text-slate-400">Skills visible on your public student portfolio</p>
          </div>

          <button
            type="button"
            onClick={handleSaveSkills}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {userSkills.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            No skills added to your profile yet. Use the selector above to add skills.
          </div>
        ) : (
          <div className="space-y-3">
            {userSkills.map((item, idx) => {
              const skillId = item.skill?._id || item.skill;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {item.name || item.skill?.name || 'Skill'}
                      </span>
                      {item.verified && (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                          Faculty Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {item.category || item.skill?.category || 'Category'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={item.level}
                      onChange={(e) => handleChangeLevel(skillId, e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skillId)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggest Skill Modal */}
      <Modal
        isOpen={suggestModalOpen}
        onClose={() => setSuggestModalOpen(false)}
        title="Suggest New Skill"
      >
        <form onSubmit={handleSuggestSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Next.js, PyTorch, GraphQL"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="Web Development">Web Development</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Data Science & Analytics">Data Science & Analytics</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Database & Backend">Database & Backend</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Embedded & IoT">Embedded & IoT</option>
              <option value="Soft Skills & Management">Soft Skills & Management</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={newSkillDesc}
              onChange={(e) => setNewSkillDesc(e.target.value)}
              placeholder="Brief description of this technology..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSuggestModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={suggesting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {suggesting ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillManager;
