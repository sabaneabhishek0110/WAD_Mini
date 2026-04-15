import { useState, useEffect } from 'react';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import StatCard from '../../components/shared/StatCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { HiOutlineBookOpen, HiOutlineBeaker, HiOutlineAcademicCap, HiOutlineCalendarDays } from 'react-icons/hi2';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/teacher/profile');
        setProfile(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <TopHeader title="Teacher Dashboard" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-5 sm:p-8 text-white mb-6 sm:mb-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -right-20 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold">Welcome, {user?.name} 👋</h2>
              <p className="text-primary-100 mt-2 flex items-center gap-2">
                <HiOutlineCalendarDays className="w-4 h-4" />
                {today}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard icon={HiOutlineBookOpen} label="My Classes" value={profile?.assignedClasses?.length || 0} index={0} />
            <StatCard icon={HiOutlineBeaker} label="My Batches" value={profile?.assignedBatches?.length || 0} index={1} />
            <StatCard icon={HiOutlineAcademicCap} label="Subjects" value={
              new Set([
                ...(profile?.assignedClasses?.map(c => c.subject) || []),
                ...(profile?.assignedBatches?.map(b => b.subject) || []),
              ]).size
            } index={2} />
          </div>

          {/* Assignments Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Theory Classes</h3>
              {profile?.assignedClasses?.length > 0 ? (
                <div className="space-y-3">
                  {profile.assignedClasses.map((c, i) => (
                    <a key={i} href={`/teacher/classes/${c.class}`}
                      className="flex items-center justify-between p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{c.class}</p>
                        <p className="text-sm text-gray-500">{c.subject}</p>
                      </div>
                      <span className="text-primary-600 text-sm font-medium">View →</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No classes assigned</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Lab Batches</h3>
              {profile?.assignedBatches?.length > 0 ? (
                <div className="space-y-3">
                  {profile.assignedBatches.map((b, i) => (
                    <a key={i} href={`/teacher/batches/${b.batch}`}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{b.batch}</p>
                        <p className="text-sm text-gray-500">{b.subject}</p>
                      </div>
                      <span className="text-blue-600 text-sm font-medium">View →</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No batches assigned</p>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default TeacherDashboard;
