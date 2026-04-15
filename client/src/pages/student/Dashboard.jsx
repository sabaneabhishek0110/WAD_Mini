import { useState, useEffect } from 'react';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import StatCard from '../../components/shared/StatCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import {
  HiOutlineBeaker, HiOutlineAcademicCap, HiOutlineClipboardDocumentCheck
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const StudentDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/student/dashboard/summary');
        setSummary(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  // UT chart data (with subject) — exclude generic "Theory" entries
  const utChartData = summary?.unitTests
    ?.filter(ut => ut.subject && ut.subject !== 'Theory')
    ?.map(ut => ({
      name: `UT ${ut.testNo} (${ut.subject})`,
      marks: ut.marksObtained,
      max: ut.maxMarks,
    })) || [];

  // Assignment chart data (with subject)
  const assignmentChartData = summary?.assignmentMarks?.map(am => ({
    name: `A${am.assignmentNo}`,
    marks: am.marksObtained,
    max: am.maxMarks,
    subject: am.subject,
  })) || [];

  // Pie chart data for lab attendance
  const labPieData = [
    { name: 'Present', value: summary?.labAttendance || 0 },
    { name: 'Absent', value: 100 - (summary?.labAttendance || 0) },
  ];

  return (
    <>
      <TopHeader title="Student Dashboard" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Roll Number */}
          {summary?.rollNumber && (
            <div className="mb-4">
              <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold">
                Roll No: {summary.rollNumber}
              </span>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard icon={HiOutlineBeaker} label="Lab Attendance" value={`${summary?.labAttendance || 0}%`} index={0} />
            <StatCard icon={HiOutlineAcademicCap} label="Avg UT Score" value={summary?.avgUnitTestScore || 0} index={1} />
            <StatCard icon={HiOutlineClipboardDocumentCheck} label="Assignments Done" value={summary?.assignmentsAttempted || 0} index={2} />
          </div>

          {/* ==================== TERM WORK MARKS (Per Subject) ==================== */}
          {summary?.termWork?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 sm:mb-8"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Term Work Marks (Per Subject)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {summary.termWork.map((tw, i) => {
                  const score = tw.termWorkScore;
                  const color = score >= 70 ? 'emerald' : score >= 40 ? 'amber' : 'red';
                  const gradientMap = {
                    emerald: 'from-emerald-500 to-emerald-400',
                    amber: 'from-amber-500 to-amber-400',
                    red: 'from-red-500 to-red-400',
                  };
                  const bgMap = {
                    emerald: 'bg-emerald-50 border-emerald-100',
                    amber: 'bg-amber-50 border-amber-100',
                    red: 'bg-red-50 border-red-100',
                  };
                  const textMap = {
                    emerald: 'text-emerald-700',
                    amber: 'text-amber-700',
                    red: 'text-red-700',
                  };
                  return (
                    <motion.div
                      key={tw.subject}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className={`rounded-2xl border p-5 ${bgMap[color]} relative overflow-hidden`}
                    >
                      {/* Subject header + score */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{tw.subject}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Term Work Score</p>
                        </div>
                        <div className={`relative w-14 h-14 flex-shrink-0`}>
                          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="24" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                            <circle
                              cx="28" cy="28" r="24"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${(score / 100) * 150.8} 150.8`}
                              strokeLinecap="round"
                              className={textMap[color]}
                            />
                          </svg>
                          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${textMap[color]}`}>
                            {score}%
                          </span>
                        </div>
                      </div>

                      {/* Breakdown bars */}
                      <div className="space-y-2.5">
                        {/* Assignment - 60% */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium">Assignments (60%)</span>
                            <span className="text-gray-800 font-semibold">{tw.assignmentPct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color]} transition-all duration-500`}
                              style={{ width: `${tw.assignmentPct}%` }}
                            />
                          </div>
                        </div>
                        {/* UT - 20% */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium">Unit Tests (20%)</span>
                            <span className="text-gray-800 font-semibold">{tw.utPct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color]} transition-all duration-500`}
                              style={{ width: `${tw.utPct}%` }}
                            />
                          </div>
                        </div>
                        {/* Attendance - 20% */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium">Attendance (20%)</span>
                            <span className="text-gray-800 font-semibold">{tw.attendancePct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color]} transition-all duration-500`}
                              style={{ width: `${tw.attendancePct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Footer stats */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200/50">
                        <span className="text-[10px] text-gray-500">{tw.assignmentCount} assignment{tw.assignmentCount !== 1 ? 's' : ''}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] text-gray-500">{tw.utCount} UT{tw.utCount !== 1 ? 's' : ''}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] text-gray-500">{tw.attendanceCount} class{tw.attendanceCount !== 1 ? 'es' : ''}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Unit Test Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Unit Test Marks (Subject-wise)</h3>
              {utChartData.length > 0 ? (
                <div className="-mx-2 sm:mx-0">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={utChartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="marks" fill="#1D4ED8" radius={[8, 8, 0, 0]} name="Obtained" />
                    <Bar dataKey="max" fill="#BFDBFE" radius={[8, 8, 0, 0]} name="Max Marks" />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No unit test data yet</div>
              )}
            </motion.div>

            {/* Lab Attendance Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Lab Attendance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={labPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {labPieData.map((_, index) => (
                      <Cell key={index} fill={index === 0 ? '#1D4ED8' : '#E2E8F0'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Assignment Marks Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Assignment Marks</h3>
            {assignmentChartData.length > 0 ? (
              <div className="-mx-2 sm:mx-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assignmentChartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return `${label} (${item?.subject || ''})`;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="marks" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Obtained" />
                  <Bar dataKey="max" fill="#BFDBFE" radius={[8, 8, 0, 0]} name="Max Marks" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">No assignment data yet</div>
            )}
          </motion.div>

          {/* Mock Test Results */}
          {summary?.mockTestResults?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Mock Practical Exam Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {summary.mockTestResults.map((mt, i) => (
                  <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <p className="font-semibold text-gray-800 text-sm">{mt.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{mt.subject}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {mt.marksObtained} <span className="text-sm font-normal text-gray-400">/ {mt.maxMarks}</span>
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default StudentDashboard;
