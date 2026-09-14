const CColorViewer = ({ color }: { color: string }) => (
  <span
    aria-label={`Cor ${color}`}
    className="h-4 w-4 shrink-0 rounded-full border border-gray-400"
    style={{ backgroundColor: color }}
  />
);

export default CColorViewer;
