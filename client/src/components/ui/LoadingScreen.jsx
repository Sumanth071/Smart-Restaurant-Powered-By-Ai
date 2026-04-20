const LoadingScreen = ({ label = "Loading smart restaurant workspace..." }) => (
  <div className="flex min-h-screen items-center justify-center px-6">
    <div className="glass-card max-w-md p-8 text-center">
      <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-amber-300/20 border-t-amber-400" />
      <p className="text-sm text-slate-200">{label}</p>
    </div>
  </div>
);

export default LoadingScreen;
