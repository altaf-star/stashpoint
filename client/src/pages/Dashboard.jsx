import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import ContainerIcon from "../components/ContainerIcon";
import AddContainerModal from "../components/AddContainerModal";

export default function Dashboard() {
  const house = useAuthStore((s) => s.house);
  const setHouse = useAuthStore((s) => s.setHouse);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRooms();
    // register/login responses only include raw member ids — refresh here
    // to get the populated { name, email } list for the members strip.
    api.get("/auth/me").then(({ data }) => setHouse(data.house));
  }, []);

  async function loadRooms() {
    setLoading(true);
    const { data } = await api.get("/containers", { params: { parentId: "root" } });
    setRooms(data.containers);
    setLoading(false);
  }

  function copyInviteCode() {
    navigator.clipboard.writeText(house?.inviteCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Invite code</p>
            <p className="font-mono text-lg font-semibold tracking-widest text-emerald-700">
              {house?.inviteCode}
            </p>
          </div>
          <button
            onClick={copyInviteCode}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {/* register/login responses carry members as raw ids; only render
            once /auth/me has swapped in the populated {name, email} objects */}
        {house?.members?.length > 0 && typeof house.members[0] === "object" && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1.5">{house.members.length} member(s)</p>
            <div className="flex flex-wrap gap-1.5">
              {house.members.map((m) => (
                <span
                  key={m._id}
                  className="text-xs bg-slate-100 text-slate-700 rounded-full px-2.5 py-1"
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Rooms</h2>
          <button
            onClick={() => setShowAddRoom(true)}
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
          >
            <PlusIcon /> Add room
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : rooms.length === 0 ? (
          <EmptyState onAdd={() => setShowAddRoom(true)} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rooms.map((room) => (
              <Link
                key={room._id}
                to={`/containers/${room._id}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-emerald-400 hover:shadow-sm transition"
              >
                <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ContainerIcon type={room.type} isRoom />
                </span>
                <span className="text-sm font-medium text-slate-900 text-center truncate w-full">
                  {room.name}
                </span>
                <span className="text-xs text-slate-400">{room.type}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {showAddRoom && (
        <AddContainerModal
          isRoot
          onClose={() => setShowAddRoom(false)}
          onCreated={(room) => setRooms((r) => [...r, room])}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
      <p className="text-sm text-slate-500 mb-3">No rooms yet. Add your first one.</p>
      <button
        onClick={onAdd}
        className="text-sm font-medium text-white bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700"
      >
        Add a room
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
