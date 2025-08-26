const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Feedback = require("./models/Feedback");  // import the schema

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Serve static files (your HTML + JS)
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Connect to MongoDB
mongoose.connect(
  "mongodb+srv://StudentUser:Student%401234@student.khydwyf.mongodb.net/studentFeedbackDB?retryWrites=true&w=majority&appName=Student"
)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// 🔹 Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 Submit Feedback
app.post("/feedback", async (req, res) => {
  try {
    const {
      studentName,
      regNumber,
      email,
      mobile,
      faculty,
      batchId,
      attendance,
      dressCode,
      discipline,
      participation,
      teamwork,
      presentationContent,
      presentationDelivery,
      communication,
      analytical,
      creativity,
      ethics,
      emotional,
      overallEngagement,
      quizMarks,
      weightedScore,
      grade
    } = req.body;

    const newFeedback = new Feedback({
      studentName,
      regNumber,
      email,
      mobile,
      facultyName: faculty,
      batchId,
      attendance,
      dressCode,
      discipline,
      participation,
      teamwork,
      presentationContent,
      presentationDelivery,
      communication,
      analytical,
      creativity,
      ethics,
      emotional,
      overallEngagement,
      quizMarks,
      weightedScore,
      grade
    });

    await newFeedback.save();
    res.status(201).json({ message: "✅ Feedback saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ Error saving feedback", error });
  }
});

// 🔹 Get All Feedback (for admin/testing)
app.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching feedback", error });
  }
});

// 🔹 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
