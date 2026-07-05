import mongoose from "mongoose";

const uri = "mongodb+srv://dbaditya:YOUR_PASSWORD@cluster0.lxcpa6l.mongodb.net/ag-attend?retryWrites=true&w=majority&appName=Cluster0";

try {
  await mongoose.connect(uri);
  console.log("✅ Connected successfully");
} catch (err) {
  console.error(err);
} finally {
  await mongoose.disconnect();
}