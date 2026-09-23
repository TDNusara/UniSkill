import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FolderKanban,
  Users,
  Plus,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

const MyProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectAPI.getMyProjects();
        if (res.data?.projects) setProjects(res.data.projects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading your projects..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {user?.role === 'supervisor' ? 'Supervised Projects' : 'My Projects & Teams'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Projects you are currently creating, participating in as a member, or supervising.
          </p>
        </div>

        {user?.role === 'student' && (
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You are not currently linked to any active projects.
          </p>
          <div className="pt-2">
            <Link
              to="/projects"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Explore Project Directory
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="primary" size="sm">
                    {project.category}
                  </Badge>
                  <Badge
                    variant={project.status === 'completed' ? 'success' : 'info'}
                    size="sm"
                  >
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <Link
                    to={`/projects/${project._id}`}
                    className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                  >
                    {project.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{project.description}</p>
                </div>

                <ProgressBar progress={project.progress || 0} size="sm" />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{project.members?.length || 1} Members</span>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  <span>Open Workspace</span>
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

export default MyProjects;
