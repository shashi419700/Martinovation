import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "mlm_software_db",
    });
    console.log("✅ Connected to database!");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};
