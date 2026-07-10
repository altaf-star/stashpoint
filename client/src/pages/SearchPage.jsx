import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

// Debounced search-as-you-type against GET /api/search?q=
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const { data } = await api.get("/search", { params: { q: query.trim() } });
      if (requestId !== requestIdRef.current) return; // stale response, ignore
      setResults(data.results);
      setSearched(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an item..."
          className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading && <p className="text-sm text-slate-500">Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-sm text-slate-400">No items match "{query}".</p>
      )}

      <ul className="space-y-2">
        {results.map(({ item, breadcrumb }) => (
          <li key={item._id}>
            <Link
              to={`/containers/${item.containerId}`}
              className="block bg-white border border-slate-200 rounded-2xl px-4 py-3 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <p className="text-sm font-semibold text-slate-900">
                {item.name} <span className="text-slate-400 font-normal">· qty {item.quantity}</span>
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {breadcrumb.map((n) => n.name).join(" → ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
