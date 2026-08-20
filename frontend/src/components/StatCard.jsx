function StatCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {value}
          </h2>

          <p className="mt-1 text-[10px] text-gray-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default StatCard;