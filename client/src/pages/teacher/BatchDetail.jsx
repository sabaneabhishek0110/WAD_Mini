import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const BatchDetail = () => {
  const { batchName } = useParams();
  const [tab, setTab] = useState('sessions');
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [batchMarks, setBatchMarks] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Session form (no subject field)
  const [sessionForm, setSessionForm] = useState({ date: new Date().toISOString().split('T')[0], sessionTitle: '' });
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionAttendance, setSessionAttendance] = useState({});

  // Marks (no session picker — just assignment)
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [assignmentMarks, setAssignmentMarks] = useState({});

  // Mock test
  const [mockTestForm, setMockTestForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], maxMarks: 50 });
  const [selectedMockTest, setSelectedMockTest] = useState(null);
  const [mockTestMarks, setMockTestMarks] = useState({});

  const fetchData = async () => {
    try {
      const [studRes, sessRes, assRes, marksRes, mockRes] = await Promise.all([
        api.get(`/teacher/batch/${batchName}/students`),
        api.get(`/teacher/lab/sessions/${batchName}`),
        api.get('/teacher/assignments'),
        api.get(`/teacher/lab/batch/${batchName}/marks`),
        api.get(`/teacher/lab/mocktests/${batchName}`),
      ]);
      setStudents(studRes.data.data);
      setSessions(sessRes.data.data);
      setAssignments(assRes.data.data);
      setBatchMarks(marksRes.data.data);
      setMockTests(mockRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [batchName]);

  // Pre-fill marks when assignment selection changes
  useEffect(() => {
    if (selectedAssignment && batchMarks.length > 0) {
      const prefill = {};
      batchMarks
        .filter(m => m.assignmentId === selectedAssignment)
        .forEach(m => { prefill[m.studentId] = m.marksObtained; });
      setAssignmentMarks(prefill);
    } else {
      setAssignmentMarks({});
    }
  }, [selectedAssignment, batchMarks]);

  // Pre-fill mock test marks when mock test selection changes
  useEffect(() => {
    if (selectedMockTest) {
      const mt = mockTests.find(m => m._id === selectedMockTest);
      const prefill = {};
      mt?.studentMarks?.forEach(sm => {
        prefill[sm.student?._id || sm.student] = sm.marksObtained;
      });
      setMockTestMarks(prefill);
    } else {
      setMockTestMarks({});
    }
  }, [selectedMockTest, mockTests]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/teacher/lab/session', { batch: batchName, ...sessionForm });
      toast.success('Session created!');
      const { data } = await api.get(`/teacher/lab/sessions/${batchName}`);
      setSessions(data.data);
      setSessionForm({ date: new Date().toISOString().split('T')[0], sessionTitle: '' });
    } catch (error) {
      toast.error('Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAttendance = async (sessionId) => {
    setSubmitting(true);
    try {
      const attendanceData = Object.entries(sessionAttendance).map(([studentId, present]) => ({ studentId, present }));
      await api.put(`/teacher/lab/session/${sessionId}/attendance`, { attendance: attendanceData });
      toast.success('Attendance updated!');
      const { data } = await api.get(`/teacher/lab/sessions/${batchName}`);
      setSessions(data.data);
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedAssignment) return toast.error('Select an assignment first');
    setSubmitting(true);
    try {
      const marksData = Object.entries(assignmentMarks)
        .filter(([_, v]) => v !== '' && v !== undefined)
        .map(([studentId, marksObtained]) => ({
          studentId,
          marksObtained: Number(marksObtained),
        }));
      await api.put(`/teacher/lab/batch/${batchName}/marks`, { assignmentId: selectedAssignment, marks: marksData });
      toast.success('Marks saved!');
      // Refresh marks
      const { data } = await api.get(`/teacher/lab/batch/${batchName}/marks`);
      setBatchMarks(data.data);
    } catch (error) {
      toast.error('Failed to save marks');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMockTest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/teacher/lab/mocktest', { batch: batchName, ...mockTestForm });
      toast.success('Mock test created!');
      const { data } = await api.get(`/teacher/lab/mocktests/${batchName}`);
      setMockTests(data.data);
      setMockTestForm({ title: '', date: new Date().toISOString().split('T')[0], maxMarks: 50 });
    } catch (error) {
      toast.error('Failed to create mock test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMockTestMarks = async () => {
    if (!selectedMockTest) return;
    setSubmitting(true);
    try {
      const marksData = Object.entries(mockTestMarks)
        .filter(([_, v]) => v !== '' && v !== undefined)
        .map(([studentId, marksObtained]) => ({
          studentId,
          marksObtained: Number(marksObtained),
        }));
      await api.put(`/teacher/lab/mocktest/${selectedMockTest}/marks`, { marks: marksData });
      toast.success('Mock test marks saved!');
      const { data } = await api.get(`/teacher/lab/mocktests/${batchName}`);
      setMockTests(data.data);
    } catch (error) {
      toast.error('Failed to save mock test marks');
    } finally {
      setSubmitting(false);
    }
  };

  const openSession = (session) => {
    setSelectedSession(session._id === selectedSession ? null : session._id);
    const initAtt = {};
    students.forEach(s => {
      const existing = session.attendance?.find(a => a.student?._id === s._id);
      initAtt[s._id] = existing ? existing.present : true;
    });
    setSessionAttendance(initAtt);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      <TopHeader title={`Batch: ${batchName}`} />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 sm:mb-8 w-full sm:w-fit overflow-x-auto">
            {['sessions', 'marks', 'mocktest'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t === 'sessions' ? 'Sessions' : t === 'marks' ? 'Marks' : 'Mock Test'}
              </button>
            ))}
          </div>

          {/* ==================== SESSIONS TAB ==================== */}
          {tab === 'sessions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Create Session — NO subject field */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Session</h3>
                <form onSubmit={handleCreateSession} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input value={sessionForm.sessionTitle} onChange={e => setSessionForm({ ...sessionForm, sessionTitle: e.target.value })}
                      placeholder="e.g. Lab 1" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-500/20">
                    {submitting ? 'Creating...' : 'Create Session'}
                  </button>
                </form>
              </div>

              {/* Sessions List */}
              <div className="space-y-4">
                {sessions.map(session => (
                  <div key={session._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => openSession(session)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{session.sessionTitle || 'Lab Session'}</p>
                        <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()} {session.subject ? `• ${session.subject}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                          {session.attendance?.length || 0} students
                        </span>
                        <span className="text-gray-400">{selectedSession === session._id ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {selectedSession === session._id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-gray-100 p-5">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Attendance</h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                          {students.map(student => (
                            <div key={student._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                              <div>
                                <span className="text-sm text-gray-700">{student.name}</span>
                                {student.rollNumber && <span className="text-xs text-gray-400 ml-2">({student.rollNumber})</span>}
                              </div>
                              <button
                                onClick={() => setSessionAttendance(prev => ({ ...prev, [student._id]: !prev[student._id] }))}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                  sessionAttendance[student._id] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {sessionAttendance[student._id] ? 'Present' : 'Absent'}
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSaveAttendance(session._id)}
                          disabled={submitting}
                          className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Save Attendance
                        </button>
                      </motion.div>
                    )}
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-center text-gray-400 py-8">No sessions yet.</p>}
              </div>
            </motion.div>
          )}

          {/* ==================== MARKS TAB (No Session Picker) ==================== */}
          {tab === 'marks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 sm:gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Assignment</label>
                    <select
                      value={selectedAssignment}
                      onChange={e => setSelectedAssignment(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none min-w-[280px]"
                    >
                      <option value="">Choose assignment...</option>
                      {assignments.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.subject} - #{a.assignmentNo}: {a.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedAssignment && (
                  <>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {students.map(student => {
                        const ass = assignments.find(a => a._id === selectedAssignment);
                        return (
                          <div key={student._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                            <div>
                              <span className="text-sm font-medium text-gray-700">{student.name}</span>
                              {student.rollNumber && <span className="text-xs text-gray-400 ml-2">({student.rollNumber})</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={ass?.maxMarks || 25}
                                placeholder="0"
                                value={assignmentMarks[student._id] ?? ''}
                                onChange={e => setAssignmentMarks(prev => ({ ...prev, [student._id]: e.target.value }))}
                                className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:ring-2 focus:ring-primary-500 outline-none"
                              />
                              <span className="text-xs text-gray-400">/ {ass?.maxMarks || 25}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleSaveMarks}
                      disabled={submitting || !selectedAssignment}
                      className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-500/20"
                    >
                      {submitting ? 'Saving...' : 'Submit Marks'}
                    </button>
                  </>
                )}

                {/* Show existing marks summary */}
                {batchMarks.length > 0 && (
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Saved Marks Overview</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roll No.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assignment</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchMarks.map((m, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="px-4 py-3 text-gray-700">{m.studentName}</td>
                              <td className="px-4 py-3 text-gray-500">{m.studentRollNumber || '—'}</td>
                              <td className="px-4 py-3 text-gray-700">#{m.assignmentNo} - {m.assignmentTitle}</td>
                              <td className="px-4 py-3">
                                <span className="text-primary-700 font-semibold">{m.marksObtained}</span>
                                <span className="text-gray-400"> / {m.maxMarks}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ==================== MOCK TEST TAB ==================== */}
          {tab === 'mocktest' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Create Mock Test */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Create Mock Practical Exam</h3>
                <form onSubmit={handleCreateMockTest} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input value={mockTestForm.title} onChange={e => setMockTestForm({ ...mockTestForm, title: e.target.value })}
                      required placeholder="e.g. Mock Practical 1"
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={mockTestForm.date} onChange={e => setMockTestForm({ ...mockTestForm, date: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                    <input type="number" min="1" value={mockTestForm.maxMarks} onChange={e => setMockTestForm({ ...mockTestForm, maxMarks: e.target.value })}
                      className="w-24 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 shadow-md shadow-amber-500/20">
                    {submitting ? 'Creating...' : 'Create Mock Test'}
                  </button>
                </form>
              </div>

              {/* Mock Tests List */}
              <div className="space-y-4">
                {mockTests.map(mt => (
                  <div key={mt._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setSelectedMockTest(selectedMockTest === mt._id ? null : mt._id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{mt.title}</p>
                        <p className="text-sm text-gray-500">{new Date(mt.date).toLocaleDateString()} {mt.subject ? `• ${mt.subject}` : ''} • Max: {mt.maxMarks}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
                          {mt.studentMarks?.length || 0} graded
                        </span>
                        <span className="text-gray-400">{selectedMockTest === mt._id ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {selectedMockTest === mt._id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-gray-100 p-5">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Student Marks</h4>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
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
                                  max={mt.maxMarks}
                                  placeholder="0"
                                  value={mockTestMarks[student._id] ?? ''}
                                  onChange={e => setMockTestMarks(prev => ({ ...prev, [student._id]: e.target.value }))}
                                  className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                                <span className="text-xs text-gray-400">/ {mt.maxMarks}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleSaveMockTestMarks}
                          disabled={submitting}
                          className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                        >
                          {submitting ? 'Saving...' : 'Save Mock Test Marks'}
                        </button>
                      </motion.div>
                    )}
                  </div>
                ))}
                {mockTests.length === 0 && <p className="text-center text-gray-400 py-8">No mock tests yet.</p>}
              </div>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default BatchDetail;
