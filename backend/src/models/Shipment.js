import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
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

    corridor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corridor",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "delivered", "delayed", "cancelled"],
      default: "active",
    },

    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "low",
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    actualDelivery: {
      type: Date,
      default: null,
    },

    delayMinutes: {
      type: Number,
      default: 0,
      min: 0,
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

const Shipment = mongoose.model("Shipment", shipmentSchema);

export default Shipment;
