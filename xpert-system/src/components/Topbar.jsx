import {
  Search,
  Bell,
  HelpCircle,
} from "lucide-react";

function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">

      {/* Search */}
      <div className="relative w-80">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search knowledge base..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-indigo-300 focus:bg-white"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        <button className="text-gray-400 hover:text-gray-700">
          <HelpCircle size={17} />
        </button>

        <button className="relative text-gray-400 hover:text-gray-700">
          <Bell size={17} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
          AM
        </div>

      </div>

    </header>
  );
}

export default Topbar;