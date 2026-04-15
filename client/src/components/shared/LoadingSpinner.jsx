const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`animate-spin rounded-full ${sizes[size]} border-primary-500 border-t-transparent`} />
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-primary-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title || 'No data available'}</h3>
      {description && <p className="text-sm text-gray-400 max-w-sm">{description}</p>}
    </div>
  );
};

export { LoadingSpinner, EmptyState };
