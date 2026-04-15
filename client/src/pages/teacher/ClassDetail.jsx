import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ClassDetail = () => {
  const { className } = useParams();
  const [tab, setTab] = useState('attendance');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [testNo, setTestNo] = useState(1);
  const [marks, setMarks] = useState({});
  const [utHistory, setUtHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Teacher's assigned subject for this class
  const [assignedSubject, setAssignedSubject] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, attRes, utRes, profileRes] = await Promise.all([
          api.get(`/teacher/class/${className}/students`),
          api.get(`/teacher/theory/attendance/${className}`),
          api.get(`/teacher/theory/unitTests/${className}`),
          api.get('/teacher/profile'),
        ]);
        setStudents(studRes.data.data);
        setAttendanceHistory(attRes.data.data);
        setUtHistory(utRes.data.data);

        // Find the subject this teacher teaches for this class
        const profile = profileRes.data.data;
        const classEntry = profile.assignedClasses?.find(c => c.class === className);
        setAssignedSubject(classEntry?.subject || '');

        // Initialize attendance to all present
        const init = {};
        studRes.data.data.forEach(s => { init[s._id] = true; });
        setAttendance(init);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [className]);

  const handleSubmitAttendance = async () => {
    if (!assignedSubject) return toast.error('No subject assigned for this class');
    setSubmitting(true);
    try {
      const attendanceData = Object.entries(attendance).map(([studentId, present]) => ({ studentId, present }));
      await api.post('/teacher/theory/attendance', {
        class: className,
        subject: assignedSubject,
        date,
        attendance: attendanceData,
      });
      toast.success('Attendance saved!');
      const { data } = await api.get(`/teacher/theory/attendance/${className}`);
      setAttendanceHistory(data.data);
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitUT = async () => {
    if (!assignedSubject) return toast.error('No subject assigned for this class');
    setSubmitting(true);
    try {
      const marksData = Object.entries(marks)
        .filter(([_, v]) => v !== '' && v !== undefined)
        .map(([studentId, marksObtained]) => ({ studentId, marksObtained: Number(marksObtained), maxMarks: 20 }));

      await api.post('/teacher/theory/unittest', {
        class: className,
        subject: assignedSubject,
        testNo,
        marks: marksData,
      });
      toast.success('Unit test marks saved!');
      const { data } = await api.get(`/teacher/theory/unitTests/${className}`);
      setUtHistory(data.data);
    } catch (error) {
      toast.error('Failed to save marks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  // Filter attendance history to only show records for this teacher's subject
  const filteredAttendanceHistory = attendanceHistory.filter(r => r.subject === assignedSubject);
  const filteredUtHistory = utHistory.filter(r => r.subject === assignedSubject);

  return (
    <>
      <TopHeader title={`Class: ${className}`} />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Subject Badge */}
          {assignedSubject && (
            <div className="mb-6">
              <span className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold">
                Subject: {assignedSubject}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 sm:mb-8 w-full sm:w-fit overflow-x-auto">
            {['attendance', 'unittests'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'attendance' ? 'Attendance' : 'Unit Tests'}
              </button>
            ))}
          </div>

          {tab === 'attendance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                  </div>
                  <div className="pt-6">
                    <p className="text-sm text-gray-500">
                      Marking attendance for <strong className="text-primary-700">{assignedSubject}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {students.map(student => (
                    <div key={student._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{student.name}</span>
                        {student.rollNumber && <span className="text-xs text-gray-400 ml-2">({student.rollNumber})</span>}
                      </div>
                      <button
                        onClick={() => setAttendance(prev => ({ ...prev, [student._id]: !prev[student._id] }))}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          attendance[student._id]
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {attendance[student._id] ? 'Present' : 'Absent'}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmitAttendance}
                  disabled={submitting}
                  className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-500/20"
                >
                  {submitting ? 'Saving...' : 'Submit Attendance'}
                </button>
              </div>

              {/* History — filtered to teacher's subject */}
              {filteredAttendanceHistory.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance History ({assignedSubject})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Present</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Absent</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendanceHistory.slice(0, 10).map(record => {
                          const present = record.attendance.filter(a => a.present).length;
                          const total = record.attendance.length;
                          return (
                            <tr key={record._id} className="border-b border-gray-50">
                              <td className="px-4 py-3 text-gray-700">{new Date(record.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-gray-500">{record.subject}</td>
                              <td className="px-4 py-3 text-emerald-600 font-medium">{present}</td>
                              <td className="px-4 py-3 text-red-600 font-medium">{total - present}</td>
                              <td className="px-4 py-3 text-gray-500">{total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'unittests' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Entering UT marks for <strong className="text-primary-700">{assignedSubject}</strong>
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Test</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setTestNo(n)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                          testNo === n ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        UT {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {students.map(student => (
                    <div key={student._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{student.name}</span>
                        {student.rollNumber && <span className="text-xs text-gray-400 ml-2">({student.rollNumber})</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          placeholder="0"
                          value={marks[student._id] || ''}
                          onChange={e => setMarks(prev => ({ ...prev, [student._id]: e.target.value }))}
                          className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                        <span className="text-xs text-gray-400">/ 20</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmitUT}
                  disabled={submitting}
                  className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-500/20"
                >
                  {submitting ? 'Saving...' : 'Submit Marks'}
                </button>
              </div>

              {/* UT History — filtered to teacher's subject */}
              {filteredUtHistory.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">UT History ({assignedSubject})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Students</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tests Recorded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUtHistory.map(record => {
                          const testNos = [...new Set(record.unitTests.map(ut => ut.testNo))];
                          return (
                            <tr key={record._id} className="border-b border-gray-50">
                              <td className="px-4 py-3 text-gray-700 font-medium">{record.subject}</td>
                              <td className="px-4 py-3 text-gray-500">{record.unitTests.length} entries</td>
                              <td className="px-4 py-3">
                                {testNos.sort().map(tn => (
                                  <span key={tn} className="inline-block mr-2 px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                                    UT {tn}
                                  </span>
                                ))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default ClassDetail;
