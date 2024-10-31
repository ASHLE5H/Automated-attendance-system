const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            usn: req.body.usn,
            college: req.body.adminID
        });

        if (existingStudent) {
            res.send({ message: 'usn already exists' });
        }
        else {
            const student = new Student({
                ...req.body,
                college: req.body.adminID,
                password: hashedPass
            });

            let result = await student.save();

            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};


const studentLogIn = async (req, res) => {
    try {
        // Find student by unique USN and email
        let student = await Student.findOne({ usn: req.body.usn, email: req.body.email });
        
        if (student) {
            // Compare the provided password with the stored hashed password
            const validated = await bcrypt.compare(req.body.password, student.password);
            
            if (validated) {
                // Populate related fields: college, department, and subjects
                student = await student.populate("college", "collegeName");
                student = await student.populate("department", "departmentName");
                student = await student.populate("subjects", "subjectName");

                // Remove sensitive information before sending the response
                student.password = undefined;
                student.images = undefined;
                
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};


const getStudents = async (req, res) => {
    try {
        // Find students by college ID from the request parameters
        let students = await Student.find({ college: req.params.id })
            .populate("department", "name") // Replace "name" with the exact field to show from Department
            .populate("subjects", "name code"); // Replace "subjectName" with the exact field to show from Subject

        if (students.length > 0) {
            // Remove password and any sensitive info before sending the response
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};


const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("college", "college") // Populates college with the `college` field from the `admin` schema
            .populate("department", "name") // Populates department with the department's `name`
            .populate("subjects", "name code") // Populates each subject with its `name` and `code`
            .populate("attendance.subject", "name code"); // Populates attendance's subject field with `name` and `code`

        if (student) {
            student.password = undefined; // Remove the password for security
            res.send(student);
        } else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ college: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudentsByDepartment = async (req, res) => {
    try {
        // Deletes all students belonging to a specific department
        const result = await Student.deleteMany({ department: req.params.id });

        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" });
        } else {
            res.send(result); // Returns the result of the delete operation
        }
    } catch (error) {
        res.status(500).json(error); // Sends an error response if something goes wrong
    }
};

const updateStudent = async (req, res) => {
    try {
        // Check if the password is being updated
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
            req.body.password = await bcrypt.hash(req.body.password, salt); // Hash the new password
        }

        // Update the student document by ID and return the updated document
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true });

        if (result) {
            result.password = undefined; // Remove the password for security
            res.send(result); // Send the updated student details
        } else {
            res.send({ message: "No student found" }); // Handle case where student is not found
        }
    } catch (error) {
        res.status(500).json(error); // Handle any errors that occur
    }
};

// checks the attendance limit of the students if reached or not
const studentAttendance = async (req, res) => {
    const { subject, status, date } = req.body; // Updated to match the schema

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const subjectDetails = await Subject.findById(subject); // Use subject instead of subName

        const existingAttendance = student.attendance.find(
            (a) =>
                a.attendanceDates.toString() === new Date(date).toDateString() && // Adjusted to check attendanceDates
                a.subject.toString() === subject // Updated to match the schema
        );

        if (existingAttendance) {
            existingAttendance.status = status; // Update status if attendance already exists
        } else {
            // Check if the student has already attended the maximum number of sessions
            const attendedSessions = student.attendance.filter(
                (a) => a.subject.toString() === subject // Updated to match the schema
            ).length;

            if (attendedSessions >= subjectDetails.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ subject, attendanceDates: [new Date(date)], status }); // Adjusted for your schema
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subject': subName }, // Adjusted to match your schema
            { $pull: { attendance: { subject: subName } } } // Adjusted to match your schema
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const collegeId = req.params.id; // Adjusted variable name for clarity

    try {
        const result = await Student.updateMany(
            { college: collegeId }, // Using college instead of school
            { $set: { attendance: [] } } // Clearing the attendance array
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id; // The ID of the student
    const subName = req.body.subId; // The ID of the subject whose attendance is to be removed

    try {
        const result = await Student.updateOne(
            { _id: studentId }, // Find the student by their ID
            { $pull: { attendance: { subject: subName } } } // Pull/remove the attendance record for the specified subject
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error); // Handle any errors that occur during the operation
    }
};

const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id; // The ID of the student

    try {
        const result = await Student.updateOne(
            { _id: studentId }, // Find the student by their ID
            { $set: { attendance: [] } } // Set the attendance array to an empty array, effectively clearing it
        );

        return res.send(result); // Return the result of the operation
    } catch (error) {
        res.status(500).json(error); // Handle any errors that occur during the operation
    }
};


module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudent,
    deleteStudents,
    deleteStudentsByDepartment,
    updateStudent,
    studentAttendance,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance
};


