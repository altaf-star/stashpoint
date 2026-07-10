import { Router } from "express";
import mongoose from "mongoose";
import Container from "../models/Container.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cascadeDeleteContainer } from "../utils/cascadeDelete.js";
import { getBreadcrumb } from "../utils/breadcrumb.js";

const router = Router();
router.use(requireAuth);

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/containers?parentId=<id|root>
// Lists direct children of a container. parentId=root (or omitted) lists
// top-level Rooms. This is how the frontend drills down one level at a time
// rather than fetching the whole tree up front.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { parentId } = req.query;
    const filter = { houseId: req.houseId };
    filter.parentId = !parentId || parentId === "root" ? null : parentId;

    const containers = await Container.find(filter).sort({ createdAt: 1 });
    res.json({ containers });
  })
);

// GET /api/containers/:id
// Returns the container itself, its direct children, the items inside it,
// and its breadcrumb path — everything one drill-down screen needs.
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid container id" });
    }

    const container = await Container.findOne({
      _id: req.params.id,
      houseId: req.houseId,
    });
    if (!container) {
      return res.status(404).json({ message: "Container not found" });
    }

    const [children, breadcrumb] = await Promise.all([
      Container.find({ houseId: req.houseId, parentId: container._id }).sort({
        createdAt: 1,
      }),
      getBreadcrumb(container._id),
    ]);

    res.json({ container, children, breadcrumb });
  })
);

// POST /api/containers
// body: { name, type, parentId }  — parentId null/omitted = top-level Room
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, type, parentId } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: "name and type are required" });
    }

    if (parentId) {
      if (!isValidObjectId(parentId)) {
        return res.status(400).json({ message: "Invalid parentId" });
      }
      const parent = await Container.findOne({
        _id: parentId,
        houseId: req.houseId,
      });
      if (!parent) {
        return res.status(404).json({ message: "Parent container not found" });
      }
    }

    const container = await Container.create({
      houseId: req.houseId,
      parentId: parentId || null,
      name,
      type,
      createdBy: req.user._id,
    });

    res.status(201).json({ container });
  })
);

// PATCH /api/containers/:id
// body: { name?, type? } — reparenting is intentionally not supported here to
// avoid accidentally creating a cycle; delete + recreate covers that rare case.
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid container id" });
    }

    const { name, type } = req.body;
    const update = {};
    if (name) update.name = name;
    if (type) update.type = type;

    const container = await Container.findOneAndUpdate(
      { _id: req.params.id, houseId: req.houseId },
      update,
      { new: true }
    );
    if (!container) {
      return res.status(404).json({ message: "Container not found" });
    }

    res.json({ container });
  })
);

// DELETE /api/containers/:id
// Cascades: removes every nested sub-container and every item inside them.
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid container id" });
    }

    const container = await Container.findOne({
      _id: req.params.id,
      houseId: req.houseId,
    });
    if (!container) {
      return res.status(404).json({ message: "Container not found" });
    }

    const deletedIds = await cascadeDeleteContainer(container._id, req.houseId);
    res.json({ deletedContainerIds: deletedIds });
  })
);

export default router;
