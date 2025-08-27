// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- Middleware --------------------
app.use(helmet()); // security headers
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use(mongoSanitize());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/feedback", limiter);

// -------------------- MongoDB Connection --------------------
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// -------------------- Schema & Model --------------------
const feedbackSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  regNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    match: /^[A-Za-z]{3}[0-9]{7}$/,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /.+\@.+\..+/,
  },
  mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
  batchId: { type: String, trim: true },
  faculty: { type: String, required: true, trim: true },

  // Scores (validated 0-100)
  attendance: { type: Number, min: 0, max: 100 },
  dressCode: { type: Number, min: 0, max: 100 },
  discipline: { type: Number, min: 0, max: 100 },
  participation: { type: Number, min: 0, max: 100 },
  teamwork: { type: Number, min: 0, max: 100 },
  presentationContent: { type: Number, min: 0, max: 100 },
  presentationDelivery: { type: Number, min: 0, max: 100 },
  communication: { type: Number, min: 0, max: 100 },
  analytical: { type: Number, min: 0, max: 100 },
  creativity: { type: Number, min: 0, max: 100 },
  ethics: { type: Number, min: 0, max: 100 },
  emotional: { type: Number, min: 0, max: 100 },
  overallEngagement: { type: Number, min: 0, max: 100 },

  quizMarks: { type: Number, min: 0, max: 100 },
  weightedScore: { type: Number, min: 0, max: 100 },
  grade: { type: String, enum: ["A+", "A", "B+", "B", "C", "-"], default: "-" },

  createdAt: { type: Date, default: Date.now },
});

// Auto-calculate weightedScore and grade before save
feedbackSchema.pre("save", function (next) {
  const doc = this;

  // Compute average of all rating fields
  const ratingFields = [
    "attendance",
    "dressCode",
    "discipline",
    "participation",
    "teamwork",
    "presentationContent",
    "presentationDelivery",
    "communication",
    "analytical",
    "creativity",
    "ethics",
    "emotional",
    "overallEngagement",
  ];

  let sum = 0,
    count = 0;
  ratingFields.forEach((field) => {
    if (typeof doc[field] === "number") {
      sum += doc[field];
      count++;
    }
  });

  const avgRatings = count > 0 ? sum / count : 0;
  const quiz = typeof doc.quizMarks === "number" ? doc.quizMarks : 0;

  doc.weightedScore = ((avgRatings + quiz) / 2).toFixed(2);

  // Grade logic
  if (doc.weightedScore >= 85) doc.grade = "A+";
  else if (doc.weightedScore >= 70) doc.grade = "A";
  else if (doc.weightedScore >= 55) doc.grade = "B+";
  else if (doc.weightedScore >= 40) doc.grade = "B";
  else doc.grade = "C";

  next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// -------------------- Routes --------------------

// POST /feedback - add feedback
app.post("/feedback", async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    const saved = await newFeedback.save();
    res.status(201).json({ message: "✅ Feedback saved", data: saved });
  } catch (err) {
    console.error("Error saving feedback:", err.message);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// GET /feedback - fetch all or by filters
app.get("/feedback", async (req, res) => {
  try {
    const { faculty, regNumber } = req.query;
    const filter = {};
    if (faculty) filter.faculty = faculty;
    if (regNumber) filter.regNumber = regNumber.toUpperCase();

    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// -------------------- Serve Frontend --------------------
const publicDir = process.env.PUBLIC_DIR || path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("*", (_, res) => res.sendFile(path.join(publicDir, "index.html")));

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
