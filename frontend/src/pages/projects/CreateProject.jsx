import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, skillAPI, supervisorAPI, adminAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FolderPlus,
  Plus,
  Trash2,
  Award,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

const CreateProject = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Application & Platform');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [maxMembers, setMaxMembers] = useState(4);
  const [isLookingForMembers, setIsLookingForMembers] = useState(true);
  const [githubRepo, setGithubRepo] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [supervisorId, setSupervisorId] = useState('');

  // Dynamic Objectives List
  const [objectives, setObjectives] = useState(['Design and document architecture', 'Implement core features']);
  const [newObjective, setNewObjective] = useState('');

  // Skills
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skillScope, setSkillScope] = useState('department');

  // Data lists
  const [departmentsList, setDepartmentsList] = useState([]);
  const [supervisorsList, setSupervisorsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, deptsRes, supsRes] = await Promise.all([
          skillAPI.getSkills(),
          adminAPI.getDepartments(),
          supervisorAPI.getSupervisors(),
        ]);
        if (skillsRes.data?.skills) setAvailableSkills(skillsRes.data.skills);
        if (deptsRes.data?.departments) {
          setDepartmentsList(deptsRes.data.departments);
          if (deptsRes.data.departments.length > 0) {
            setDepartment(user?.department?._id || deptsRes.data.departments[0]._id);
          }
        }
        if (supsRes.data?.supervisors) setSupervisorsList(supsRes.data.supervisors);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user]);

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setObjectives([...objectives, newObjective.trim()]);
    setNewObjective('');
  };

  const handleRemoveObjective = (idx) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const toggleSkill = (skillId) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      showError('Please enter project title and description');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title,
        description,
        category,
        department,
        academicYear,
        objectives,
        requiredSkills: selectedSkillIds,
        maxMembers: Number(maxMembers),
        isLookingForMembers,
        githubRepo,
        liveDemoUrl,
        supervisorId: supervisorId || undefined,
      };

      const res = await projectAPI.createProject(payload);
      showSuccess('Project proposal created successfully with initial milestones!');
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FolderPlus className="w-7 h-7 text-indigo-600" />
          <span>Propose New Academic Project</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Initiate a new capstone or research initiative, tag required skill sets, and start building your team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Project Overview</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. UniSkill — University Skill & Project Platform"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description & Abstract *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project problem statement, methodology, expected impact, and scope..."
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                >
                  <option value="Web Application & Platform">Web Application</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Mobile App Development">Mobile App</option>
                  <option value="Cloud & Distributed Systems">Cloud & Distributed</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Embedded Systems & IoT">Embedded & IoT</option>
                  <option value="Data Science & Analytics">Data Science</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                >
                  {departmentsList.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Key Deliverables & Objectives</h2>
          <div className="space-y-2">
            {objectives.map((obj, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-800"
              >
                <span>• {obj}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add key milestone objective..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddObjective}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Skills & Teammates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Required Skill Sets & Team Formation</span>
            </h2>

            {department && (
              <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSkillScope('department')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    skillScope === 'department'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Department Skills
                </button>
                <button
                  type="button"
                  onClick={() => setSkillScope('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    skillScope === 'all'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Disciplines
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Required Skills for Team Matching ({selectedSkillIds.length} selected)
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {availableSkills
                .filter((sk) => {
                  if (skillScope === 'all') return true;
                  if (!department) return true;
                  const skDeptId = sk.department?._id || sk.department;
                  return !skDeptId || skDeptId === department;
                })
                .map((sk) => {
                  const selected = selectedSkillIds.includes(sk._id);
                  return (
                    <button
                      key={sk._id}
                      type="button"
                      onClick={() => toggleSkill(sk._id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{sk.name}</span>
                      {sk.degree && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded ${selected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                          {sk.degree}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Team Size
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isLookingForMembers}
                  onChange={(e) => setIsLookingForMembers(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Actively recruiting project teammates</span>
              </label>
            </div>
          </div>
        </div>

        {/* Supervisor Selection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Supervisor Mentorship (Optional)</span>
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Faculty Supervisor to Request
            </label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="">-- Request Later / None --</option>
              {supervisorsList.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.name} ({sup.designation}) — {sup.department?.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Proposal...' : 'Submit Project Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
