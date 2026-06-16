import mongoose from "mongoose";
import { seedSystemAdmin } from "./seedSystemAdmin.js";

export const connectdb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Mongo DB connection: ${connect.connection.host}`);

    await seedSystemAdmin();
    console.log("System admin seeded successfully");
  } catch (err) {
    console.log("mongo connection error:", err);
  }
};
