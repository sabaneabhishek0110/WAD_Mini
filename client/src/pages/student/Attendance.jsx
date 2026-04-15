import { useState, useEffect } from 'react';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const Attendance = () => {
  const [theoryData, setTheoryData] = useState(null);
  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [labSubjectFilter, setLabSubjectFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [theoryRes, labRes] = await Promise.all([
          api.get('/student/theory/attendance'),
          api.get('/student/lab/attendance'),
        ]);
        setTheoryData(theoryRes.data.data);
        setLabData(labRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  // Get unique lab subjects
  const labSubjects = [...new Set(labData?.attendance?.map(a => a.subject).filter(Boolean) || [])];
  const filteredLabAttendance = labSubjectFilter === 'all'
    ? (labData?.attendance || [])
    : (labData?.attendance || []).filter(a => a.subject === labSubjectFilter);

  // Compute per-subject lab stats
  const filteredLabPresent = filteredLabAttendance.filter(a => a.present).length;
  const filteredLabTotal = filteredLabAttendance.length;
  const filteredLabPercentage = filteredLabTotal > 0 ? ((filteredLabPresent / filteredLabTotal) * 100).toFixed(1) : 0;

  return (
    <>
      <TopHeader title="Attendance" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Attendance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary-700 to-primary-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <p className="text-sm text-primary-100 font-medium">Theory Attendance</p>
                <p className="text-4xl font-bold mt-2">{theoryData?.percentage || 0}%</p>
                <p className="text-xs text-primary-200 mt-2">
                  {theoryData?.present || 0} / {theoryData?.totalClasses || 0} classes attended
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <p className="text-sm text-blue-100 font-medium">
                  Lab Attendance {labSubjectFilter !== 'all' ? `(${labSubjectFilter})` : ''}
                </p>
                <p className="text-4xl font-bold mt-2">
                  {labSubjectFilter === 'all' ? (labData?.percentage || 0) : filteredLabPercentage}%
                </p>
                <p className="text-xs text-blue-200 mt-2">
                  {labSubjectFilter === 'all'
                    ? `${labData?.present || 0} / ${labData?.totalSessions || 0} sessions attended`
                    : `${filteredLabPresent} / ${filteredLabTotal} sessions attended`
                  }
                </p>
              </div>
            </motion.div>
          </div>

          {/* Theory Attendance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Theory Attendance Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {theoryData?.attendance?.length > 0 ? (
                    theoryData.attendance.map((record, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-gray-700">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-700">{record.subject}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.present ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Lab Attendance Table (Subject-wise) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-800">Lab Attendance Records</h3>
              {labSubjects.length > 1 && (
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                  <button onClick={() => setLabSubjectFilter('all')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${labSubjectFilter === 'all' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                    All
                  </button>
                  {labSubjects.map(subj => (
                    <button key={subj} onClick={() => setLabSubjectFilter(subj)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${labSubjectFilter === subj ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Session</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLabAttendance.length > 0 ? (
                    filteredLabAttendance.map((record, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-gray-700">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-700">{record.sessionTitle || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{record.subject}</td>
                        <td className="px-4 py-3 text-gray-700">{record.batch}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.present ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {record.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
};

export default Attendance;
