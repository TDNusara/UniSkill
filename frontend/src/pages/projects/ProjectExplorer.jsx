import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, skillAPI, adminAPI } from '../../api/api';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Search,
  Filter,
  Users,
  FolderKanban,
  UserCheck,
  Plus,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const ProjectExplorer = () => {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [lookingForMembersOnly, setLookingForMembersOnly] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedDept) params.department = selectedDept;
      if (selectedSkill) params.skill = selectedSkill;
      if (lookingForMembersOnly) params.lookingForMembers = 'true';

      const res = await projectAPI.getProjects(params);
      if (res.data?.projects) setProjects(res.data.projects);
    } catch (err) {
      console.error('Error fetching projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [skillsRes, deptsRes] = await Promise.all([
          skillAPI.getSkills(),
          adminAPI.getDepartments(),
        ]);
        if (skillsRes.data?.skills) setSkills(skillsRes.data.skills);
        if (deptsRes.data?.departments) setDepartments(deptsRes.data.departments);
      } catch (err) {
        console.error('Error fetching metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedSkill, lookingForMembersOnly]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Project Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover student research, capstones, find teams seeking members, and explore live projects.
          </p>
        </div>

        <Link
          to="/projects/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, keywords..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Required Skill Filter */}
          <div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="">Filter by Required Skill</option>
              {skills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Checkbox Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={lookingForMembersOnly}
              onChange={(e) => setLookingForMembersOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Show only projects actively recruiting members</span>
          </label>

          <span className="text-slate-400 font-semibold">{projects.length} projects found</span>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner text="Searching projects..." />
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clear the filters to view all available projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="primary" size="sm">
                    {project.category || 'Academic'}
                  </Badge>
                  {project.isLookingForMembers && (
                    <Badge variant="warning" size="sm">
                      Recruiting
                    </Badge>
                  )}
                </div>

                {/* Title and Description */}
                <div>
                  <Link
                    to={`/projects/${project._id}`}
                    className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2"
                  >
                    {project.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Required Skills Tag list */}
                {project.requiredSkills && project.requiredSkills.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.requiredSkills.map((sk) => (
                        <span
                          key={sk._id}
                          className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                        >
                          {sk.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="pt-2">
                  <ProgressBar progress={project.progress || 0} size="sm" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>
                    {project.members?.length || 1}/{project.maxMembers || 4} Members
                  </span>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectExplorer;
