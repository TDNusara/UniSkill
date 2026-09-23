import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI } from '../../api/api';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  GraduationCap,
  Code2,
  Share2,
  Globe,
  Award,
  CheckCircle2,
  FolderKanban,
  ExternalLink,
  Mail,
  Calendar,
  Layers,
} from 'lucide-react';

const PortfolioView = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getPortfolio(id);
        if (res.data?.student) {
          setStudent(res.data.student);
          setProjects(res.data.projects || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage text="Generating student portfolio..." />;
  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold text-slate-800">Student Portfolio Not Found</h2>
          <Link to="/" className="text-xs font-bold text-indigo-600 hover:underline">
            Return to UniSkill
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header / Branding */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">UniSkill Portfolio</span>
          </Link>
          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
          >
            Go to Platform
          </Link>
        </div>

        {/* Student Profile Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-3xl shadow-md">
                {student.name?.charAt(0)}
              </div>
            )}

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {student.department?.name || 'Computer Science & Engineering'}
                </span>
                {student.batchYear && (
                  <span className="text-xs font-semibold text-slate-500">
                    Batch: {student.batchYear}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {student.name}
              </h1>

              <p className="text-xs text-slate-400 font-mono">
                Student ID: {student.studentId || 'STU-UNISKILL'}
              </p>

              {student.bio && (
                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl pt-1">
                  {student.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {student.email && (
                  <a
                    href={`mailto:${student.email}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={student.email}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {student.socialLinks?.github && (
                  <a
                    href={student.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="GitHub"
                  >
                    <Code2 className="w-4 h-4" />
                  </a>
                )}
                {student.socialLinks?.linkedin && (
                  <a
                    href={student.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="LinkedIn"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                )}
                {student.socialLinks?.portfolio && (
                  <a
                    href={student.socialLinks.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Personal Site"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Skills Showcase */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Technical & Domain Proficiencies</span>
          </h2>

          {student.skills && student.skills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {student.skills.map((sk, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{sk.skill?.name || 'Skill'}</p>
                    <p className="text-[10px] text-slate-400">{sk.skill?.category}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {sk.level}
                    </span>
                    {sk.verified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" title="Faculty Verified" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No skills listed yet.</p>
          )}
        </div>

        {/* Academic Education */}
        {student.education && student.education.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Education</span>
            </h2>
            <div className="space-y-3">
              {student.education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                  <p className="text-xs text-slate-600">{edu.institution}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {edu.startYear} - {edu.endYear}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Portfolio */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <span>Academic Projects & Capstones</span>
          </h2>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No public projects available for display.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="primary" size="sm">
                      {proj.category}
                    </Badge>
                    <Badge
                      variant={proj.status === 'completed' ? 'success' : 'info'}
                      size="sm"
                    >
                      {proj.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                  <ProgressBar progress={proj.progress || 0} size="sm" />

                  {proj.supervisor && (
                    <p className="text-xs text-slate-500">
                      Supervised by: <strong className="text-slate-800">{proj.supervisor.name}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
