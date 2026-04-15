import { useState, useEffect } from 'react';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import CsvUploadModal from '../../components/admin/CsvUploadModal';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineCloudArrowUp, HiOutlineTrash } from 'react-icons/hi2';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [form, setForm] = useState({ subject: '', assignmentNo: '', title: '', maxMarks: '25' });

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/admin/assignments');
      setAssignments(data.data);
    } catch (error) {
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/assignments', {
        ...form,
        assignmentNo: Number(form.assignmentNo),
        maxMarks: Number(form.maxMarks),
      });
      toast.success('Assignment added successfully');
      setShowAddModal(false);
      setForm({ subject: '', assignmentNo: '', title: '', maxMarks: '25' });
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add assignment');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/assignments/${selectedAssignment._id}`);
      toast.success('Assignment deleted');
      setShowDeleteModal(false);
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const columns = [
    { header: 'Subject', accessor: 'subject' },
    { header: 'No.', accessor: 'assignmentNo' },
    { header: 'Title', accessor: 'title' },
    { header: 'Max Marks', accessor: 'maxMarks' },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedAssignment(row); setShowDeleteModal(true); }}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      <TopHeader title="Assignments" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-gray-500">{assignments.length} assignment(s) found</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors">
                <HiOutlineCloudArrowUp className="w-4 h-4" /> Upload CSV
              </button>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">
                <HiOutlinePlus className="w-4 h-4" /> Add Assignment
              </button>
            </div>
          </div>

          <DataTable columns={columns} data={assignments} />

          <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Assignment">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  required placeholder="e.g. DBMS Lab" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignment No.</label>
                  <input type="number" value={form.assignmentNo} onChange={e => setForm({ ...form, assignmentNo: e.target.value })}
                    required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                  <input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  required placeholder="e.g. ER Diagram Design" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20">Add Assignment</button>
              </div>
            </form>
          </Modal>

          <CsvUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} uploadUrl="/admin/upload/assignments" title="Upload Assignments CSV" onSuccess={fetchAssignments} />

          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Assignment">
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{selectedAssignment?.title}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleDelete} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-md">Delete</button>
            </div>
          </Modal>
        </div>
      </PageTransition>
    </>
  );
};

export default Assignments;
