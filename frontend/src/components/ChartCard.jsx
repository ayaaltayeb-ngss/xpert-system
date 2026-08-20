function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="mb-4 flex items-center justify-between">

        <h3 className="text-sm font-semibold text-gray-800">
          {title}
        </h3>

        <button className="text-[10px] text-indigo-600 hover:underline">
          View Details
        </button>

      </div>

      {children}

    </div>
  );
}

export default ChartCard;