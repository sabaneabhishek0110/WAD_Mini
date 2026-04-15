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

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', class: '', batch: '', rollNumber: '' });

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/students');
      setStudents(data.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', form);
      toast.success('Student added successfully');
      setShowAddModal(false);
      setForm({ name: '', email: '', password: '', class: '', batch: '', rollNumber: '' });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/students/${selectedStudent._id}`);
      toast.success('Student deleted');
      setShowDeleteModal(false);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const columns = [
    { header: 'Roll No.', accessor: 'rollNumber', render: (row) => row.rollNumber || '—' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Class', accessor: 'class' },
    { header: 'Batch', accessor: 'batch' },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedStudent(row); setShowDeleteModal(true); }}
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
      <TopHeader title="Students" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-gray-500">{students.length} student(s) found</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors">
                <HiOutlineCloudArrowUp className="w-4 h-4" /> Upload CSV
              </button>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">
                <HiOutlinePlus className="w-4 h-4" /> Add Student
              </button>
            </div>
          </div>

          <DataTable columns={columns} data={students} />

          <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Student">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                  placeholder="e.g. 33361" maxLength={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                <p className="text-xs text-gray-400 mt-1">5 digits: Year(1) + Dept(1) + Division(1) + Number(2)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
                    required placeholder="e.g. TE09" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <input value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}
                    required placeholder="e.g. K9" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20">Add Student</button>
              </div>
            </form>
          </Modal>

          <CsvUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} uploadUrl="/admin/upload/students" title="Upload Students CSV" onSuccess={fetchStudents} />

          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Student">
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{selectedStudent?.name}</strong>?</p>
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

export default Students;
