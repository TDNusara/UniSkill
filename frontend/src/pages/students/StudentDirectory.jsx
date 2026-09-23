import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, skillAPI, adminAPI } from '../../api/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  ExternalLink,
  Award,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedDept) params.department = selectedDept;
      if (selectedSkill) params.skill = selectedSkill;

      const res = await userAPI.getStudentsDirectory(params);
      if (res.data?.students) setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [skRes, dpRes] = await Promise.all([
          skillAPI.getSkills(),
          adminAPI.getDepartments(),
        ]);
        if (skRes.data?.skills) setSkills(skRes.data.skills);
        if (dpRes.data?.departments) setDepartments(dpRes.data.departments);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedSkill]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Teammate Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search students by technical skills, department, or graduation year to recruit members for your project teams.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, ID, bio..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            />
          </div>

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

          <div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
            >
              <option value="">Filter by Skill</option>
              {skills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <LoadingSpinner text="Searching student directory..." />
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
          No students found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((stu) => (
            <div
              key={stu._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  {stu.avatar ? (
                    <img
                      src={stu.avatar}
                      alt={stu.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-base shrink-0">
                      {stu.name?.charAt(0)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {stu.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {stu.studentId || 'Student'} • {stu.department?.code}
                    </p>
                    {stu.batchYear && (
                      <p className="text-[10px] text-slate-400">Batch: {stu.batchYear}</p>
                    )}
                  </div>
                </div>

                {stu.bio && <p className="text-xs text-slate-600 line-clamp-2">{stu.bio}</p>}

                {/* Skills tags */}
                {stu.skills && stu.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {stu.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {sk.skill?.name} ({sk.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to={`/portfolio/${stu._id}`}
                  target="_blank"
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Public Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDirectory;
