import mongoose from 'mongoose';
import User from './models/User';
import Student from './models/Student';
import Teacher from './models/Teacher';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ag-attend";

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});

    // Create Super Admin
    const adminUser = new User({
      name: "Admin User",
      email: "admin@school.com",
      password: "admin", // Will be hashed by pre-save
      role: "super_admin",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    });
    await adminUser.save();

    // Create Teacher
    const teacherUser = new User({
      name: "Prof. Michael Chen",
      email: "teacher@school.com",
      password: "admin",
      role: "teacher",
      department: "Computer Science",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    });
    await teacherUser.save();

    const teacher = new Teacher({
      userId: teacherUser._id,
      name: teacherUser.name,
      department: "Computer Science",
      subjects: ["Computer Science", "Mathematics"],
      classes: ["Grade 10 - Section A"]
    });
    await teacher.save();
    teacherUser.teacherId = teacher._id as any;
    await teacherUser.save();

    // Create Student
    const studentUser = new User({
      name: "Alex Patterson",
      email: "student@school.com",
      password: "admin",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
    });
    await studentUser.save();

    const student = new Student({
      userId: studentUser._id,
      name: studentUser.name,
      rollNo: "CS2026-001",
      grade: "Grade 10",
      section: "Section A",
      subjects: ["Mathematics", "Physics", "Computer Science", "English", "Chemistry"]
    });
    await student.save();
    studentUser.studentId = student._id as any;
    await studentUser.save();

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
