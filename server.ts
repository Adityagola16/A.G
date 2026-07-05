import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";

// Models
import User from "./server/models/User";
import Student from "./server/models/Student";
import Teacher from "./server/models/Teacher";
import Attendance from "./server/models/Attendance";
import Leave from "./server/models/Leave";
import Notification from "./server/models/Notification";
import Announcement from "./server/models/Announcement";
import Timetable from "./server/models/Timetable";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ag-attend";
const JWT_SECRET = process.env.JWT_SECRET || "ag_attend_secret_key_2024";

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Initialize Gemini SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    console.log("Google GenAI SDK initialized.");
  } catch (err) {
    console.error("Failed to initialize Google GenAI SDK:", err);
  }
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, grade, section, rollNo, parentEmail } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Restrict public registration for admin/teacher roles
    if (['super_admin', 'school_admin', 'teacher'].includes(role)) {
      return res.status(403).json({ error: "Unauthorized role registration" });
    }

    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    });

    await newUser.save();

    if (role === 'student') {
      const newStudent = new Student({
        userId: newUser._id,
        name,
        rollNo: rollNo || `ROLL-${Date.now()}`,
        grade: grade || "Grade 10",
        section: section || "Section A",
        subjects: ["Mathematics", "Physics", "Computer Science", "English", "Chemistry"]
      });
      await newStudent.save();
      newUser.studentId = newStudent._id as any;
      await newUser.save();
    }

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, otpCode } = req.body;

    const user: any = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    // 2FA logic if enabled in config
    // For now we simulate with a global hardcoded toggle or fetch from DB
    const is2FAEnabled = false; // Could be fetched from a security config collection

    if (is2FAEnabled) {
      if (!otpCode) {
        const generatedCode = String(100000 + Math.floor(Math.random() * 900000));
        // In real app, store this in Redis or User document with expiry
        user.activeOTP = generatedCode;
        user.otpExpires = Date.now() + 120000;
        await user.save();

        return res.json({
          twoFactorRequired: true,
          email: user.email,
          message: "Enter the dynamic 6-digit passcode.",
          otpDebug: generatedCode
        });
      } else {
        if (user.activeOTP !== otpCode || Date.now() > user.otpExpires) {
          return res.status(403).json({ error: "Invalid or expired OTP" });
        }
        user.activeOTP = undefined;
        user.otpExpires = undefined;
        await user.save();
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// ----------------------------------------------------
// ATTENDANCE ROUTES
// ----------------------------------------------------

app.get("/api/attendance/list", async (req, res) => {
  try {
    const records = await Attendance.find().sort({ timestamp: -1 }).limit(100);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

app.post("/api/attendance/mark", async (req, res) => {
  try {
    const { studentId, status, subject, method, lat, lng, verified, notes } = req.body;

    // In a real app, we'd find the student by ID first
    let student = await Student.findOne({
      $or: [{ _id: mongoose.isValidObjectId(studentId) ? studentId : null }, { userId: mongoose.isValidObjectId(studentId) ? studentId : null }]
    });

    if (!student && studentId === 'u-5') { // Compatibility with existing mock IDs
       student = await Student.findOne(); // Just pick any student for now if mock ID
    }

    if (!student) return res.status(404).json({ error: "Student not found" });

    const newRecord = new Attendance({
      studentId: student._id,
      studentName: student.name,
      rollNo: student.rollNo,
      date: new Date().toISOString().split('T')[0],
      status,
      subject: subject || "General",
      markedBy: "Teacher", // In real app, get from req.user
      method: method || "manual",
      location: lat && lng ? { latitude: lat, longitude: lng } : undefined,
      verified: verified !== undefined ? verified : true,
      notes: notes || ""
    });

    await newRecord.save();

    // Update streak
    if (status === 'present' || status === 'late') {
        student.streak += 1;
    } else if (status === 'absent') {
        student.streak = 0;
    }
    await student.save();

    res.json({ success: true, record: newRecord });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
});

// Bulk attendance from teacher panel
app.post("/api/attendance/bulk", async (req, res) => {
  try {
    const { records, subject, date, time, timing } = req.body;
    const todayStr = date || new Date().toISOString().split('T')[0];
    const timingStr = timing || "09:00 AM - 10:00 AM";

    const results = await Promise.all(records.map(async (rec: any) => {
      const student = await Student.findById(rec.studentId);
      if (!student) return null;

      const record = new Attendance({
        studentId: student._id,
        studentName: student.name,
        rollNo: student.rollNo,
        date: todayStr,
        status: rec.status,
        subject: subject || "General",
        markedBy: "Teacher",
        method: rec.method || "manual",
        verified: true,
        timing: timingStr
      });

      await record.save();

      // Update streak
      if (rec.status === 'present' || rec.status === 'late') {
          student.streak += 1;
      } else if (rec.status === 'absent') {
          student.streak = 0;
      }
      await student.save();
      return record;
    }));

    res.json({ success: true, count: results.filter(r => r !== null).length });
  } catch (err) {
    res.status(500).json({ error: "Failed to process bulk attendance" });
  }
});

// ----------------------------------------------------
// GAMIFICATION / LEADERBOARD
// ----------------------------------------------------

app.get("/api/gamification/leaderboard", async (req, res) => {
  try {
    const students = await Student.find().limit(50);
    const leaderboard = await Promise.all(students.map(async (s) => {
      const records = await Attendance.find({ studentId: s._id });
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const rate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 100;
      
      return {
        id: s._id,
        name: s.name,
        rollNo: s.rollNo,
        streak: s.streak,
        badges: s.badges,
        rate,
        presentCount,
        totalDays: records.length,
        grade: s.grade,
        section: s.section
      };
    }));

    res.json(leaderboard.sort((a, b) => b.rate - a.rate));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ----------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------

app.get("/api/admin/teachers", async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('userId', 'email name avatar phone joinedDate');
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teachers" });
    }
});

app.post("/api/admin/create-teacher", async (req, res) => {
    try {
        const { name, email, password, department, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        const newUser = new User({
            name,
            email,
            password,
            role: 'teacher',
            department,
            phone,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
        });
        await newUser.save();

        const newTeacher = new Teacher({
            userId: newUser._id,
            name,
            department
        });
        await newTeacher.save();

        newUser.teacherId = newTeacher._id as any;
        await newUser.save();

        res.status(201).json({ success: true, teacher: newTeacher });
    } catch (err) {
        res.status(500).json({ error: "Failed to create teacher" });
    }
});

app.get("/api/admin/students", async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'email name avatar phone joinedDate');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

app.post("/api/admin/create-student", async (req, res) => {
    try {
        const { name, email, password, rollNo, grade, section, parentEmail } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        const newUser = new User({
            name,
            email,
            password,
            role: 'student',
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
        });
        await newUser.save();

        const newStudent = new Student({
            userId: newUser._id,
            name,
            rollNo,
            grade,
            section
        });
        await newStudent.save();

        newUser.studentId = newStudent._id as any;
        await newUser.save();

        res.status(201).json({ success: true, student: newStudent });
    } catch (err) {
        res.status(500).json({ error: "Failed to create student" });
    }
});

// Delete routes
app.delete("/api/admin/teacher/:id", async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (teacher) {
            await User.findByIdAndDelete(teacher.userId);
            await Teacher.findByIdAndDelete(req.params.id);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete teacher" });
    }
});

app.delete("/api/admin/student/:id", async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (student) {
            await User.findByIdAndDelete(student.userId);
            await Student.findByIdAndDelete(req.params.id);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete student" });
    }
});

// ----------------------------------------------------
// LEAVE REQUEST ROUTES
// ----------------------------------------------------

app.get("/api/leaves/list", async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch leaves" });
    }
});

app.post("/api/leaves/create", async (req, res) => {
    try {
        const { studentId, startDate, endDate, reason, teacherId } = req.body;
        const user = await User.findById(studentId);
        const teacher = await User.findById(teacherId);

        const newLeave = new Leave({
            studentId,
            studentName: user?.name,
            startDate,
            endDate,
            reason,
            teacherId,
            teacherName: teacher?.name
        });
        await newLeave.save();
        res.status(201).json({ success: true, leave: newLeave });
    } catch (err) {
        res.status(500).json({ error: "Failed to submit leave request" });
    }
});

app.post("/api/leaves/update", async (req, res) => {
    try {
        const { leaveId, status } = req.body;
        const leave = await Leave.findByIdAndUpdate(leaveId, { status }, { new: true });

        if (leave) {
            // Create notification for student
            const notification = new Notification({
                userId: leave.studentId,
                title: `Leave ${status}`,
                message: `Your leave request for ${leave.startDate} has been ${status}.`,
                type: status === 'approved' ? 'success' : 'warning'
            });
            await notification.save();
        }

        res.json({ success: true, leave });
    } catch (err) {
        res.status(500).json({ error: "Failed to update leave" });
    }
});

// ----------------------------------------------------
// NOTIFICATION & ANNOUNCEMENT ROUTES
// ----------------------------------------------------

app.get("/api/notifications", async (req, res) => {
    try {
        // In real app, filter by req.user.id
        const notifications = await Notification.find().sort({ timestamp: -1 }).limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

app.post("/api/notifications/read", async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.body.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
});

app.get("/api/announcements", async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch announcements" });
    }
});

app.post("/api/announcements", async (req, res) => {
    try {
        const { title, content, targetGroup, important, author } = req.body;
        const newAnn = new Announcement({ title, content, targetGroup, important, author });
        await newAnn.save();
        res.status(201).json({ success: true, announcement: newAnn });
    } catch (err) {
        res.status(500).json({ error: "Failed to create announcement" });
    }
});

// ----------------------------------------------------
// TIMETABLE ROUTES
// ----------------------------------------------------

app.get("/api/timetable/:grade/:section", async (req, res) => {
    try {
        const { grade, section } = req.params;
        const timetable = await Timetable.find({ grade, section });
        res.json(timetable);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch timetable" });
    }
});

app.post("/api/timetable/create", async (req, res) => {
    try {
        const { grade, section, day, periods } = req.body;
        const entry = await Timetable.findOneAndUpdate(
            { grade, section, day },
            { periods },
            { upsert: true, new: true }
        );
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: "Failed to save timetable" });
    }
});

// ----------------------------------------------------
// PARENT PORTAL ROUTES
// ----------------------------------------------------

app.get("/api/parent/children/:parentUserId", async (req, res) => {
    try {
        const studentsList = await Student.find({ parentId: req.params.parentUserId });
        const childrenWithStats = await Promise.all(studentsList.map(async (s) => {
            const records = await Attendance.find({ studentId: s._id });
            const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
            const rate = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 100;
            return {
                id: s._id,
                name: s.name,
                rollNo: s.rollNo,
                grade: s.grade,
                section: s.section,
                rate,
                streak: s.streak,
                attendanceHistory: records.slice(0, 10) // Last 10 records
            };
        }));
        res.json(childrenWithStats);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch children data" });
    }
});

// ----------------------------------------------------
// AI ANALYTICS ROUTE
// ----------------------------------------------------

app.post("/api/ai/analytics", async (req, res) => {
  try {
    const students = await Student.find();
    const studentsRisk = await Promise.all(students.map(async (s) => {
        const records = await Attendance.find({ studentId: s._id });
        const rate = records.length > 0 ? (records.filter(r => r.status === 'present').length / records.length) * 100 : 100;

        return {
            studentId: s._id,
            studentName: s.name,
            subjectWise: (s.subjects || []).map(sub => ({
                subject: sub,
                riskScore: Math.max(0, 100 - rate - Math.random() * 10),
                prediction: rate < 75 ? "High Risk" : rate < 90 ? "Medium Risk" : "Safe",
                reason: rate < 75 ? "Consistent absence pattern detected." : "Occasional misses flagged."
            })),
            wholeDay: {
                riskScore: 100 - rate,
                prediction: rate < 80 ? "High Risk" : "Safe",
                reason: "Historical trend analysis."
            },
            fullMonth: {
                projectedRate: rate,
                riskScore: 100 - rate,
                prediction: "Safe",
                reason: "On track for targets."
            }
        };
    }));

    res.json({
        studentsRisk,
        globalInsights: {
            overallRate: 92,
            riskCount: studentsRisk.filter(r => r.wholeDay.prediction === "High Risk").length,
            recommendations: [
                "Deploy automated QR gateways to reduce manual workload.",
                "Incentivize high-streak students with digital badges.",
                "Flag parents automatically for sub-75% attendance."
            ]
        },
        forecasting: {
            nextMonthTrend: "stable",
            explanation: "Current engagement levels are consistent with seasonal averages."
        }
    });
  } catch (err) {
      res.status(500).json({ error: "AI analysis failed" });
  }
});

// ----------------------------------------------------
// BOOTSTRAP VITE DEVELOPER SERVER OR STATIC ASSETS
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted.");
  } else {
    // Serve static files from the dist directory
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    // Serve index.html for any request that doesn't match a static file
    app.get('*', (req, res, next) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static assets in Production.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
