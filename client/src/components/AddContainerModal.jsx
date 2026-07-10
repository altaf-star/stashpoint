import { useState } from "react";
import Modal from "./Modal";
import { api, errorMessage } from "../api/client";

const ROOM_TYPES = ["Kitchen", "Bedroom", "Lounge", "Bathroom", "Garage", "Custom..."];
const CONTAINER_TYPES = ["Cupboard", "Fridge", "Deep Freezer", "Drawer", "Side Table", "Shelf", "Custom..."];

// isRoot: true when adding a top-level Room, false when adding inside a parent
// container. Same modal, different type suggestions and endpoint payload.
export default function AddContainerModal({ isRoot, parentId, onClose, onCreated }) {
  const suggestions = isRoot ? ROOM_TYPES : CONTAINER_TYPES;
  const [type, setType] = useState(suggestions[0]);
  const [customType, setCustomType] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const resolvedType = type === "Custom..." ? customType.trim() : type;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !resolvedType) {
      setError("Please fill in both the name and type.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/containers", {
        name: name.trim(),
        type: resolvedType,
        parentId: isRoot ? null : parentId,
      });
      onCreated(data.container);
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Could not create it. Try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isRoot ? "Add a room" : "Add a container"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isRoot ? "Room type" : "Container type"}
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  type === t
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-slate-300 text-slate-700 hover:border-emerald-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {type === "Custom..." && (
            <input
              autoFocus
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="e.g. Wine Rack"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isRoot ? "Room name" : "Name"}
          </label>
          <input
            autoFocus={type !== "Custom..."}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRoot ? "e.g. Kitchen" : "e.g. Cupboard 2"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-600 text-white py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </form>
    </Modal>
  );
}
