import { Router } from "express";
import Item from "../models/Item.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getBreadcrumb } from "../utils/breadcrumb.js";

const router = Router();
router.use(requireAuth);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/search?q=noodles
// Partial, case-insensitive match on item name, scoped to the house.
// For each hit, resolves the full root->leaf breadcrumb (e.g. Kitchen,
// Cupboard 2) so the frontend can render "Noodles — Kitchen > Cupboard 2".
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.json({ results: [] });
    }

    const items = await Item.find({
      houseId: req.houseId,
      name: { $regex: escapeRegex(q), $options: "i" },
    })
      .sort({ name: 1 })
      .limit(25);

    const results = await Promise.all(
      items.map(async (item) => ({
        item,
        breadcrumb: await getBreadcrumb(item.containerId),
      }))
    );

    res.json({ results });
  })
);

export default router;
