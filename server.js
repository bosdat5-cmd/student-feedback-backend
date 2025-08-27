// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- MongoDB Atlas Connection --------------------
mongoose
  .connect(
    "mongodb+srv://StudentUser:Student%401234@student.khydwyf.mongodb.net/studentFeedbackDB?retryWrites=true&w=majority&appName=Student",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// -------------------- Mongoose Schema & Model --------------------
const feedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  regNumber: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  batchId: String,
  faculty: { type: String, required: true },
  attendance: Number,
  dressCode: Number,
  discipline: Number,
  participation: Number,
  teamwork: Number,
  presentationContent: Number,
  presentationDelivery: Number,
  communication: Number,
  analytical: Number,
  creativity: Number,
  ethics: Number,
  emotional: Number,
  overallEngagement: Number,
  quizMarks: Number,
  weightedScore: Number,
  grade: String,
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// -------------------- API Routes --------------------
// Add new feedback
app.post("/feedback", async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    const saved = await newFeedback.save();
    res.status(201).json({ message: "Feedback saved", data: saved });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all feedbacks
app.get("/feedback", async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(allFeedback);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// -------------------- Serve Frontend --------------------
app.use(express.static(path.join(__dirname, "public"))); // serve static files
app.get("*", (req, res) => {                           // catch-all route
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`🚀 Student Feedback Backend is running on port ${PORT}`);
});
