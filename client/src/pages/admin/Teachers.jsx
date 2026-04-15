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

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', assignedClasses: '', assignedBatches: '' });

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/admin/teachers');
      setTeachers(data.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const assignedClasses = form.assignedClasses
        ? form.assignedClasses.split(',').map(pair => {
            const [cls, subject] = pair.trim().split(':');
            return { class: cls?.trim(), subject: subject?.trim() };
          }).filter(c => c.class && c.subject)
        : [];
      const assignedBatches = form.assignedBatches
        ? form.assignedBatches.split(',').map(pair => {
            const [batch, subject] = pair.trim().split(':');
            return { batch: batch?.trim(), subject: subject?.trim() };
          }).filter(b => b.batch && b.subject)
        : [];

      await api.post('/admin/teachers', {
        name: form.name, email: form.email, password: form.password,
        assignedClasses, assignedBatches,
      });
      toast.success('Teacher added successfully');
      setShowAddModal(false);
      setForm({ name: '', email: '', password: '', assignedClasses: '', assignedBatches: '' });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/teachers/${selectedTeacher._id}`);
      toast.success('Teacher deleted');
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Classes',
      accessor: (row) => row.assignedClasses?.map(c => `${c.class} (${c.subject})`).join(', ') || '—',
    },
    {
      header: 'Batches',
      accessor: (row) => row.assignedBatches?.map(b => `${b.batch} (${b.subject})`).join(', ') || '—',
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedTeacher(row); setShowDeleteModal(true); }}
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
      <TopHeader title="Teachers" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-gray-500">{teachers.length} teacher(s) found</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                <HiOutlineCloudArrowUp className="w-4 h-4" />
                Upload CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add Teacher
              </button>
            </div>
          </div>

          <DataTable columns={columns} data={teachers} />

          {/* Add Modal */}
          <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Teacher">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Classes <span className="text-gray-400">(format: TE09:DBMS, TE10:OS)</span></label>
                <input value={form.assignedClasses} onChange={e => setForm({ ...form, assignedClasses: e.target.value })}
                  placeholder="TE09:DBMS, TE10:OS" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Batches <span className="text-gray-400">(format: K9:DBMS Lab, L9:DBMS Lab)</span></label>
                <input value={form.assignedBatches} onChange={e => setForm({ ...form, assignedBatches: e.target.value })}
                  placeholder="K9:DBMS Lab, L9:DBMS Lab" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20">Add Teacher</button>
              </div>
            </form>
          </Modal>

          {/* Upload Modal */}
          <CsvUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            uploadUrl="/admin/upload/teachers"
            title="Upload Teachers CSV"
            onSuccess={fetchTeachers}
          />

          {/* Delete Confirmation */}
          <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Teacher">
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{selectedTeacher?.name}</strong>? This action cannot be undone.</p>
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

export default Teachers;
