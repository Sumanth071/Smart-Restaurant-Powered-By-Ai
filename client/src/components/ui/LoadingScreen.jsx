const LoadingScreen = ({ label = "Loading smart restaurant workspace..." }) => (
  <div className="flex min-h-screen items-center justify-center px-6">
    <div className="glass-panel max-w-md p-8 text-center">
      <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
      <p className="text-sm leading-6 text-stone-600">{label}</p>
    </div>
  </div>
);

export default LoadingScreen;
