import { useState, useEffect } from 'react';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import StatCard from '../../components/shared/StatCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import api from '../../api/axios';
import {
  HiOutlineUsers, HiOutlineAcademicCap, HiOutlineBuildingOffice2,
  HiOutlineUserGroup, HiOutlineClipboardDocumentList
} from 'react-icons/hi2';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard/stats');
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      <TopHeader title="Admin Dashboard" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard icon={HiOutlineUsers} label="Total Teachers" value={stats?.totalTeachers || 0} index={0} />
            <StatCard icon={HiOutlineAcademicCap} label="Total Students" value={stats?.totalStudents || 0} index={1} />
            <StatCard icon={HiOutlineBuildingOffice2} label="Total Classes" value={stats?.totalClasses || 0} index={2} />
            <StatCard icon={HiOutlineUserGroup} label="Total Batches" value={stats?.totalBatches || 0} index={3} />
            <StatCard icon={HiOutlineClipboardDocumentList} label="Total Assignments" value={stats?.totalAssignments || 0} index={4} />
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="/admin/teachers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <HiOutlineUsers className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Manage Teachers</p>
                    <p className="text-xs text-gray-400">Add, upload, or remove teachers</p>
                  </div>
                </a>
                <a href="/admin/students" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <HiOutlineAcademicCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Manage Students</p>
                    <p className="text-xs text-gray-400">Add, upload, or remove students</p>
                  </div>
                </a>
                <a href="/admin/assignments" className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <HiOutlineClipboardDocumentList className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Manage Assignments</p>
                    <p className="text-xs text-gray-400">Add, upload, or remove assignments</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">System Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Database Status</span>
                  <span className="text-xs font-medium px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">API Version</span>
                  <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">v1.0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-xs font-medium text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default AdminDashboard;
