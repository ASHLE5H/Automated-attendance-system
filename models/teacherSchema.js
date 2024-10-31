const mongoose=require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "teacher" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true }, // Assigned department
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    attendanceLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "AttendanceLog" }], // Reference to attendance logs
  });
  
  module.exports = mongoose.model("Teacher", teacherSchema);
  