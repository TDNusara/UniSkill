import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Building2,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  Compass,
  Filter,
} from 'lucide-react';

const COMMON_CATEGORIES = [
  'Experimental & Laboratory',
  'Research Methodology & Ethics',
  'Data Analysis & Statistics',
  'Modeling & Simulation',
  'Field Work & Surveying',
  'Design & Prototyping',
  'Clinical & Healthcare',
  'Financial & Economic Analysis',
  'Software & Computational Tools',
  'Hardware & Electronics',
  'Academic Writing & Literature Review',
  'Management, Strategy & Policy',
  'Legal & Governance Analysis',
  'Other',
];

const SkillManager = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab mode: 'my_program' (skills for student's department/degree) or 'all' (all university skills)
  const [activeTab, setActiveTab] = useState('my_program');

  // Add Skill Form State
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Intermediate');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Suggest New Skill Modal
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Experimental & Laboratory');
  const [customCategory, setCustomCategory] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  const userDeptId = user?.department?._id || user?.department;
  const userDeptName = user?.department?.name || '';
  const userDeptCode = user?.department?.code || '';
  const userDegree = user?.degree || '';

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};

      if (activeTab === 'my_program' && userDeptId) {
        params.department = userDeptId;
        if (userDegree) params.degree = userDegree;
        params.includeGeneral = 'true';
      }

      const res = await skillAPI.getSkills(params);
      if (res.data?.skills) {
        setAvailableSkills(res.data.skills);
        if (res.data.skills.length > 0) {
          setSelectedSkillId(res.data.skills[0]._id);
        } else {
          setSelectedSkillId('');
        }
      }

      if (user?.skills) {
        setUserSkills(
          user.skills.map((s) => ({
            skill: s.skill?._id || s.skill,
            name: s.skill?.name || '',
            category: s.skill?.category || '',
            department: s.skill?.department,
            degree: s.skill?.degree,
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
  }, [user, activeTab]);

  const handleAddSkillToProfile = () => {
    if (!selectedSkillId) return;
    const exists = userSkills.some((s) => (s.skill?._id || s.skill) === selectedSkillId);
    if (exists) {
      showError('This skill is already in your profile list. You can change its proficiency level below.');
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
        department: foundSkill.department,
        degree: foundSkill.degree,
        level: selectedLevel,
        verified: false,
      },
    ]);
    showSuccess(`Added "${foundSkill.name}" to your profile list. Remember to click "Save Changes".`);
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
      showSuccess('Skill proficiencies successfully saved to your academic portfolio!');
    } catch (err) {
      showError('Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const finalCategory =
      newSkillCategory === 'Custom' ? customCategory.trim() || 'General' : newSkillCategory;

    try {
      setSuggesting(true);
      const res = await skillAPI.createSkill({
        name: newSkillName.trim(),
        category: finalCategory,
        description: newSkillDesc.trim(),
        department: userDeptId || null,
        degree: userDegree || '',
      });
      showSuccess(res.data?.message || 'Skill submitted for academic catalog approval!');
      setSuggestModalOpen(false);
      setNewSkillName('');
      setNewSkillDesc('');
      setCustomCategory('');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Error suggesting skill');
    } finally {
      setSuggesting(false);
    }
  };

  // Filter available skills by category if filter applied
  const displayedAvailableSkills = availableSkills.filter((sk) => {
    if (categoryFilter === 'all') return true;
    return sk.category === categoryFilter;
  });

  // Extract distinct categories from currently available skills
  const availableCategories = Array.from(
    new Set(availableSkills.map((s) => s.category).filter(Boolean))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600" />
            <span>Manage My Skill Proficiencies</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build your research competencies and technical skill portfolio tailored to your academic degree.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSuggestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Suggest Degree Skill</span>
        </button>
      </div>

      {/* Academic Department & Degree Context Card */}
      {userDeptId ? (
        <div className="bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 rounded-3xl p-5 sm:p-6 border border-indigo-100/80 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/60 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{userDeptCode ? `${userDeptCode} Department` : 'Academic Department'}</span>
                </span>
                {userDegree && (
                  <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>{userDegree}</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 pt-1">
                {userDeptName || 'Department-Specific Skill Catalog'}
              </h2>
              <p className="text-xs text-slate-500">
                Skills below are filtered specifically for students in your academic discipline and degree program.
              </p>
            </div>

            {/* Program vs All Skills Tabs */}
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('my_program')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'my_program'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>My Degree & Dept</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>All Disciplines</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-3xl p-5 sm:p-6 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Academic Department Not Configured</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                UniSkill tailors skill recommendations to your specific degree and faculty. Select your department in Profile Settings to unlock relevant research proficiencies.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Set Department</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Add Skill to Profile Widget */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add Skill to Your Academic Profile</span>
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === 'my_program'
                ? `Showing skills recognized for ${userDeptCode || 'your department'}`
                : 'Showing all academic skills across university departments'}
            </p>
          </div>

          {availableCategories.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Domains ({availableSkills.length})</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-8">
            <LoadingSpinner text="Loading curriculum skills..." />
          </div>
        ) : displayedAvailableSkills.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
            <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              No skills found for this category or program
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your department administrator hasn't added skills under this filter yet. You can suggest a new skill or switch to "All Disciplines" to view universal research skills.
            </p>
            <button
              type="button"
              onClick={() => setSuggestModalOpen(true)}
              className="mt-2 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggest Skill for {userDeptCode || 'Department'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
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
                  {displayedAvailableSkills.map((sk) => {
                    const tag = sk.degree
                      ? `[${sk.degree}]`
                      : sk.department
                      ? `[${sk.department.code || sk.department.name}]`
                      : '[Universal]';
                    return (
                      <option key={sk._id} value={sk._id}>
                        {sk.name} — {sk.category} {tag}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Self-Assessed Proficiency
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (Competent)</option>
                  <option value="Advanced">Advanced (Proficient)</option>
                  <option value="Expert">Expert (Specialist / Research)</option>
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
                <span>Add to My Skill List</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Skill List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>My Verified Academic Proficiencies</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold">
                {userSkills.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Skills displayed on your public research portfolio and matched with supervisors and capstone projects
            </p>
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
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
            <Award className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">No skills added to your academic profile yet.</p>
            <p className="text-slate-400">Use the department catalog above to select your competencies.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userSkills.map((item, idx) => {
              const skillId = item.skill?._id || item.skill;
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {item.name || item.skill?.name || 'Academic Skill'}
                      </span>
                      {item.verified && (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                          Faculty Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{item.category || item.skill?.category || 'General'}</span>
                      {item.skill?.degree && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-medium">{item.skill.degree}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <select
                      value={item.level}
                      onChange={(e) => handleChangeLevel(skillId, e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
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
                      title="Remove skill"
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
        title="Suggest New Academic Skill"
      >
        <form onSubmit={handleSuggestSkill} className="space-y-4">
          {/* Target Department Badge */}
          {userDeptId && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-indigo-700">
                <Building2 className="w-3.5 h-3.5" />
                <span>Department: {userDeptName} ({userDeptCode})</span>
              </span>
              {userDegree && (
                <p className="text-[11px] text-indigo-700/80">
                  Target Degree: <strong>{userDegree}</strong>
                </p>
              )}
              <p className="text-[11px] text-slate-500 pt-0.5">
                This skill suggestion will be routed to the academic admin for your department.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Econometric Time-Series, Microfluidics, CAD Simulation"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Academic Domain / Category
            </label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Custom">Custom Domain...</option>
            </select>

            {newSkillCategory === 'Custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom academic domain..."
                required
                className="mt-2 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Academic Description & Research Application
            </label>
            <textarea
              rows={2}
              value={newSkillDesc}
              onChange={(e) => setNewSkillDesc(e.target.value)}
              placeholder="Brief description of how this skill or methodology is used in your degree..."
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
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {suggesting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillManager;
