require('dotenv').config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Feedback = require("./models/Feedback");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🔹 Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 Submit Feedback
app.post("/feedback", async (req, res) => {
  try {
    const data = req.body;
    const newFeedback = new Feedback({
      studentName: data.studentName,
      regNumber: data.regNumber,
      email: data.email,
      mobile: data.mobile,
      facultyName: data.faculty,
      batchId: data.batchId,
      attendance: data.attendance,
      dressCode: data.dressCode,
      discipline: data.discipline,
      participation: data.participation,
      teamwork: data.teamwork,
      presentationContent: data.presentationContent,
      presentationDelivery: data.presentationDelivery,
      communication: data.communication,
      analytical: data.analytical,
      creativity: data.creativity,
      ethics: data.ethics,
      emotional: data.emotional,
      overallEngagement: data.overallEngagement,
      quizMarks: data.quizMarks,
      weightedScore: data.weightedScore,
      grade: data.grade
    });

    await newFeedback.save();
    res.status(201).json({ message: "✅ Feedback saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving feedback:", error);
    res.status(500).json({ message: "❌ Error saving feedback", error });
  }
});

// 🔹 Get all feedback
app.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error("❌ Error fetching feedback:", error);
    res.status(500).json({ message: "❌ Error fetching feedback", error });
  }
});

// 🔹 Catch-all route for SPA support
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
