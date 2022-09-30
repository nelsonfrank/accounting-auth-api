import mongoose from "mongoose";

const connectDB = () => {
  return mongoose.connect(process.env.DB_CONNECTION_STRING || "").then(() => {
    console.log("Connected to the database ");
  });
};

export default connectDB;
