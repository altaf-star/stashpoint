import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useAuthStore } from "../store/authStore";

const TABS = [
  { key: "login", label: "Log In" },
  { key: "create", label: "Create House" },
  { key: "join", label: "Join House" },
];

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    houseName: "",
    inviteCode: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const endpoint =
        tab === "login" ? "/auth/login" : tab === "create" ? "/auth/register-house" : "/auth/join";

      const payload =
        tab === "login"
          ? { email: form.email, password: form.password }
          : tab === "create"
            ? { houseName: form.houseName, name: form.name, email: form.email, password: form.password }
            : { inviteCode: form.inviteCode, name: form.name, email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);
      setAuth(data);
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-emerald-700 text-center mb-1">Stashpoint</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          Know exactly where everything in your house is.
        </p>

        <div className="flex bg-slate-200/70 rounded-lg p-1 mb-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setError("");
              }}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition ${
                tab === t.key ? "bg-white shadow text-emerald-700" : "text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
          {tab === "create" && (
            <Field label="House name">
              <input
                required
                value={form.houseName}
                onChange={update("houseName")}
                placeholder="e.g. The Altaf House"
                className="input"
              />
            </Field>
          )}

          {tab === "join" && (
            <Field label="Invite code">
              <input
                required
                value={form.inviteCode}
                onChange={(e) => setForm((f) => ({ ...f, inviteCode: e.target.value.toUpperCase() }))}
                placeholder="e.g. 7F3KQ9"
                className="input uppercase tracking-widest"
              />
            </Field>
          )}

          {tab !== "login" && (
            <Field label="Your name">
              <input required value={form.name} onChange={update("name")} placeholder="e.g. Abdullah" className="input" />
            </Field>
          )}

          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className="input"
            />
          </Field>

          <Field label="Password">
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={update("password")}
              placeholder="At least 8 characters"
              className="input"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 text-white py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Please wait..." : TABS.find((t) => t.key === tab).label}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
