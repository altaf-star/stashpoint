import { Router } from "express";
import House from "../models/House.js";
import User from "../models/User.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

// Invite codes are 6 chars from a 33-char alphabet (~1.6B combos), so
// collisions are rare — but retry a few times rather than 500ing on one.
async function createHouseWithUniqueCode(houseName) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await House.create({ name: houseName });
    } catch (err) {
      if (err?.code === 11000 && attempt < 4) continue;
      throw err;
    }
  }
}

// POST /api/auth/register-house
// Creates a brand new House plus its first User (the "admin" is just
// whoever created it — there's no separate role system, all members are equal).
router.post(
  "/register-house",
  asyncHandler(async (req, res) => {
    const { houseName, name, email, password } = req.body;

    if (!houseName || !name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const house = await createHouseWithUniqueCode(houseName);

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      houseId: house._id,
    });

    house.members.push(user._id);
    await house.save();

    const token = signToken(user);
    res.status(201).json({ token, user, house });
  })
);

// POST /api/auth/join
// Joins an existing house via its invite code.
router.post(
  "/join",
  asyncHandler(async (req, res) => {
    const { inviteCode, name, email, password } = req.body;

    if (!inviteCode || !name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const house = await House.findOne({
      inviteCode: inviteCode.toUpperCase(),
    });
    if (!house) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      houseId: house._id,
    });

    house.members.push(user._id);
    await house.save();

    const token = signToken(user);
    res.status(201).json({ token, user, house });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const house = await House.findById(user.houseId);
    const token = signToken(user);
    res.json({ token, user, house });
  })
);

// GET /api/auth/me
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const house = await House.findById(req.houseId).populate(
      "members",
      "name email"
    );
    res.json({ user: req.user, house });
  })
);

export default router;
