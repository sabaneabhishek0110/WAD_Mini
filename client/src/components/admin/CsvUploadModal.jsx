import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Modal from '../shared/Modal';
import { HiOutlineCloudArrowUp, HiOutlineDocument, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CsvUploadModal = ({ isOpen, onClose, uploadUrl, title, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === 'text/csv' || dropped.name.endsWith('.csv'))) {
      setFile(dropped);
      setResult(null);
    } else {
      toast.error('Please upload a CSV file');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data);
      toast.success(data.message || 'Upload successful');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title || 'Upload CSV'}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <HiOutlineDocument className="w-10 h-10 text-primary-500" />
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <HiOutlineCloudArrowUp className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              Drag & drop CSV here, or <span className="text-primary-600">browse</span>
            </p>
            <p className="text-xs text-gray-400">Only .csv files are accepted</p>
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="mt-5 flex justify-end gap-3">
        <button onClick={handleClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-primary-500/20"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Uploading...
            </span>
          ) : 'Upload'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <HiOutlineCheckCircle className="w-5 h-5" />
              <span className="font-medium">{result.inserted} inserted</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <HiOutlineXCircle className="w-5 h-5" />
              <span className="font-medium">{result.skipped} skipped</span>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto">
              {result.errors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-xs text-red-500 mt-1">Row {err.row}: {err.message}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </Modal>
  );
};

export default CsvUploadModal;
