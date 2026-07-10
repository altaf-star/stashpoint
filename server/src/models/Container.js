import mongoose from "mongoose";

// One recursive model for the whole hierarchy: Room > Container > Sub-container.
// `parentId: null` marks a top-level container (a "Room"). `type` is a free-form
// label ("Room", "Fridge", "Cupboard", "Drawer", or anything custom the user
// types) — it's just metadata for icon/display purposes, not a different schema.
const containerSchema = new mongoose.Schema(
  {
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Container",
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, default: "Container" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

containerSchema.index({ houseId: 1, parentId: 1 });

export default mongoose.model("Container", containerSchema);
