// Add the animation globally if not already present in Tailwind config
const style = `
@keyframes progress-bar {
  0% { margin-left: -40%; }
  100% { margin-left: 100%; }
}
.animate-progress-bar {
  animation: progress-bar 1.2s cubic-bezier(0.4,0,0.2,1) infinite;
}
`;

export default function ProgressBar() {
  return (
    <div className="w-full h-1 bg-gray-200 overflow-hidden rounded">
      <style>{style}</style>
      <div
        className="h-full bg-blue-600 animate-progress-bar"
        style={{ width: "40%" }}
      />
    </div>
  );
}
