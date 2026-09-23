import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  FolderKanban,
  Award,
  Layers,
  ShieldCheck,
  TrendingUp,
  Building2,
  ChevronRight,
  Plus,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        if (res.data?.stats) setStats(res.data.stats);
      } catch (err) {
        console.error('Error fetching admin statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading system analytics..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-purple-200">
              👑 University Administration Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              UniSkill System Overview
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl">
              Monitor university-wide project distributions, manage student & lecturer accounts, oversee academic departments, and maintain the skills repository.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/departments"
              className="px-4 py-2.5 bg-purple-700/60 hover:bg-purple-700 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
            >
              Departments
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled users"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Faculty Supervisors"
          value={stats?.totalSupervisors || 0}
          subtitle="Active mentors"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects || 0}
          subtitle={`${stats?.activeProjects || 0} currently active`}
          icon={FolderKanban}
          color="purple"
        />
        <StatCard
          title="Skills Catalog"
          value={stats?.totalSkills || 0}
          subtitle={`${stats?.totalDepartments || 0} academic depts`}
          icon={Award}
          color="amber"
        />
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top In-Demand Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Most Demanded Skills</h3>
              <p className="text-xs text-slate-500">Skills most frequently required across academic projects</p>
            </div>
            <Link
              to="/admin/skills"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Manage Skills
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {stats?.topSkills && stats.topSkills.length > 0 ? (
              stats.topSkills.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      {item.name}
                      <span className="text-[10px] text-slate-400 font-normal">({item.category})</span>
                    </span>
                    <span className="text-indigo-600">{item.count} Projects</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / (stats.totalProjects || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No skill demand data yet.</p>
            )}
          </div>
        </div>

        {/* Project Distribution by Category */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Domain Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution across categories and research areas</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              All Projects
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {stats?.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-800">{cat._id || 'General'}</span>
                  <Badge variant="purple" size="md">
                    {cat.count} Projects
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-2 text-center py-4">No categories recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
