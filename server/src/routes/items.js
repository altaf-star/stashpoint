import { Router } from "express";
import mongoose from "mongoose";
import Item from "../models/Item.js";
import Container from "../models/Container.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/items?containerId=<id>
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { containerId } = req.query;
    if (!containerId || !isValidObjectId(containerId)) {
      return res.status(400).json({ message: "Valid containerId is required" });
    }

    const items = await Item.find({
      houseId: req.houseId,
      containerId,
    }).sort({ addedAt: -1 });
    res.json({ items });
  })
);

// POST /api/items
// body: { name, quantity?, tags?, containerId }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, quantity, tags, containerId } = req.body;
    if (!name || !containerId || !isValidObjectId(containerId)) {
      return res
        .status(400)
        .json({ message: "name and valid containerId are required" });
    }

    const container = await Container.findOne({
      _id: containerId,
      houseId: req.houseId,
    });
    if (!container) {
      return res.status(404).json({ message: "Container not found" });
    }

    const item = await Item.create({
      houseId: req.houseId,
      containerId,
      name,
      quantity: quantity ?? 1,
      tags: Array.isArray(tags) ? tags : [],
      addedBy: req.user._id,
    });

    res.status(201).json({ item });
  })
);

// PATCH /api/items/:id
// body: { name?, quantity?, tags?, containerId? } — containerId lets the
// frontend "move" an item to a different container without a delete+recreate.
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const { name, quantity, tags, containerId } = req.body;
    const update = {};
    if (name) update.name = name;
    if (quantity !== undefined) update.quantity = quantity;
    if (tags) update.tags = tags;

    if (containerId) {
      if (!isValidObjectId(containerId)) {
        return res.status(400).json({ message: "Invalid containerId" });
      }
      const container = await Container.findOne({
        _id: containerId,
        houseId: req.houseId,
      });
      if (!container) {
        return res.status(404).json({ message: "Container not found" });
      }
      update.containerId = containerId;
    }

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, houseId: req.houseId },
      update,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ item });
  })
);

// DELETE /api/items/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      houseId: req.houseId,
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ deleted: true });
  })
);

export default router;
