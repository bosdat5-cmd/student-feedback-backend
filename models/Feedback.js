const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  regNumber: String,
  email: String,
  mobile: String,
  faculty: String,
  batchId: String,
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
  grade: String
}, { timestamps: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);
