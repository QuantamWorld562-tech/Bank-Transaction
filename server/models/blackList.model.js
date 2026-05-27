import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete blacklisted tokens after 3 days (same as JWT expiry)
blackListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 3 });

export default mongoose.model("BlackList", blackListSchema);
