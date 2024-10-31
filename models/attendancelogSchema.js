const mongoose=require("mongoose");

const attendanceLogSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    date: { type: Date, default: Date.now },
    studentsPresent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Array of student IDs who were marked present
    image: { type: String } // URL or path to the uploaded image
  });
  
  module.exports = mongoose.model("AttendanceLog", attendanceLogSchema);
  