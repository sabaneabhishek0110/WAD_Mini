import { useState, useEffect } from 'react';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const Marks = () => {
  const [unitTests, setUnitTests] = useState([]);
  const [labMarks, setLabMarks] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [utSubjectFilter, setUtSubjectFilter] = useState('all');
  const [labSubjectFilter, setLabSubjectFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [utRes, marksRes, mockRes, profileRes] = await Promise.all([
          api.get('/student/theory/unittests'),
          api.get('/student/lab/marks'),
          api.get('/student/lab/mocktests'),
          api.get('/student/profile'),
        ]);
        setUnitTests(utRes.data.data);
        setLabMarks(marksRes.data.data);
        setMockTests(mockRes.data.data);
        setProfile(profileRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  // Get unique subjects for UT — exclude generic "Theory"
  const utSubjects = [...new Set(unitTests.map(ut => ut.subject).filter(s => s && s !== 'Theory'))];
  const filteredUT = utSubjectFilter === 'all'
    ? unitTests.filter(ut => ut.subject !== 'Theory')
    : unitTests.filter(ut => ut.subject === utSubjectFilter);

  // Get unique subjects for lab
  const labSubjects = [...new Set(labMarks.map(m => m.subject).filter(Boolean))];
  const filteredLab = labSubjectFilter === 'all' ? labMarks : labMarks.filter(m => m.subject === labSubjectFilter);

  // Calculate term work total for filtered lab marks
  const assignmentTotal = filteredLab.reduce((sum, m) => sum + m.marksObtained, 0);
  const assignmentMaxTotal = filteredLab.reduce((sum, m) => sum + m.maxMarks, 0);

  // Group mock tests by subject
  const mockSubjects = [...new Set(mockTests.map(m => m.subject).filter(Boolean))];

  return (
    <>
      <TopHeader title="Marks" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Roll Number Badge */}
          {profile?.rollNumber && (
            <div className="mb-4 sm:mb-6 flex items-center gap-3">
              <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold">
                Roll No: {profile.rollNumber}
              </span>
            </div>
          )}

          {/* ==================== UNIT TEST MARKS (Subject-wise) ==================== */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-800">Unit Test Marks</h3>
              {utSubjects.length >= 1 && (
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                  {utSubjects.length > 1 && (
                    <button onClick={() => setUtSubjectFilter('all')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${utSubjectFilter === 'all' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                      All
                    </button>
                  )}
                  {utSubjects.map(subj => (
                    <button key={subj} onClick={() => setUtSubjectFilter(subj)}
                      className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${utSubjectFilter === subj ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {utSubjects.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map(testNo => (
                  <motion.div key={testNo} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: testNo * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary-700">UT{testNo}</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-300">—</p>
                    <p className="text-sm text-gray-400 mt-1">Not attempted</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Render per-subject UT cards */}
            {(utSubjectFilter === 'all' ? utSubjects : [utSubjectFilter]).map(subject => {
              const subjectUTs = unitTests.filter(ut => ut.subject === subject);
              if (subjectUTs.length === 0) return null;
              return (
                <div key={subject} className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    {subject}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3].map(testNo => {
                      const ut = subjectUTs.find(u => u.testNo === testNo);
                      return (
                        <motion.div key={testNo} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: testNo * 0.1 }}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-3">
                            <span className="text-lg font-bold text-primary-700">UT{testNo}</span>
                          </div>
                          {ut ? (
                            <>
                              <p className="text-2xl font-bold text-gray-800">{ut.marksObtained}</p>
                              <p className="text-sm text-gray-400 mt-1">out of {ut.maxMarks}</p>
                              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                                  style={{ width: `${(ut.marksObtained / ut.maxMarks) * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2">{((ut.marksObtained / ut.maxMarks) * 100).toFixed(0)}%</p>
                            </>
                          ) : (
                            <>
                              <p className="text-2xl font-bold text-gray-300">—</p>
                              <p className="text-sm text-gray-400 mt-1">Not attempted</p>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================== ASSIGNMENT MARKS (Subject-wise) ==================== */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-800">Assignment Marks</h3>
              {labSubjects.length >= 1 && (
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
                  {labSubjects.length > 1 && (
                    <button onClick={() => setLabSubjectFilter('all')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${labSubjectFilter === 'all' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                      All
                    </button>
                  )}
                  {labSubjects.map(subj => (
                    <button key={subj} onClick={() => setLabSubjectFilter(subj)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${labSubjectFilter === subj ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}>
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Max</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLab.length > 0 ? (
                      filteredLab.map((mark, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-4 py-3 text-gray-700 font-medium">{mark.assignmentNo}</td>
                          <td className="px-4 py-3 text-gray-700">{mark.title}</td>
                          <td className="px-4 py-3 text-gray-500">{mark.subject}</td>
                          <td className="px-4 py-3 text-primary-700 font-semibold">{mark.marksObtained}</td>
                          <td className="px-4 py-3 text-gray-500">{mark.maxMarks}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                              (mark.marksObtained / mark.maxMarks) >= 0.7
                                ? 'bg-emerald-100 text-emerald-700'
                                : (mark.marksObtained / mark.maxMarks) >= 0.4
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {((mark.marksObtained / mark.maxMarks) * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No assignment marks yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Term Work Total */}
          {filteredLab.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-primary-100 font-medium">
                    Term Work Total {labSubjectFilter !== 'all' ? `(${labSubjectFilter})` : ''}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{assignmentTotal} / {assignmentMaxTotal}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-3xl sm:text-4xl font-bold">
                    {assignmentMaxTotal > 0 ? ((assignmentTotal / assignmentMaxTotal) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== MOCK TEST RESULTS ==================== */}
          {mockTests.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Mock Practical Exam Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {mockTests.map((mt, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{mt.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{mt.subject} • {new Date(mt.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        (mt.marksObtained / mt.maxMarks) >= 0.7
                          ? 'bg-emerald-100 text-emerald-700'
                          : (mt.marksObtained / mt.maxMarks) >= 0.4
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {((mt.marksObtained / mt.maxMarks) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{mt.marksObtained} <span className="text-sm font-normal text-gray-400">/ {mt.maxMarks}</span></p>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${(mt.marksObtained / mt.maxMarks) * 100}%` }} />
                    </div>
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

export default Marks;
