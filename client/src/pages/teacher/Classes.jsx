import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopHeader from '../../components/shared/TopHeader';
import PageTransition from '../../components/shared/PageTransition';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { HiOutlineBookOpen } from 'react-icons/hi2';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get('/teacher/classes');
        setClasses(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      <TopHeader title="My Classes" />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {classes.map((cls, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/teacher/classes/${cls.class}`}
                  className="block bg-gradient-to-br from-primary-700 to-primary-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <HiOutlineBookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">{cls.class}</h3>
                    <p className="text-primary-100 text-sm mt-1">{cls.subject}</p>
                    <p className="text-xs text-primary-200 mt-3">Click to manage →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-3 text-center py-16">
                <p className="text-gray-400">No classes assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Classes;
