import mongoose from "mongoose";

const corridorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    origin: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "low",
    },

    weatherRisk: {
      type: String,
      enum: ["none", "low", "moderate", "high", "critical"],
      default: "none",
    },

    disruptionProbability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Corridor = mongoose.model("Corridor", corridorSchema);

export default Corridor;
