require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Feedback = require("./models/Feedback");

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS setup (safe for Render + GitHub frontend)
app.use(cors({
  origin: ["https://bosdat5-cmd.github.io"],  // ✅ your GitHub Pages frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ Debug: check if env is loading
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

// ✅ MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("🚀 Student Feedback Backend is running...");
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
    console.log("📩 New feedback saved:", newFeedback);
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

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

