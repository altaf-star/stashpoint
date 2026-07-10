import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    containerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Container",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "addedAt", updatedAt: "updatedAt" } }
);

itemSchema.index({ houseId: 1, name: "text" });

export default mongoose.model("Item", itemSchema);
