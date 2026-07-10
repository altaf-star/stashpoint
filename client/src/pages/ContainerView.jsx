import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import ContainerIcon from "../components/ContainerIcon";
import AddContainerModal from "../components/AddContainerModal";
import AddItemModal from "../components/AddItemModal";

export default function ContainerView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [container, setContainer] = useState(null);
  const [children, setChildren] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddContainer, setShowAddContainer] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  useEffect(() => {
    load(id);
  }, [id]);

  async function load(containerId) {
    setLoading(true);
    const [detail, itemsRes] = await Promise.all([
      api.get(`/containers/${containerId}`),
      api.get("/items", { params: { containerId } }),
    ]);
    setContainer(detail.data.container);
    setChildren(detail.data.children);
    setBreadcrumb(detail.data.breadcrumb);
    setItems(itemsRes.data.items);
    setLoading(false);
  }

  async function handleDeleteContainer() {
    if (!window.confirm(`Delete "${container.name}" and everything inside it?`)) return;
    await api.delete(`/containers/${container._id}`);
    if (container.parentId) navigate(`/containers/${container.parentId}`);
    else navigate("/dashboard");
  }

  async function handleDeleteItem(itemId) {
    await api.delete(`/items/${itemId}`);
    setItems((prev) => prev.filter((it) => it._id !== itemId));
  }

  if (loading || !container) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb trail={breadcrumb} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ContainerIcon type={container.type} isRoom={!container.parentId} />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 truncate">{container.name}</h1>
            <p className="text-xs text-slate-400">{container.type}</p>
          </div>
        </div>
        <button
          onClick={handleDeleteContainer}
          className="text-xs text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
        >
          Delete
        </button>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Sub-containers</h2>
          <button
            onClick={() => setShowAddContainer(true)}
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
          >
            <PlusIcon /> Add
          </button>
        </div>

        {children.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing nested here yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {children.map((c) => (
              <Link
                key={c._id}
                to={`/containers/${c._id}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-emerald-400 hover:shadow-sm transition"
              >
                <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ContainerIcon type={c.type} />
                </span>
                <span className="text-sm font-medium text-slate-900 text-center truncate w-full">{c.name}</span>
                <span className="text-xs text-slate-400">{c.type}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Items</h2>
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
          >
            <PlusIcon /> Add item
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No items here yet.</p>
        ) : (
          <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item._id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    Qty {item.quantity}
                    {item.tags?.length > 0 && <> · {item.tags.join(", ")}</>}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="text-xs text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showAddContainer && (
        <AddContainerModal
          isRoot={false}
          parentId={container._id}
          onClose={() => setShowAddContainer(false)}
          onCreated={(c) => setChildren((prev) => [...prev, c])}
        />
      )}

      {showAddItem && (
        <AddItemModal
          containerId={container._id}
          onClose={() => setShowAddItem(false)}
          onCreated={(item) => setItems((prev) => [item, ...prev])}
        />
      )}
    </div>
  );
}

function Breadcrumb({ trail }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
      <Link to="/dashboard" className="hover:text-emerald-700 shrink-0">
        Home
      </Link>
      {trail.map((node, i) => (
        <span key={node._id} className="flex items-center gap-1 shrink-0">
          <span className="text-slate-300">/</span>
          {i === trail.length - 1 ? (
            <span className="text-slate-700 font-medium">{node.name}</span>
          ) : (
            <Link to={`/containers/${node._id}`} className="hover:text-emerald-700">
              {node.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
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
