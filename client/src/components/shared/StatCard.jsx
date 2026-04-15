import { motion } from 'framer-motion';

const gradients = [
  'from-primary-700 to-primary-500',
  'from-blue-600 to-cyan-500',
  'from-indigo-600 to-blue-500',
  'from-violet-600 to-indigo-500',
  'from-primary-800 to-primary-600',
];

const StatCard = ({ icon: Icon, label, value, index = 0 }) => {
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-gradient-to-br ${gradient} text-white rounded-2xl p-4 sm:p-6 shadow-lg cursor-default relative overflow-hidden`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold">{value}</p>
        <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
