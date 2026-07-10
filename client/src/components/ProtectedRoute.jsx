import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Navbar from "./Navbar";

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
