import axios from "axios";
import User from "../models/User.js";

export const sendSOS = async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.body;

    console.log("SOS BODY:", req.body);

    if (!latitude || !longitude || !userId) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.emergencyContacts.length) {
      return res.status(400).json({
        message: "No emergency contacts",
      });
    }

    // n8n webhook call
    await axios.post(
      "https://shashi41970.app.n8n.cloud/webhook-test/sos",
      {
        name: user.name,
        phone: user.phone,
        latitude,
        longitude,
        contacts: user.emergencyContacts,
      }
    );

    res.json({
      success: true,
      message: "SOS sent successfully",
    });
  } catch (error) {
    console.log("SOS ERROR:", error.message);

    res.status(500).json({
      message: "SOS failed",
    });
  }
};