const mongoose=require("mongoose");

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    usn: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    semester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8], required: true }, // Semesters 1 to 8
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    attendance: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        attendanceDates: [Date], // Array of dates student was marked present
      },
    ],
    images: [{ type: String }], // Array to store URLs of images (base64 strings or paths)
  });
  
  module.exports = mongoose.model("Student", studentSchema);
  