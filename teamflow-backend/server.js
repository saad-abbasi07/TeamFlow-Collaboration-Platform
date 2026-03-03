const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      const raw = process.env.FRONTEND_URL || "http://localhost:3000";
      const allowed = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ===== HEALTH ROUTE (VERY IMPORTANT) ===== */
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth' , authRoutes)

// middleware
const protect = require("./src/middleware/authMiddleware");

app.get("/api/protected", protect, (req, res) => {
  res.status(200).json({ success: true, message: `Welcome ${req.user.name}` });
});

// project routes

const projectRoutes = require("./src/routes/projectRoutes");
app.use("/api/projects", projectRoutes);

// Connect Workspace
const workspaceRoutes = require("./src/routes/workspaceRoutes");
app.use("/api/workspaces", workspaceRoutes);

// Connect Task
const taskRoutes = require("./src/routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});