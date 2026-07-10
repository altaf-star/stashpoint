import { useState } from "react";
import Modal from "./Modal";
import { api, errorMessage } from "../api/client";

export default function AddItemModal({ containerId, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { data } = await api.post("/items", {
        name: name.trim(),
        quantity: Number(quantity) || 1,
        tags,
        containerId,
      });
      onCreated(data.item);
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Could not add the item. Try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add an item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Item name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Noodles"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tags <span className="text-slate-400 font-normal">(comma separated, optional)</span>
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="grocery, frozen"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-600 text-white py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add item"}
        </button>
      </form>
    </Modal>
  );
}
