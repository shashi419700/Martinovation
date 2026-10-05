import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    latitude: Number,
    longitude: Number,
    status: {
      type: String,
      default: "active",
    },
    ambulanceAssigned: {
      type: Boolean,
      default: false,
    },
    hospitalAssigned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Emergency", emergencySchema);