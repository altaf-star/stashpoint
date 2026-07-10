import mongoose from "mongoose";
import crypto from "crypto";

function generateInviteCode() {
  // 6 chars, uppercase alphanumeric, no ambiguous chars (0/O, 1/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

const houseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: generateInviteCode,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

houseSchema.statics.generateInviteCode = generateInviteCode;

export default mongoose.model("House", houseSchema);
