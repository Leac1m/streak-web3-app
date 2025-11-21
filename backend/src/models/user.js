import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    publicKey: { // storing it saves requesting from RPC
      type: String,
      required: false,
    },

    heroPoints: {
      type: Number,
      default: 0,
    },

    streak: {
      currentStreak: { type: Number, default: 0 },
      lastCheckInAt: { type: Date, default: null },
      nextEligibleAt: { type: Date, default: null },
    },

    meta: {
      createdAt: { type: Date, default: Date.now },
      lastLoginAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export default mongoose.model("User", UserSchema);
