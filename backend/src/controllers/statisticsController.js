import Shipment from "../models/Shipment.js";
import Corridor from "../models/Corridor.js";

const getStatistics = async (req, res) => {
  try {
    // -----------------------------
    // SHIPMENT STATISTICS
    // -----------------------------

    const activeShipments = await Shipment.countDocuments({
      status: "active",
    });

    const delayedShipments = await Shipment.countDocuments({
      status: "delayed",
    });

    // -----------------------------
    // CRITICAL CORRIDORS
    // -----------------------------

    const criticalCorridors = await Corridor.countDocuments({
      isActive: true,
      riskLevel: {
        $in: ["high", "critical"],
      },
    });

    // -----------------------------
    // PREDICTED DISRUPTIONS
    // -----------------------------
    // disruptionProbability >= 60

    const predictedDisruptions = await Corridor.countDocuments({
      isActive: true,
      disruptionProbability: {
        $gte: 60,
      },
    });

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,
      data: {
        predictedDisruptions: {
          value: predictedDisruptions,
        },

        activeShipments: {
          value: activeShipments,
        },

        delayedShipments: {
          value: delayedShipments,
        },

        criticalCorridors: {
          value: criticalCorridors,
        },
      },

      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Statistics Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics",
    });
  }
};

export default getStatistics;
