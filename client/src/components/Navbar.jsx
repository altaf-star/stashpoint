import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, house, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    if (!window.confirm("Log out?")) return;
    logout();
    navigate("/auth");
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="font-semibold text-emerald-700 truncate">
          {house?.name || "Stashpoint"}
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            aria-label="Search"
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <button
            onClick={handleLogout}
            title={user?.name}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium"
          >
            {(user?.name || "?").charAt(0).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}
