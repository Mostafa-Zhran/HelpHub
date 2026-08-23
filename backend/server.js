const express = require("express");
const cors = require("cors");
require("dotenv").config();

const adminRoutes     = require("./routes/admin");
const publicRoutes    = require("./routes/public");
const volunteerRoutes = require("./routes/volunteer");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin",     adminRoutes);
app.use("/api/public",    publicRoutes);
app.use("/api/volunteer", volunteerRoutes);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "HelpHub Node.js + Supabase Backend is running!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});