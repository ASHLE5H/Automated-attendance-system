const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const attendancelog = require('../models/attendancelogSchema.js');
const department = require('../models/departmentSchema.js');
const student = require('../models/studentSchema.js');
const subject = require('../models/subjectSchema.js');
const teacher = require('../models/teacherSchema.js');

// admin registration
const adminRegister = async (req, res) => {
    try {
        const admin = new Admin({
            ...req.body
        });

        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingcollege = await Admin.findOne({ college: req.body.college });

        if (existingAdminByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else if (existingcollege) {
            res.send({ message: 'college name already exists' });
        }
        else {
            let result = await admin.save();
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};


// log in
const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            if (req.body.password === admin.password) {
                admin.password = undefined;
                res.send(admin);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

// profile
const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        }
        else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// delete
const deleteAdmin = async (req, res) => {
    try {
        const result = await Admin.findByIdAndDelete(req.params.id)

        await attendancelog.deleteMany({ college: req.params.id });
        await student.deleteMany({ college: req.params.id });
        await subject.deleteMany({ college: req.params.id });
        await teacher.deleteMany({ college: req.params.id });
        await department.deleteMany({ college: req.params.id });

        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

// update
const updateAdmin = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(res.body.password, salt)
        }
        let result = await Admin.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

module.exports = { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin };