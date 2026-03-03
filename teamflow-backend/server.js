const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(express.json());

// CORS fix for deployment
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ===== HEALTH ROUTE ===== */
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// Routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const protect = require("./src/middleware/authMiddleware");
app.get("/api/protected", protect, (req, res) => {
  res.status(200).json({ success: true, message: `Welcome ${req.user.name}` });
});

const projectRoutes = require("./src/routes/projectRoutes");
app.use("/api/projects", projectRoutes);

const workspaceRoutes = require("./src/routes/workspaceRoutes");
app.use("/api/workspaces", workspaceRoutes);

const taskRoutes = require("./src/routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});