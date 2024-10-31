const mongoose=require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true }
  });
  
  module.exports = mongoose.model("Department", departmentSchema);
  