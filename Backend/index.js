import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import routes from "./routes/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
// db connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected successfully."))
  .catch((err) => console.log("Failed to connect to DB:", err));

app.use(morgan("dev"));

app.use("/api-v1",routes)
// Routes
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Welcome to TaskHub API" });
});

// 404 Not Found Middleware (after routes)
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error Middleware (after 404)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
