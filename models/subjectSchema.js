const mongoose=require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    semester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8], required: true }, // Semesters 1 to 8
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    attendanceLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "AttendanceLog" }], // Reference to attendance logs
  });
  
  module.exports = mongoose.model("Subject", subjectSchema);
  