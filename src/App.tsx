import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  User, 
  Clock, 
  Settings, 
  QrCode, 
  MapPin, 
  Volume2, 
  ShieldAlert, 
  ShieldCheck,
  Cpu, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  Lock, 
  Mail, 
  UserPlus, 
  ChevronRight, 
  Info, 
  Download, 
  RefreshCw, 
  Sliders, 
  X, 
  Send,
  Eye,
  Check,
  ChevronDown,
  UserCheck,
  Camera,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { 
  User as UserType, 
  UserRole, 
  AttendanceRecord, 
  LeaveRequest, 
  Announcement, 
  NotificationItem, 
  AuditLog, 
  AIRiskAnalysis 
} from "./types";
import { fetchApi } from "./utils/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { QRCodeCanvas } from "qrcode.react";

export default function App() {
  // Session / Authentication State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState<UserRole>("student");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // System Core State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  // Admin Module State
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Parent & Timetable State
  const [myChildren, setMyChildren] = useState<any[]>([]);
  const [currentTimetable, setCurrentTimetable] = useState<any[]>([]);

  // Filtering & UI State
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [uiToast, setUiToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Interactive Live Demos / Simulation State
  const [qrCodeVal, setQrCodeVal] = useState("EDU-ATT-ROT-8921");
  const [qrSecondsLeft, setQrSecondsLeft] = useState(5);
  const [qrIsScanning, setQrIsScanning] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceScanSuccess, setFaceScanSuccess] = useState<boolean | null>(null);

  // Leave Form State
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annTarget, setAnnTarget] = useState<'all' | 'teachers' | 'students' | 'parents'>("all");
  const [annImportant, setAnnImportant] = useState(false);

  // AI Analytics State
  const [aiAnalytics, setAiAnalytics] = useState<{
    studentsRisk: AIRiskAnalysis[];
    globalInsights: {
      overallRate: number;
      riskCount: number;
      recommendations: string[];
    };
    forecasting: {
      nextMonthTrend: string;
      explanation: string;
    };
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSubTab, setAiSubTab] = useState<"subject" | "whole_day" | "full_month">("subject");
  const [leaderboardClass, setLeaderboardClass] = useState<string>("Grade 10 - Section A");

  // Theme & Mobile Sidebar States
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGlobalAvatarModal, setShowGlobalAvatarModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState<'teacher' | 'student' | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Bulk Attendance Marking Setup
  const [bulkClass, setBulkClass] = useState("Grade 10 - Section A");
  const [bulkSubject, setBulkSubject] = useState("Computer Science");
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkTime, setBulkTime] = useState(new Date().toTimeString().slice(0, 5));
  const [bulkTiming, setBulkTiming] = useState("09:00 AM - 10:00 AM");
  const [bulkStatuses, setBulkStatuses] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' | 'half_day' | 'leave' }>({});

  // CyberShield Security States
  const [cyberConfig, setCyberConfig] = useState({
    ipsEnabled: true,
    sqlSandboxEnabled: true,
    geoFenceEncryption: true,
    twoFactorEnabled: false,
    rateLimiterThreshold: 150,
  });
  const [activeLocks, setActiveLocks] = useState<string[]>([]);
  const [auditScanResults, setAuditScanResults] = useState<any[]>([]);
  const [auditScanScore, setAuditScanScore] = useState<number | null>(null);

  // Privileged Enrollment Form States
  const [tName, setTName] = useState("");
  const [tEmail, setTEmail] = useState("");
  const [tPassword, setTPassword] = useState("");
  const [tDept, setTDept] = useState("Computer Science");
  const [tPhone, setTPhone] = useState("");
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);

  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPassword, setSPassword] = useState("");
  const [sRollNo, setSRollNo] = useState("");
  const [sGrade, setSGrade] = useState("Grade 10");
  const [sSection, setSSection] = useState("Section A");
  const [sParentEmail, setSParentEmail] = useState("");
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [isScanningSecurity, setIsScanningSecurity] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  // 2FA login challenge modal helper state
  const [login2FARequired, setLogin2FARequired] = useState(false);
  const [login2FAEmail, setLogin2FAEmail] = useState("");
  const [login2FAOtpInput, setLogin2FAOtpInput] = useState("");
  const [login2FAChallengeMsg, setLogin2FAChallengeMsg] = useState("");
  const [login2FADebugOtp, setLogin2FADebugOtp] = useState("");

  // Trigger Toast Notification
  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setUiToast({ message, type });
    setTimeout(() => setUiToast(null), 4000);
  };

  // ----------------------------------------------------
  // LOAD CORE DATA FROM API
  // ----------------------------------------------------
  const loadData = async () => {
    if (!currentUser) return;
    try {
      const results: any = {};

      const basicPromises = {
        attendance: fetchApi("/api/attendance/list"),
        leaves: fetchApi("/api/leaves/list"),
        announcements: fetchApi("/api/announcements"),
        notifications: fetchApi("/api/notifications"),
        leaderboard: fetchApi("/api/gamification/leaderboard"),
        security: fetchApi("/api/security/config").catch(() => null),
        teachers: fetchApi("/api/teachers").catch(() => [])
      };

      const keys = Object.keys(basicPromises);
      const data = await Promise.all(Object.values(basicPromises));
      keys.forEach((key, i) => results[key] = data[i]);

      if (currentUser.role === 'super_admin' || currentUser.role === 'school_admin') {
          results.adminTeachers = await fetchApi("/api/admin/teachers");
          results.adminStudents = await fetchApi("/api/admin/students");
      }

      if (currentUser.role === 'parent') {
          results.parentChildren = await fetchApi(`/api/parent/children/${currentUser.id}`);
      }

      results.timetable = await fetchApi("/api/timetable/Grade 10/Section A");

      setAttendanceRecords(results.attendance || []);
      setLeaveRequests(results.leaves || []);
      setAnnouncements(results.announcements || []);
      setNotifications(results.notifications || []);
      setLeaderboard(results.leaderboard || []);

      if (results.adminTeachers) setAllTeachers(results.adminTeachers);
      if (results.adminStudents) setAllStudents(results.adminStudents);
      if (results.parentChildren) setMyChildren(results.parentChildren);
      if (results.timetable) setCurrentTimetable(results.timetable);

      if (results.teachers) {
        setTeachersList(results.teachers);
        if (results.teachers.length > 0) {
          setSelectedTeacherId(prev => prev || results.teachers[0]._id);
        }
      }

      if (results.security && results.security.config) {
        setCyberConfig(results.security.config);
        setActiveLocks(results.security.activeLocks || []);
      }

      const initialBulk: { [id: string]: 'present' } = {};
      if (Array.isArray(results.leaderboard)) {
        results.leaderboard.forEach((student: any) => {
          initialBulk[student.id] = 'present';
        });
      }
      setBulkStatuses(initialBulk);
    } catch (err) {
      console.error("Error loading API data:", err);
      triggerToast("Failed to sync with server. Check connection.", "error");
    }
  };

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Dynamic QR Code Simulator Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          // Generate a new rotating OTP token
          setQrCodeVal(`EDU-ATT-ROT-${Math.floor(1000 + Math.random() * 9000)}`);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch AI Predictions & Intelligent Forecasting
  const handleFetchAiAnalytics = async () => {
    setLoadingAi(true);
    try {
      const data = await fetchApi("/api/ai/analytics", {
        method: "POST"
      });
      setAiAnalytics(data);
      triggerToast("AI Analytics & Risk Forecasting refreshed!", "success");
    } catch (err) {
      triggerToast("Failed to compile AI insights.", "error");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      handleFetchAiAnalytics();
    }
  }, [currentUser, attendanceRecords]);

  // Filtered Gamification Leaderboard
  const filteredLeaderboard = useMemo(() => {
    if (!leaderboard) return [];
    if (currentUser?.role === 'student') {
      const myProfile = leaderboard.find(l => l.name === currentUser.name);
      if (myProfile) {
        return leaderboard.filter(l => l.grade === myProfile.grade && l.section === myProfile.section);
      }
      return leaderboard.filter(l => l.grade === "Grade 10" && l.section === "Section A");
    } else {
      const [selGrade, selSec] = leaderboardClass.split(" - ");
      return leaderboard.filter(l => l.grade === selGrade && l.section === selSec);
    }
  }, [leaderboard, currentUser, leaderboardClass]);

  // Class Student Directory List
  const classStudentList = useMemo(() => {
    if (!leaderboard) return [];
    if (currentUser?.role === 'student') {
      const myProfile = leaderboard.find(l => l.name === currentUser.name);
      if (myProfile) {
        return leaderboard.filter(l => l.grade === myProfile.grade && l.section === myProfile.section);
      }
      return leaderboard.filter(l => l.grade === "Grade 10" && l.section === "Section A");
    } else if (currentUser?.role === 'parent') {
      const childProfile = leaderboard.find(l => l.parentId === currentUser.id);
      if (childProfile) {
        return leaderboard.filter(l => l.grade === childProfile.grade && l.section === childProfile.section);
      }
      return leaderboard.filter(l => l.grade === "Grade 10" && l.section === "Section A");
    } else {
      const [selGrade, selSec] = leaderboardClass.split(" - ");
      return leaderboard.filter(l => l.grade === selGrade && l.section === selSec);
    }
  }, [leaderboard, currentUser, leaderboardClass]);

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authEmail || !authPassword) {
      setAuthError("Email and password are required.");
      return;
    }

    try {
      const data = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        triggerToast(`Welcome back, ${data.user.name}!`, "success");
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!login2FAOtpInput) {
      setAuthError("Please enter the 6-digit passcode.");
      return;
    }

    try {
      const data = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: login2FAEmail, password: authPassword, otpCode: login2FAOtpInput })
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setLogin2FARequired(false);
        setLogin2FAOtpInput("");
        setCurrentUser(data.user);
        triggerToast(`Welcome back, ${data.user.name}! Secure 2FA completed.`, "success");
      }
    } catch (err: any) {
      setAuthError(err.message || "MFA validation failed.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authName || !authEmail || !authPassword) {
      setAuthError("All credentials are required.");
      return;
    }

    try {
      const data = await fetchApi("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          role: authRole,
          grade: "Grade 10",
          section: "Section A"
        })
      });
      setAuthSuccess("Registration completed successfully! Please sign in.");
      setIsRegisterMode(false);
    } catch (err: any) {
      setAuthError(err.message || "Failed to register.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const type = showAddUserModal;
    const endpoint = `/api/admin/create-${type}`;
    const payload = type === 'teacher'
        ? { name: tName, email: tEmail, password: tPassword, department: tDept, phone: tPhone }
        : { name: sName, email: sEmail, password: sPassword, rollNo: sRollNo, grade: sGrade, section: sSection };

    try {
      await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      triggerToast(`${type?.charAt(0).toUpperCase() + type!.slice(1)} added successfully!`, "success");
      setShowAddUserModal(null);
      loadData();
    } catch (err: any) {
      triggerToast(err.message || `Failed to add ${type}.`, "error");
    }
  };

  // CyberShield Secure Controls State & Handlers
  const [securityScanStep, setSecurityScanStep] = useState("");

  const handleToggleSecurityParam = async (paramName: string, value: any) => {
    try {
      const updatedConfig = { ...cyberConfig, [paramName]: value };
      const data = await fetchApi("/api/security/config/update", {
        method: "POST",
        body: JSON.stringify(updatedConfig)
      });
      setCyberConfig(data.config);
      triggerToast(`CyberShield protocol: ${paramName} updated!`, "success");
      loadData();
    } catch (err) {
      triggerToast("Config synchronization error.", "error");
    }
  };

  const handleReleaseLocks = async () => {
    try {
      const data = await fetchApi("/api/security/unlock-all", { method: "POST" });
      triggerToast(data.message, "success");
      loadData();
    } catch (err) {
      triggerToast("Lockout release failed.", "error");
    }
  };

  const handleRunSecurityScan = async () => {
    setIsScanningSecurity(true);
    setAuditScanResults([]);
    setAuditScanScore(null);

    const steps = [
      "[PROBING] Injecting malformed SQL sequences on database portals...",
      "[SCREENING] Simulating dynamic cross-site scripting (XSS) input buffers...",
      "[SANDBOX] Verifying decryption algorithm integrity on student voice baselines...",
      "[STRESS] Stress-testing API rate limiter under heavy concurrent DDoS flood...",
      "[INTEGRITY] Inspecting rotating symmetric QR key hashes for time drift..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setSecurityScanStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const data = await fetchApi("/api/security/audit-scan", { method: "POST" });
      setAuditScanResults(data.results);
      setAuditScanScore(data.score);
      setLastScanTime(new Date().toLocaleTimeString());
      triggerToast("CyberShield audit completed! Penetration scan results mapped.", "success");
    } catch (err) {
      triggerToast("Penetration audit timed out.", "error");
    } finally {
      setIsScanningSecurity(false);
      setSecurityScanStep("");
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tEmail || !tPassword) {
      triggerToast("Please fill in all required fields for the Teacher account.", "error");
      return;
    }
    setIsCreatingTeacher(true);
    try {
      const data = await fetchApi("/api/admin/create-teacher", {
        method: "POST",
        body: JSON.stringify({
          name: tName,
          email: tEmail,
          password: tPassword,
          department: tDept,
          phone: tPhone
        })
      });
      triggerToast(data.message || "Teacher enrolled successfully!", "success");
      setTName("");
      setTEmail("");
      setTPassword("");
      setTPhone("");
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to enroll teacher.", "error");
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName || !sEmail || !sPassword) {
      triggerToast("Please fill in all required fields for the Student account.", "error");
      return;
    }
    setIsCreatingStudent(true);
    try {
      const data = await fetchApi("/api/admin/create-student", {
        method: "POST",
        body: JSON.stringify({
          name: sName,
          email: sEmail,
          password: sPassword,
          rollNo: sRollNo,
          grade: sGrade,
          section: sSection,
          parentEmail: sParentEmail
        })
      });
      triggerToast(data.message || "Student enrolled successfully!", "success");
      setSName("");
      setSEmail("");
      setSPassword("");
      setSRollNo("");
      setSParentEmail("");
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to enroll student.", "error");
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleRoleSimulation = (role: UserRole) => {
    // Easily mock another user type for preview purposes
    let name = "Sarah Jenkins";
    let email = "admin@school.com";
    let extra = {};

    if (role === "teacher") {
      name = "Prof. Michael Chen";
      email = "teacher@school.com";
      extra = { department: "Computer Science" };
    } else if (role === "student") {
      name = "Alex Patterson";
      email = "student@school.com";
    } else if (role === "parent") {
      name = "Robert Patterson";
      email = "parent@school.com";
    } else if (role === "school_admin") {
      name = "David Miller";
      email = "school@school.com";
    }

    setCurrentUser({
      id: role === "student" ? "u-5" : role === "teacher" ? "u-3" : role === "parent" ? "u-4" : role === "school_admin" ? "u-2" : "u-1",
      name,
      email,
      role,
      joinedDate: "2024-01-15",
      ...extra
    });

    triggerToast(`Switched workspace simulation to ${role.replace("_", " ")}`, "info");
  };

  const handleChangeAvatar = async (newUrl: string) => {
    if (!currentUser) return;
    try {
      const data = await fetchApi("/api/user/update-avatar", {
        method: "POST",
        body: JSON.stringify({ userId: currentUser.id, avatar: newUrl })
      });
      setCurrentUser(prev => prev ? { ...prev, avatar: newUrl } : null);
      triggerToast("Profile photo updated successfully!", "success");
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to update profile photo.", "error");
    }
  };

  // Notification Operations
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetchApi("/api/notifications/read", {
        method: "POST",
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark Individual Attendance
  const handleMarkIndividual = async (status: 'present' | 'absent' | 'late' | 'half_day' | 'leave', method: string, customProps: any = {}) => {
    if (!currentUser) return;
    
    try {
      const data = await fetchApi("/api/attendance/mark", {
        method: "POST",
        body: JSON.stringify({
          studentId: currentUser.id,
          status,
          method,
          subject: "Computer Science",
          ...customProps
        })
      });
      triggerToast(`Attendance logged successfully via ${method.toUpperCase()}!`, "success");
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to sync attendance.", "error");
    }
  };

  // Bulk Attendance Marking
  const handleMarkBulk = async () => {
    const records = Object.keys(bulkStatuses).map(studentId => ({
      studentId,
      status: bulkStatuses[studentId],
      method: "manual"
    }));

    try {
      const data = await fetchApi("/api/attendance/bulk", {
        method: "POST",
        body: JSON.stringify({
          records,
          subject: bulkSubject,
          date: bulkDate,
          time: bulkTime,
          timing: bulkTiming
        })
      });
      triggerToast(`Successfully recorded attendance!`, "success");
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Error saving bulk list.", "error");
    }
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) {
      triggerToast("Please complete all fields", "error");
      return;
    }

    try {
      await fetchApi("/api/leaves/create", {
        method: "POST",
        body: JSON.stringify({
          studentId: currentUser?.id,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason,
          teacherId: selectedTeacherId
        })
      });
      triggerToast("Leave request filed successfully!", "success");
      setLeaveStartDate("");
      setLeaveEndDate("");
      setLeaveReason("");
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to submit leave.", "error");
    }
  };

  // Handle Leave Approval
  const handleLeaveDecision = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await fetchApi("/api/leaves/update", {
        method: "POST",
        body: JSON.stringify({ leaveId, status, role: currentUser?.role })
      });
      triggerToast(`Request ${status} successfully.`, "success");
      loadData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to register decision.", "error");
    }
  };

  // Submit New Announcement
  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) {
      triggerToast("Please enter an announcement headline and body content.", "error");
      return;
    }

    try {
      await fetchApi("/api/announcements", {
        method: "POST",
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          targetGroup: annTarget,
          important: annImportant,
          author: currentUser?.name
        })
      });
      triggerToast("Campus announcement published!", "success");
      setAnnTitle("");
      setAnnContent("");
      setAnnImportant(false);
      loadData();
    } catch (err) {
      triggerToast("Error publishing announcement.", "error");
    }
  };

  // Trigger Mock Report Download (CSV / PDF / Excel)
  const handleDownloadReport = (format: 'pdf' | 'excel', type: string) => {
    const data = attendanceRecords.map(r => ({
      'Student Name': r.studentName,
      'Roll Number': r.rollNo,
      'Date': r.date,
      'Subject': r.subject,
      'Status': r.status,
      'Method': r.method,
      'Verified': r.verified ? 'Yes' : 'No'
    }));

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text("Attendance Report", 14, 15);
      (doc as any).autoTable({
        startY: 20,
        head: [['Student Name', 'Roll No', 'Date', 'Subject', 'Status', 'Method']],
        body: data.map(item => [item['Student Name'], item['Roll Number'], item.Date, item.Subject, item.Status, item.Method]),
      });
      doc.save(`Attendance_Report_${type}.pdf`);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      XLSX.writeFile(workbook, `Attendance_Report_${type}.xlsx`);
    }
    triggerToast(`Report generated in ${format.toUpperCase()} format!`, "success");
  };

  // Geolocation trigger
  const handleGPSFetch = () => {
    setGpsLoading(true);
    setGpsError("");
    setGpsCoordinates(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser framework.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setGpsCoordinates(coords);
        setGpsLoading(false);
        // Call mark individual with coords
        handleMarkIndividual('present', 'gps', { lat: coords.lat, lng: coords.lng });
      },
      (error) => {
        // Fallback to mock successful checkin if inside sandbox
        const mockCoords = { lat: 37.77492, lng: -122.41945 };
        setGpsCoordinates(mockCoords);
        setGpsLoading(false);
        handleMarkIndividual('present', 'gps', { lat: mockCoords.lat, lng: mockCoords.lng });
        triggerToast("Using precise campus-range GPS simulator.", "info");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Voice Recording simulator
  const handleVoiceVerify = (failProxy: boolean) => {
    setVoiceRecording(true);
    triggerToast("Listening to voiceprint cadence...", "info");
    setTimeout(() => {
      setVoiceRecording(false);
      const voiceHash = failProxy ? "mismatch-signature-unmatched" : "valid-biometric-voiceprint-success";
      handleMarkIndividual('present', 'voice', { voiceHash });
    }, 2500);
  };

  // Face Recognition simulator
  const handleFaceVerify = (failProxy: boolean) => {
    setFaceScanning(true);
    setFaceScanSuccess(null);
    triggerToast("Calibrating face mesh alignment...", "info");
    setTimeout(() => {
      setFaceScanning(false);
      if (failProxy) {
        setFaceScanSuccess(false);
        handleMarkIndividual('present', 'face', { faceVerified: false });
      } else {
        setFaceScanSuccess(true);
        handleMarkIndividual('present', 'face', { faceVerified: true });
      }
    }, 2500);
  };

  // Calculate generic dashboard counters
  const totalStudentsCount = leaderboard.length;
  const filteredAttendance = attendanceRecords.filter(r => {
    const matchesSubject = subjectFilter === 'All' || r.subject === subjectFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.method && r.method.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesStatus && matchesSearch;
  });

  const activeStudentProfile = leaderboard.find(l => l.name === currentUser?.name);

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-x-hidden flex select-none">
      {/* Background Mesh */}
      <div className="mesh-bg"></div>

      {/* Global Toast Alert */}
      <AnimatePresence>
        {uiToast && (
          <motion.div 
            id="global-toast-alert"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              uiToast.type === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-emerald-500/5' 
                : uiToast.type === 'error' 
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-rose-500/5' 
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/5'
            }`}
          >
            {uiToast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : uiToast.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400" />
            )}
            <span className="text-sm font-semibold">{uiToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER LOGIN / REGISTER SCREEN IF NOT AUTHENTICATED */}
      {!currentUser ? (
        <div className="flex-1 flex items-center justify-center min-h-screen px-4 py-12 relative z-10">
          <motion.div 
            id="auth-form-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-2xl glass-card ai-glow"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                  A.G Attend
                </h1>
                <p className="text-xs text-slate-400 font-mono tracking-wider">AI by Gola ji</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="text-xs text-indigo-400 font-mono tracking-wider uppercase bg-indigo-500/10 py-1.5 px-3 rounded-full border border-indigo-500/20 inline-block">
                Secure Access Portal
              </div>
            </div>

            {authError && (
              <div id="auth-error-block" className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div id="auth-success-block" className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}


            {login2FARequired ? (
              <form onSubmit={handleVerify2FA} className="space-y-6">
                {/* ... (2FA form contents) */}
              </form>
            ) : isRegisterMode ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    placeholder="name@school.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Security Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="pt-2">
                   <button
                    type="submit"
                    className="w-full glow-btn text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Register Student Account</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="w-full mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Already have an account? Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input 
                      id="input-auth-email"
                      type="email" 
                      placeholder="name@school.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Security Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input 
                      id="input-auth-password"
                      type="password" 
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-auth-submit"
                    type="submit"
                    className="w-full glow-btn text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Login</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="w-full mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    New Student? Create an Account
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      ) : (
        /* CORE APPLICATION LAYOUT */
        <div className="flex-1 flex h-screen overflow-hidden relative z-10">
          
          {/* Mobile Overlay backdrop */}
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            />
          )}

          {/* Main Sidebar */}
          <Sidebar 
            currentRole={currentUser.role}
            onChangeRole={handleRoleSimulation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userEmail={currentUser.email}
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentUser={currentUser}
            onChangeAvatar={handleChangeAvatar}
          />

          {/* Main Workspace Frame */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Navbar 
              notifications={notifications}
              onMarkNotificationRead={handleMarkNotificationRead}
              theme={theme}
              onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              onToggleSidebar={() => setSidebarOpen(prev => !prev)}
              title={
                activeTab === "dashboard" ? "Academic Operations Console" :
                activeTab === "student_list" ? "Classroom Student Directory" :
                activeTab === "attendance" ? "Attendance Gateway" :
                activeTab === "qr_scanner" ? "Anti-Proxy QR Hub" :
                activeTab === "ai_insights" ? "DeepMind AI Analytics & Forecasting" :
                activeTab === "leaves" ? "Medical & Urgent Leave Records" :
                activeTab === "gamification" ? "Engagement & Attendance Milestones" :
                activeTab === "announcements" ? "Campus Board Communications" :
                activeTab === "timetable" ? "Academic Class Schedule" :
                activeTab === "manage_users" ? "User Management Console" :
                "Enterprise Audit logs"
              }
            />

            {/* Content Container (Scrollable) */}
            <main id="main-content-scrollable" className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">

              {/* TAB: TIMETABLE */}
              {activeTab === "timetable" && (
                <div id="tab-timetable" className="space-y-8">
                   <div className="grid grid-cols-1 gap-8">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                        const daySchedule = currentTimetable.find(t => t.day === day);
                        return (
                          <div key={day} className="glass-card p-6 space-y-4">
                             <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{day}</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(daySchedule?.periods || [
                                  { subject: 'Mathematics', startTime: '09:00', endTime: '10:00', room: 'Room 101', teacherName: 'Prof. Michael Chen' },
                                  { subject: 'Physics', startTime: '10:00', endTime: '11:00', room: 'Lab A', teacherName: 'Dr. Helen Hunt' },
                                  { subject: 'Break', startTime: '11:00', endTime: '11:30', room: 'Cafeteria', teacherName: '-' },
                                  { subject: 'Computer Science', startTime: '11:30', endTime: '12:30', room: 'CS Lab', teacherName: 'Prof. Michael Chen' }
                                ]).map((period: any, pIdx: number) => (
                                  <div key={pIdx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 hover:border-indigo-500/50 transition-colors">
                                     <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-indigo-400 font-mono">{period.startTime} - {period.endTime}</span>
                                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-500">{period.room}</span>
                                     </div>
                                     <h4 className="text-sm font-bold text-white">{period.subject}</h4>
                                     <p className="text-[10px] text-slate-500 font-medium">Instructor: {period.teacherName}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}

              {/* TAB: MANAGE USERS (ADMIN ONLY) */}
              {activeTab === "manage_users" && (
                <div id="tab-manage-users" className="space-y-8">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Teachers Section */}
                      <div className="glass-card p-6 space-y-6">
                        <div className="flex justify-between items-center">
                           <h3 className="text-lg font-bold text-white">Manage Teachers</h3>
                           <button onClick={() => setShowAddUserModal('teacher')} className="text-xs bg-indigo-600 px-3 py-1.5 rounded-lg font-bold">Add Teacher</button>
                        </div>
                        <div className="space-y-4">
                           {allTeachers.map(teacher => (
                             <div key={teacher._id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <img src={teacher.userId?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${teacher.name}`} className="w-10 h-10 rounded-full" alt="" />
                                   <div>
                                      <p className="text-sm font-bold text-white">{teacher.name}</p>
                                      <p className="text-xs text-slate-500">{teacher.department}</p>
                                   </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteUser(teacher._id, 'teacher')}
                                  className="text-rose-400 hover:text-rose-300 transition-colors"
                                >
                                   <X className="w-4 h-4" />
                                </button>
                             </div>
                           ))}
                        </div>
                      </div>

                      {/* Students Section */}
                      <div className="glass-card p-6 space-y-6">
                        <div className="flex justify-between items-center">
                           <h3 className="text-lg font-bold text-white">Manage Students</h3>
                           <button onClick={() => setShowAddUserModal('student')} className="text-xs bg-emerald-600 px-3 py-1.5 rounded-lg font-bold">Add Student</button>
                        </div>
                        <div className="space-y-4">
                           {allStudents.map(student => (
                             <div key={student._id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <img src={student.userId?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${student.name}`} className="w-10 h-10 rounded-full" alt="" />
                                   <div>
                                      <p className="text-sm font-bold text-white">{student.name}</p>
                                      <p className="text-xs text-slate-500">{student.rollNo} • {student.grade}</p>
                                   </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteUser(student._id, 'student')}
                                  className="text-rose-400 hover:text-rose-300 transition-colors"
                                >
                                   <X className="w-4 h-4" />
                                </button>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === "dashboard" && (
                <div id="tab-dashboard" className="space-y-8">
                  {/* Hero Banner Header */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/5 border border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1.5 relative z-10">
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border border-indigo-500/30">
                        {currentUser.role === 'parent' ? "Guardian Overview" : "Operational Snapshot"}
                      </span>
                      <h2 className="text-2xl font-black text-white">Welcome back, {currentUser.name}!</h2>
                      <p className="text-xs text-slate-400">
                        {currentUser.role === 'parent'
                          ? "Monitoring your children's academic attendance and safety status."
                          : "Analyzing campus metrics and real-time attendance credentials securely."
                        }
                      </p>
                    </div>
                    
                    {/* Fast Stats Download buttons */}
                    <div className="flex flex-wrap gap-2.5 relative z-10">
                      <button 
                        id="btn-export-pdf"
                        onClick={() => handleDownloadReport('pdf', 'general_summary')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-rose-400" />
                        <span>Export PDF Summary</span>
                      </button>
                      <button 
                        id="btn-export-excel"
                        onClick={() => handleDownloadReport('excel', 'attendance_database')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export Excel Sheet</span>
                      </button>
                    </div>
                  </div>

                  {/* PARENT SPECIFIC: CHILDREN LIST */}
                  {currentUser.role === 'parent' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {myChildren.map(child => (
                         <div key={child.id} className="glass-card p-6 flex items-center justify-between group hover:border-indigo-500/40 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                                  <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${child.name}`} alt="" />
                               </div>
                               <div>
                                  <h4 className="text-lg font-bold text-white">{child.name}</h4>
                                  <p className="text-xs text-slate-500 font-mono">{child.grade} • {child.section}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                     <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Attendance: {child.rate}%</span>
                                     <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase">Streak: {child.streak}d</span>
                                  </div>
                               </div>
                            </div>
                            <button className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-indigo-400 transition-colors">
                               <ArrowUpRight className="w-5 h-5" />
                            </button>
                         </div>
                       ))}
                    </div>
                  )}

                  {/* General Overview Key Indicators Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Enrollments */}
                    <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Total Enrollment</p>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <User className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-white mt-4">{leaderboard.length} Students</h3>
                      <p className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Active cohort</span>
                      </p>
                    </div>

                    {/* Overall Attendance Rate */}
                    <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Avg. Attendance</p>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-white mt-4">
                        {Math.round(leaderboard.reduce((acc, curr) => acc + curr.rate, 0) / (leaderboard.length || 1))}%
                      </h3>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.round(leaderboard.reduce((acc, curr) => acc + curr.rate, 0) / (leaderboard.length || 1))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Students At Risk of Drop out */}
                    <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Students at Risk</p>
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-rose-400 mt-4">
                        {aiAnalytics?.globalInsights?.riskCount || 0}
                      </h3>
                      <p className="text-slate-500 text-xs font-medium mt-2">
                        AI Predicted Dropout Warning
                      </p>
                    </div>

                    {/* Gamified Best Streak */}
                    <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Top streak</p>
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                          <Award className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-amber-400 mt-4">24 Days</h3>
                      <p className="text-slate-500 text-xs font-medium mt-2">
                        Marcus Aurelius (Grade 11)
                      </p>
                    </div>
                  </div>

                  {/* Main Grid: Attendance Trends vs. Live Alerts Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1 & 2: Interactive Custom SVG Attendance trend graph */}
                    <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-base font-bold text-white">Daily Attendance Integrity Graph</h3>
                          <p className="text-xs text-slate-500">Representing verified checkins across the last 5 operational days</p>
                        </div>
                        <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                          <span className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 rounded-lg border border-indigo-500/20">Daily stats</span>
                        </div>
                      </div>

                      {/* Bar graph visualizer */}
                      <div className="h-64 flex items-end justify-between gap-6 px-4 mt-4">
                        {[
                          { day: "MON", rate: 80, val: "148" },
                          { day: "TUE", rate: 92, val: "156" },
                          { day: "WED", rate: 88, val: "152" },
                          { day: "THU", rate: 95, val: "161" },
                          { day: "FRI", rate: 74, val: "128" }
                        ].map((item, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                            <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {item.val}
                            </span>
                            <div className="w-full bg-slate-900/40 rounded-t-xl relative h-full max-h-[180px] hover:bg-slate-800/40 transition-colors overflow-hidden border border-slate-800/50">
                              <div 
                                className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-lg transition-all duration-1000"
                                style={{ height: `${item.rate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-500">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: AI Insights Live Feed */}
                    <div className="glass-card p-6 ai-glow flex flex-col">
                      <div className="flex items-center gap-2.5 mb-5 border-b border-slate-800 pb-4">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></div>
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest font-mono">AI Real-time Insights</h3>
                      </div>

                      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                        <div className="bg-slate-900/55 border border-slate-800 p-3.5 rounded-xl space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-white">Anomalous Absence Detected</span>
                            <span className="bg-rose-500/10 text-rose-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border border-rose-500/20">High Priority</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Tyler Durden has accumulated several consecutive unexplained absences. System recommends calling Robert Patterson immediately.
                          </p>
                        </div>

                        <div className="bg-slate-900/55 border border-slate-800 p-3.5 rounded-xl space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-white">Streak Milestone Reached</span>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border border-emerald-500/20">Milestone</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Marcus Aurelius reached a 24-day perfect streak in advanced computer science. Perfect attendance certificate generated.
                          </p>
                        </div>

                        <div className="bg-slate-900/55 border border-slate-800 p-3.5 rounded-xl space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-white">AI Predicted Absenteeism</span>
                            <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border border-indigo-500/20">Forecast</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            General attendance is forecasted to drop by 12% next Friday due to local independent school federation sports events.
                          </p>
                        </div>
                      </div>

                      <button 
                        id="btn-goto-ai"
                        onClick={() => setActiveTab("ai_insights")}
                        className="w-full mt-4 glow-btn text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                      >
                        Launch Detailed Forecasting
                      </button>
                    </div>
                  </div>

                  {/* ROLE-BASED PRIVILEGED ACCOUNT ENROLLMENT BOXES */}
                  {currentUser.role === 'super_admin' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 border-l-4 border-l-purple-500 relative overflow-hidden space-y-6"
                    >
                      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-purple-400" />
                            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">Super-Admin Panel: Enroll Authorized Teacher</h3>
                          </div>
                          <p className="text-xs text-slate-400">
                            Securely register a new educator profile. Only Super Admins have permission to spawn teacher keys.
                          </p>
                        </div>
                        <span className="bg-purple-500/10 text-purple-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
                          Super-Admin Restricted
                        </span>
                      </div>

                      <form onSubmit={handleCreateTeacher} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Full Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Dr. Ada Lovelace"
                            value={tName}
                            onChange={(e) => setTName(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Secure Email *</label>
                          <input 
                            type="email" 
                            required
                            placeholder="lovelace@school.com"
                            value={tEmail}
                            onChange={(e) => setTEmail(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Access Secret Key *</label>
                          <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={tPassword}
                            onChange={(e) => setTPassword(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Academic Department</label>
                          <select 
                            value={tDept}
                            onChange={(e) => setTDept(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          >
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="English Literature">English Literature</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Direct Phone Contact</label>
                          <input 
                            type="text" 
                            placeholder="+1 (555) 012-3456"
                            value={tPhone}
                            onChange={(e) => setTPhone(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={isCreatingTeacher}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
                          >
                            {isCreatingTeacher ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span>Enroll Teacher Credentials</span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {(currentUser.role === 'teacher' || currentUser.role === 'school_admin' || currentUser.role === 'super_admin') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 border-l-4 border-l-emerald-500 relative overflow-hidden space-y-6"
                    >
                      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">Educator & Admin: Create Student Profile ID</h3>
                          </div>
                          <p className="text-xs text-slate-400">
                            Securely register a student in the academic database. Authorized educators and administrators can spawn student credentials.
                          </p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                          Authorized Access
                        </span>
                      </div>

                      <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Student Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Alan Turing"
                            value={sName}
                            onChange={(e) => setSName(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Email Address *</label>
                          <input 
                            type="email" 
                            required
                            placeholder="turing@school.com"
                            value={sEmail}
                            onChange={(e) => setSEmail(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Access Secret Password *</label>
                          <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={sPassword}
                            onChange={(e) => setSPassword(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Roll Number</label>
                          <input 
                            type="text" 
                            placeholder="e.g. CS2026-009"
                            value={sRollNo}
                            onChange={(e) => setSRollNo(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Academic Grade</label>
                          <select 
                            value={sGrade}
                            onChange={(e) => setSGrade(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          >
                            <option value="Grade 10">Grade 10</option>
                            <option value="Grade 11">Grade 11</option>
                            <option value="Grade 12">Grade 12</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Academic Section</label>
                          <select 
                            value={sSection}
                            onChange={(e) => setSSection(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          >
                            <option value="Section A">Section A</option>
                            <option value="Section B">Section B</option>
                            <option value="Section C">Section C</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-wider">Parent/Guardian Email</label>
                          <input 
                            type="email" 
                            placeholder="parent@school.com"
                            value={sParentEmail}
                            onChange={(e) => setSParentEmail(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>

                        <div className="md:col-span-2 flex items-end">
                          <button
                            type="submit"
                            disabled={isCreatingStudent}
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                          >
                            {isCreatingStudent ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span>Enroll Student Credentials</span>
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Filterable Attendance Records List (Dashboard Bottom) */}
                  <div className="glass-card p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-900">
                      <div>
                        <h3 className="text-base font-bold text-white">Live Attendance Registry</h3>
                        <p className="text-xs text-slate-500">Querying live audit trail logs and verified checkin status details</p>
                      </div>

                      {/* Controls and Filters */}
                      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                          <input 
                            id="registry-search"
                            type="text" 
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-48 bg-slate-900 border border-slate-850 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                          />
                        </div>

                        <select 
                          id="subject-select"
                          value={subjectFilter}
                          onChange={(e) => setSubjectFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="All">All Subjects</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                        </select>

                        <select 
                          id="status-select"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="All">All Status</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="half_day">Half Day</option>
                          <option value="leave">Exempt</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table id="attendance-table" className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-400 font-mono uppercase tracking-wider">
                            <th className="py-3 px-4 font-bold">Student Name</th>
                            <th className="py-3 px-4 font-bold">Roll Number</th>
                            <th className="py-3 px-4 font-bold">Date</th>
                            <th className="py-3 px-4 font-bold">Subject</th>
                            <th className="py-3 px-4 font-bold">Method</th>
                            <th className="py-3 px-4 font-bold">Status</th>
                            <th className="py-3 px-4 font-bold">Integrity Match</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {filteredAttendance.slice(0, 8).map((record) => (
                            <tr key={record.id} className="hover:bg-slate-900/20 transition-colors">
                              <td className="py-3 px-4 font-bold text-white">{record.studentName}</td>
                              <td className="py-3 px-4 font-mono text-slate-400">{record.rollNo}</td>
                              <td className="py-3 px-4 text-slate-400">
                                <div>{record.date}</div>
                                {record.timing && (
                                  <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{record.timing}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-400">{record.subject || "General"}</td>
                              <td className="py-3 px-4">
                                <span className="capitalize font-mono bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-800">
                                  {record.method}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`font-semibold capitalize px-2.5 py-0.5 rounded-full text-[10px] border ${
                                  record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  record.status === 'absent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  record.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                }`}>
                                  {record.status === 'half_day' ? 'Half Day' : record.status === 'leave' ? 'Exempt' : record.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {record.verified ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-bold flex items-center gap-1" title={record.notes}>
                                    <AlertTriangle className="w-3.5 h-3.5" /> Proxy Alert
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredAttendance.length === 0 && (
                        <div className="text-center py-12 text-slate-600 font-medium">
                          No matching record logs found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CLASSROOM STUDENT DIRECTORY */}
              {activeTab === "student_list" && (
                <div id="tab-student_list" className="space-y-6 sm:space-y-8">
                  {/* Top Stats Banner */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight font-sans">Classroom Student Directory</h3>
                      <p className="text-xs text-slate-500">
                        {currentUser?.role === 'student' ? 'View and connect with your classmates in your assigned cohort.' :
                         currentUser?.role === 'parent' ? "View your child's classroom directory, classmates, and cumulative attendance." :
                         "Manage and monitor academic attendance records for students under your class cohort."}
                      </p>
                    </div>

                    {/* Class Selector or Indicator */}
                    {currentUser?.role === 'student' || currentUser?.role === 'parent' ? (
                      <div className="bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold px-4 py-2 rounded-xl border border-indigo-500/20 uppercase tracking-wider">
                        Assigned Class: {(() => {
                          const refName = currentUser?.role === 'student' 
                            ? currentUser?.name 
                            : (leaderboard.find(l => l.parentId === currentUser?.id)?.name || "Alex Patterson");
                          const myProfile = leaderboard.find(l => l.name === refName);
                          return myProfile ? `${myProfile.grade} - ${myProfile.section}` : "Grade 10 - Section A";
                        })()}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase">Select Class Cohort:</span>
                        <select
                          value={leaderboardClass}
                          onChange={(e) => setLeaderboardClass(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                        >
                          <option value="Grade 10 - Section A">Grade 10 - Section A</option>
                          <option value="Grade 10 - Section B">Grade 10 - Section B</option>
                          <option value="Grade 11 - Section A">Grade 11 - Section A</option>
                          <option value="Grade 11 - Section B">Grade 11 - Section B</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Student Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classStudentList.length > 0 ? (
                      classStudentList.map((student) => {
                        const isSelf = currentUser?.id === student.userId || currentUser?.name === student.name;
                        const attendanceColor = student.rate >= 90 ? "text-emerald-400" : student.rate >= 75 ? "text-amber-400" : "text-rose-400";
                        const progressColor = student.rate >= 90 ? "bg-emerald-500" : student.rate >= 75 ? "bg-amber-500" : "bg-rose-500";
                        
                        return (
                          <div 
                            key={student.id} 
                            className={`p-6 rounded-2xl border bg-slate-900/30 backdrop-blur-md transition-all flex flex-col justify-between ${
                              isSelf ? "border-indigo-500/40 shadow-lg shadow-indigo-500/5 bg-slate-900/60" : "border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            <div>
                              {/* Header & Avatar */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="relative group shrink-0">
                                    <img 
                                      src={student.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(student.name)}`}
                                      className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 object-cover" 
                                      alt={student.name}
                                    />
                                    {isSelf && (
                                      <button
                                        onClick={() => setShowGlobalAvatarModal(true)}
                                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        title="Change Photo"
                                      >
                                        <Camera className="w-4 h-4 text-white" />
                                      </button>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-white block truncate max-w-[130px]">{student.name}</span>
                                      {isSelf && (
                                        <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full border border-indigo-500/20 uppercase">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono block">Roll: {student.rollNo}</span>
                                    <span className="text-[10px] text-slate-500 font-mono block">Enrolled Since: Jan 2024</span>
                                  </div>
                                </div>

                                {/* Active Streak */}
                                {student.streak > 0 && (
                                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 text-amber-500" title="Attendance Streak">
                                    <Flame className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-xs font-bold font-mono">{student.streak}</span>
                                  </div>
                                )}
                              </div>

                              {/* Badges */}
                              {student.badges && student.badges.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                  {student.badges.map((badge: string, idx: number) => (
                                    <span 
                                      key={idx}
                                      className="text-[9px] font-mono font-bold bg-slate-950/65 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800 uppercase tracking-wide"
                                    >
                                      🏆 {badge}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Attendance Rate Progress bar */}
                              <div className="mt-6 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400 font-medium font-sans">Overall Attendance Rate</span>
                                  <span className={`font-mono font-bold ${attendanceColor}`}>{student.rate}%</span>
                                </div>
                                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                    style={{ width: `${student.rate}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Total Present Attendance */}
                            <div className="mt-5 pt-4 border-t border-slate-950 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider">Present Attendance</span>
                                <span className="text-slate-200 font-bold font-mono">
                                  {student.presentCount ?? 14} <span className="text-slate-500 font-medium">/ {student.totalDays ?? 15} Days</span>
                                </span>
                              </div>

                              {isSelf ? (
                                <button
                                  onClick={() => setShowGlobalAvatarModal(true)}
                                  className="flex items-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>Update Photo</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Classmate</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-slate-600">
                        No students found in this class.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MARK ATTENDANCE */}
              {activeTab === "attendance" && (
                <div id="tab-attendance" className="space-y-8">
                  {currentUser.role === 'student' ? (
                    (() => {
                      const studentRecords = attendanceRecords.filter(r => r.studentName === currentUser?.name);
                      const studentSubjects = Array.from(new Set(studentRecords.map(r => r.subject).filter(Boolean))) as string[];
                      const subjectStats = studentSubjects.map(subject => {
                        const subjectRecords = studentRecords.filter(r => r.subject === subject);
                        const total = subjectRecords.length;
                        const present = subjectRecords.filter(r => r.status === 'present').length;
                        const late = subjectRecords.filter(r => r.status === 'late').length;
                        const halfDay = subjectRecords.filter(r => r.status === 'half_day').length;
                        const absent = subjectRecords.filter(r => r.status === 'absent').length;
                        const exempt = subjectRecords.filter(r => r.status === 'leave').length;
                        const presentCount = subjectRecords.filter(r => r.status === 'present' || r.status === 'late').length;
                        const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;
                        return { subject, total, present, late, halfDay, absent, exempt, rate };
                      }).sort((a, b) => b.rate - a.rate);

                      return (
                        <div className="max-w-4xl mx-auto space-y-6">
                          {/* Notice Card */}
                          <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                              <UserCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">Official Attendance Registry Only</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Self-service check-in tools have been deactivated. Attendance records can only be registered or modified officially by your classroom instructor. Please verify your stats and perfect streaks below.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Side info box: User Attendance Profile */}
                            <div className="glass-card p-6 h-fit space-y-6">
                              <div>
                                <h3 className="text-base font-bold text-white">Your Attendance Stats</h3>
                                <p className="text-xs text-slate-500">Live metrics indicating risk indicators, targets and perfect streak status.</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">My Streak</span>
                                  <span className="text-2xl font-black text-amber-400">{activeStudentProfile?.streak || 12} Days</span>
                                </div>
                                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">My Rate</span>
                                  <span className="text-2xl font-black text-indigo-400">{activeStudentProfile?.rate || 94}%</span>
                                </div>
                              </div>

                              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 space-y-3">
                                <span className="text-xs font-bold text-slate-300 block">Acquired Digital Badges</span>
                                <div className="flex flex-wrap gap-2">
                                  {activeStudentProfile?.badges?.map((badge: string, idx: number) => (
                                    <span key={idx} className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/25 uppercase font-mono">
                                      🏅 {badge}
                                    </span>
                                  )) || <span className="text-xs text-slate-600 font-medium">None yet. Maintain a perfect streak!</span>}
                                </div>
                              </div>
                            </div>

                            {/* Subject-Wise breakdown */}
                            <div className="md:col-span-2 glass-card p-6 space-y-6">
                              <div>
                                <h3 className="text-base font-bold text-white">Subject-Wise Attendance</h3>
                                <p className="text-xs text-slate-500">Track and monitor your target threshold and present counts per individual subject class.</p>
                              </div>

                              <div className="space-y-4">
                                {subjectStats.map((stat, idx) => {
                                  const isLow = stat.rate < 75;
                                  const isExcellent = stat.rate >= 90;
                                  const barColor = isExcellent ? "bg-emerald-500" : isLow ? "bg-rose-500" : "bg-amber-500";
                                  const textColor = isExcellent ? "text-emerald-400" : isLow ? "text-rose-400" : "text-amber-400";
                                  const badgeBg = isExcellent ? "bg-emerald-500/10 border-emerald-500/20" : isLow ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20";

                                  return (
                                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-3 hover:border-slate-800 transition-all">
                                      <div className="flex justify-between items-start gap-4">
                                        <div>
                                          <h4 className="text-sm font-semibold text-white">{stat.subject}</h4>
                                          <span className="text-[10px] font-mono text-slate-500">
                                            Recorded Classes: {stat.total}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <span className={`text-base font-black ${textColor} block font-mono`}>
                                            {stat.rate}%
                                          </span>
                                          <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${badgeBg} ${textColor}`}>
                                            {isExcellent ? "Excellent" : isLow ? "Needs Attention" : "Good"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Custom progress bar */}
                                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${stat.rate}%` }}></div>
                                      </div>

                                      {/* Attendance counts chips */}
                                      <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 pt-1">
                                        <span className="bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-emerald-300">
                                          Present: {stat.present + stat.late}
                                        </span>
                                        {stat.absent > 0 && (
                                          <span className="bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 text-rose-300">
                                            Absent: {stat.absent}
                                          </span>
                                        )}
                                        {stat.halfDay > 0 && (
                                          <span className="bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 text-amber-300">
                                            Half Day: {stat.halfDay}
                                          </span>
                                        )}
                                        {stat.exempt > 0 && (
                                          <span className="bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 text-indigo-300">
                                            Exempt: {stat.exempt}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {subjectStats.length === 0 && (
                                  <div className="text-center py-12 text-slate-500 text-xs">
                                    No subject records registered yet.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* TEACHER / ADMIN PANEL: BULK ATTENDANCE SHEET */
                    <div className="glass-card p-6 space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-900">
                        <div>
                          <h3 className="text-lg font-bold text-white">Active Classroom Attendance Sheet</h3>
                          <p className="text-xs text-slate-500">Mark, modify, or bulk-approve the entire group's attendance status with precise schedule mapping.</p>
                        </div>

                        <div className="flex flex-wrap items-end gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono">Class Cohort</label>
                            <select 
                              id="bulk-class-select"
                              value={bulkClass}
                              onChange={(e) => setBulkClass(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none"
                            >
                              <option value="Grade 10 - Section A">Grade 10 - Section A</option>
                              <option value="Grade 11 - Section A">Grade 11 - Section A</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono">Subject</label>
                            <select 
                              id="bulk-subject-select"
                              value={bulkSubject}
                              onChange={(e) => setBulkSubject(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none"
                            >
                              <option value="Computer Science">Computer Science</option>
                              <option value="Advanced Calculus">Advanced Calculus</option>
                              <option value="Physics">Physics</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono">Date</label>
                            <input 
                              type="date"
                              value={bulkDate}
                              onChange={(e) => setBulkDate(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono">Time</label>
                            <input 
                              type="time"
                              value={bulkTime}
                              onChange={(e) => setBulkTime(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase font-mono">Timing / Shift</label>
                            <input 
                              type="text"
                              value={bulkTiming}
                              onChange={(e) => setBulkTiming(e.target.value)}
                              placeholder="e.g. 09:00 AM - 10:00 AM"
                              className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table id="bulk-attendance-table" className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-400 font-mono uppercase tracking-wider">
                              <th className="py-3 px-4 font-bold">Student Name</th>
                              <th className="py-3 px-4 font-bold">Roll Number</th>
                              <th className="py-3 px-4 font-bold">Current Streak</th>
                              <th className="py-3 px-4 font-bold">Risk Assessment</th>
                              <th className="py-3 px-4 font-bold text-center">Status Action Selection</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {leaderboard.map((student) => {
                              const activeStatus = bulkStatuses[student.id] || 'present';
                              return (
                                <tr key={student.id} className="hover:bg-slate-900/20 transition-colors">
                                  <td className="py-3 px-4 font-bold text-white">{student.name}</td>
                                  <td className="py-3 px-4 font-mono text-slate-400">{student.rollNo}</td>
                                  <td className="py-3 px-4 font-bold text-amber-400 font-mono">{student.streak} Days</td>
                                  <td className="py-3 px-4">
                                    <span className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded ${
                                      student.rate >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      student.rate >= 75 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {student.rate >= 90 ? 'Safe' : student.rate >= 75 ? 'Medium' : 'CRITICAL RISK'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-center gap-1">
                                      {(['present', 'absent', 'late', 'half_day', 'leave'] as const).map((status) => (
                                        <button
                                          key={status}
                                          id={`bulk-${student.id}-${status}`}
                                          onClick={() => setBulkStatuses(prev => ({ ...prev, [student.id]: status }))}
                                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                            activeStatus === status
                                              ? status === 'present' ? 'bg-emerald-500 text-white' :
                                                status === 'absent' ? 'bg-rose-500 text-white' :
                                                status === 'late' ? 'bg-amber-500 text-slate-950' :
                                                status === 'half_day' ? 'bg-indigo-500 text-white' :
                                                'bg-sky-500 text-white'
                                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                                          }`}
                                        >
                                          {status === 'half_day' ? 'Half' : status === 'leave' ? 'Exempt' : status}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-900">
                        <button 
                          id="btn-save-bulk"
                          onClick={handleMarkBulk}
                          className="glow-btn text-white font-bold py-3 px-8 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save & Publish Classroom Attendance</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DYNAMIC ANTI-PROXY QR */}
              {activeTab === "qr_scanner" && (
                <div id="tab-qr" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Column 1: Generate or View Rotating QR */}
                    <div className="glass-card p-6 flex flex-col justify-between items-center text-center space-y-6">
                      <div className="w-full">
                        <h3 className="text-lg font-bold text-white">Dynamic Anti-Proxy QR Generator</h3>
                        <p className="text-xs text-slate-500">
                          Rotating secure token changes every 5 seconds to eliminate remote photo-sharing proxies.
                        </p>
                      </div>

                      {/* Simulated QR Visualizer */}
                      <div className="w-64 h-64 bg-white p-4 rounded-2xl flex flex-col justify-between items-center border border-slate-200 shadow-xl relative">
                        <div className="flex-1 flex items-center justify-center relative w-full">
                          {/* Inner scanner line simulation */}
                          <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl pointer-events-none opacity-20"></div>
                          <div className="w-48 h-48 bg-white flex flex-col justify-center items-center border-4 border-dashed border-indigo-200 rounded-xl relative overflow-hidden">
                            <QRCodeCanvas value={qrCodeVal} size={160} />
                          </div>
                        </div>
                        <div className="w-full text-center mt-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold tracking-widest uppercase">SECURE ROTATING PORTAL</span>
                        </div>
                      </div>

                      {/* Rotating countdown timer */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></div>
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          Next Token Rotation in {qrSecondsLeft} Seconds
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[11px] text-slate-400 font-mono w-full">
                        Generated Active Token: <span className="text-indigo-300 font-bold">{qrCodeVal}</span>
                      </div>
                    </div>

                    {/* Column 2: Scanner Simulation */}
                    <div className="glass-card p-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-white">Simulated Scanner Gateway</h3>
                        <p className="text-xs text-slate-500">Scan physical screens inside classrooms directly.</p>
                      </div>

                      {qrIsScanning ? (
                        <div className="w-full bg-slate-950 p-12 rounded-2xl border border-slate-850 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                          <div className="w-16 h-16 rounded-full border-4 border-dashed border-indigo-500 animate-spin flex items-center justify-center">
                            <QrCode className="w-8 h-8 text-indigo-400" />
                          </div>
                          <span className="text-xs font-mono text-indigo-300 animate-pulse">CAPTURING PHYSICAL QR TOKEN GATEWAY...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Click below to capture the classroom gateway. The system compares client timestamp and rotating validation hash matching school configurations.
                          </p>

                          <div className="flex gap-3">
                            <button 
                              id="btn-scan-pass"
                              onClick={() => {
                                setQrIsScanning(true);
                                setTimeout(() => {
                                  setQrIsScanning(false);
                                  handleMarkIndividual('present', 'qr');
                                }, 2000);
                              }}
                              className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold py-3 px-4 rounded-xl text-xs border border-indigo-500/20 cursor-pointer transition-colors"
                            >
                              Scan Valid Current QR
                            </button>
                            <button 
                              id="btn-scan-fail"
                              onClick={() => {
                                setQrIsScanning(true);
                                setTimeout(() => {
                                  setQrIsScanning(false);
                                  triggerToast("QR validation error: Expired Token Proxy warning.", "error");
                                }, 2000);
                              }}
                              className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 px-4 rounded-xl text-xs border border-rose-500/20 cursor-pointer transition-colors"
                            >
                              Scan Expired Token
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-300 block">🔬 Proxy Detection Telemetry Rules</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          By refreshing QR vectors dynamically, screenshot sharing becomes impossible. Any scanned code older than 10 seconds triggers a proxy warning alert routed to parents and teacher logs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}



              {/* TAB 5: AI INSIGHTS & RISKS */}
              {activeTab === "ai_insights" && (
                <div id="tab-ai-insights" className="space-y-8">
                  {/* Global Insights Section */}
                  {loadingAi ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-mono text-indigo-400 animate-pulse">SYNCHRONIZING RECURRENT NEURAL LOGS...</span>
                    </div>
                  ) : aiAnalytics ? (
                    <div className="space-y-8">
                      {/* Forecasting Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 glass-card p-6 space-y-4">
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-base font-bold text-white">AI Forecasting Model Analysis</h3>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {aiAnalytics.forecasting.explanation}
                          </p>
                          <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                            <span className="text-xs text-slate-500 font-mono">Next Month Trend probability:</span>
                            <span className={`text-xs font-bold font-mono uppercase px-2.5 py-0.5 rounded ${
                              aiAnalytics.forecasting.nextMonthTrend === 'stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {aiAnalytics.forecasting.nextMonthTrend}
                            </span>
                          </div>
                        </div>

                        {/* Recommendation Cards */}
                        <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5 space-y-4">
                          <span className="text-xs font-mono font-bold text-indigo-400 block uppercase tracking-wider">Smart Recommendations</span>
                          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                            {aiAnalytics.globalInsights.recommendations.map((rec, i) => (
                              <li key={i} className="leading-relaxed">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Detailed Students at Risk assessment */}
                      <div className="glass-card p-6 space-y-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-900 pb-5 gap-4">
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">Multi-Vector AI Predictive Models</h3>
                            <p className="text-xs text-slate-500">
                              Analyzed across subject-wise risks, whole-day absence hazards, and 30-day target trajectories.
                            </p>
                          </div>

                          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => setAiSubTab("subject")}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                aiSubTab === "subject"
                                  ? "bg-indigo-600 text-white shadow"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              📚 Subject-Wise
                            </button>
                            <button
                              onClick={() => setAiSubTab("whole_day")}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                aiSubTab === "whole_day"
                                  ? "bg-indigo-600 text-white shadow"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              📅 Whole-Day
                            </button>
                            <button
                              onClick={() => setAiSubTab("full_month")}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                aiSubTab === "full_month"
                                  ? "bg-indigo-600 text-white shadow"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              📊 Full-Month
                            </button>
                          </div>
                        </div>

                        {/* STUDENT & PARENT SPECIFIC VIEW */}
                        {(currentUser?.role === 'student' || currentUser?.role === 'parent') ? (
                          <div className="space-y-6">
                            {(() => {
                              const targetName = currentUser.role === 'student' 
                                ? currentUser.name 
                                : (leaderboard.find(l => l.parentId === currentUser.id)?.name || "Alex Patterson");
                              const myRisk = aiAnalytics.studentsRisk.find(
                                r => r.studentName.toLowerCase() === targetName.toLowerCase()
                              ) || aiAnalytics.studentsRisk[0];

                              if (!myRisk) {
                                return (
                                  <div className="text-center py-6 text-xs text-slate-500">
                                    No direct predictive data found for this student account.
                                  </div>
                                );
                              }

                              if (aiSubTab === "subject") {
                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                                    {myRisk.subjectWise?.map((sub, i) => {
                                      const isHigh = sub.prediction === "High Risk";
                                      const isMedium = sub.prediction === "Medium Risk";
                                      const colorClass = isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400";
                                      const barClass = isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500";
                                      const borderClass = isHigh ? "bg-rose-500/5 border-rose-500/10" : isMedium ? "bg-amber-500/5 border-amber-500/10" : "bg-emerald-500/5 border-emerald-500/10";
                                      return (
                                        <div key={i} className={`p-5 rounded-2xl border ${borderClass} space-y-4`}>
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-white block uppercase tracking-wider font-mono">{sub.subject}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono border ${
                                              isHigh ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                              isMedium ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                              'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            }`}>
                                              {sub.prediction}
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-400 leading-relaxed">{sub.reason}</p>
                                          <div className="space-y-1.5 pt-2 border-t border-slate-900/40">
                                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                              <span>SUBJECT ABSENCE RISK:</span>
                                              <span className={`font-bold ${colorClass}`}>{sub.riskScore}%</span>
                                            </div>
                                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                              <div className={`h-full rounded-full ${barClass}`} style={{ width: `${sub.riskScore}%` }}></div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }

                              if (aiSubTab === "whole_day") {
                                const wd = myRisk.wholeDay;
                                const isHigh = wd.prediction === "High Risk";
                                const isMedium = wd.prediction === "Medium Risk";
                                const colorClass = isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400";
                                const barClass = isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500";
                                return (
                                  <div className="max-w-2xl mx-auto p-6 bg-slate-900/20 border border-slate-850 rounded-2xl space-y-6">
                                    <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        isHigh ? 'bg-rose-500/10 text-rose-400' :
                                        isMedium ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-emerald-500/10 text-emerald-400'
                                      }`}>
                                        <Calendar className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Daily Attendance Reliability</h4>
                                        <p className="text-xs text-slate-500">Predicts risk profile of missing full school days entirely.</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Risk Classifier</span>
                                        <span className={`text-xs font-bold uppercase tracking-widest font-mono ${colorClass}`}>
                                          {wd.prediction}
                                        </span>
                                      </div>
                                      <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Absence Risk Score</span>
                                        <span className="text-sm font-bold text-white font-mono">{wd.riskScore}%</span>
                                      </div>
                                    </div>

                                    <p className="text-xs text-slate-300 leading-relaxed p-4 bg-slate-950/40 rounded-xl border border-slate-900">
                                      {wd.reason}
                                    </p>
                                  </div>
                                );
                              }

                              if (aiSubTab === "full_month") {
                                const fm = myRisk.fullMonth;
                                const isHigh = fm.prediction === "High Risk";
                                const isMedium = fm.prediction === "Medium Risk";
                                const colorClass = isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400";
                                return (
                                  <div className="max-w-2xl mx-auto p-6 bg-slate-900/20 border border-slate-850 rounded-2xl space-y-6">
                                    <div className="flex items-center gap-4 border-b border-slate-900 pb-4">
                                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <Sparkles className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">30-Day Attendance Forecast</h4>
                                        <p className="text-xs text-slate-500">Estimates final month-end attendance percentage metrics.</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-center text-center">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Projected Rate</span>
                                        <span className="text-3xl font-black text-indigo-400 font-mono">{fm.projectedRate}%</span>
                                        <span className="text-[10px] text-slate-500 mt-1">Attendance Goal: {activeStudentProfile?.attendanceGoal || 95}%</span>
                                      </div>

                                      <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-center text-center">
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Goal Compliance Target</span>
                                        <span className={`text-base font-black font-mono uppercase ${
                                          fm.projectedRate >= (activeStudentProfile?.attendanceGoal || 95) ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                          {fm.projectedRate >= (activeStudentProfile?.attendanceGoal || 95) ? 'On Track' : 'Risk of Drop'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-1">Accuracy Factor: {100 - fm.riskScore}%</span>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-900 space-y-2">
                                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">AI Rationale & Path</span>
                                      <p className="text-xs text-slate-300 leading-relaxed">
                                        {fm.reason}
                                      </p>
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            })()}
                          </div>
                        ) : (
                          /* EDUCATOR / ADMIN COMPREHENSIVE VIEW */
                          <div className="space-y-4">
                            {aiSubTab === "subject" && (
                              <div className="space-y-4">
                                {aiAnalytics.studentsRisk.map((risk) => (
                                  <div key={risk.studentId} className="p-5 bg-slate-900/25 border border-slate-850 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{risk.studentName}</h4>
                                        <span className="text-[10px] font-mono text-slate-500">Cohort ID: {risk.studentId}</span>
                                      </div>
                                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase">
                                        Subject Risk Profiles
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {risk.subjectWise?.map((sub, sIdx) => {
                                        const isHigh = sub.prediction === "High Risk";
                                        const isMedium = sub.prediction === "Medium Risk";
                                        return (
                                          <div key={sIdx} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-2">
                                            <div className="flex justify-between items-center">
                                              <span className="text-xs font-semibold text-slate-300">{sub.subject}</span>
                                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                                isHigh ? 'bg-rose-500/10 text-rose-400' :
                                                isMedium ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-emerald-500/10 text-emerald-400'
                                              }`}>
                                                {sub.riskScore}%
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{sub.reason}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {aiSubTab === "whole_day" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {aiAnalytics.studentsRisk.map((risk) => {
                                  const isHigh = risk.wholeDay.prediction === "High Risk";
                                  const isMedium = risk.wholeDay.prediction === "Medium Risk";
                                  const colorClass = isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400";
                                  const barClass = isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500";
                                  return (
                                    <div key={risk.studentId} className="p-4 rounded-xl border border-slate-850 bg-slate-900/25 flex flex-col justify-between gap-4">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <span className="text-xs font-bold text-white block uppercase tracking-wider font-mono">{risk.studentName}</span>
                                            <span className="text-[9px] font-mono text-slate-500">WHOLE DAY ABSENCE RISK</span>
                                          </div>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                                            isHigh ? 'bg-rose-500/10 text-rose-400' :
                                            isMedium ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-emerald-500/10 text-emerald-400'
                                          }`}>
                                            {risk.wholeDay.prediction}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">{risk.wholeDay.reason}</p>
                                      </div>

                                      <div className="space-y-1.5 pt-2 border-t border-slate-900">
                                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                                          <span>ABSENCE RISK COEFFICIENT:</span>
                                          <span className={`font-bold ${colorClass}`}>{risk.wholeDay.riskScore}%</span>
                                        </div>
                                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${barClass}`} style={{ width: `${risk.wholeDay.riskScore}%` }}></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {aiSubTab === "full_month" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {aiAnalytics.studentsRisk.map((risk) => {
                                  const isHigh = risk.fullMonth.prediction === "High Risk";
                                  const isMedium = risk.fullMonth.prediction === "Medium Risk";
                                  const colorClass = isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400";
                                  const barClass = isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500";
                                  return (
                                    <div key={risk.studentId} className="p-4 rounded-xl border border-slate-850 bg-slate-900/25 flex flex-col justify-between gap-4">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <span className="text-xs font-bold text-white block uppercase tracking-wider font-mono">{risk.studentName}</span>
                                            <span className="text-[9px] font-mono text-slate-500">30-DAY MONTHLY FORECAST</span>
                                          </div>
                                          <div className="text-right">
                                            <span className={`text-xs font-black block font-mono ${colorClass}`}>{risk.fullMonth.projectedRate}%</span>
                                            <span className="text-[9px] text-slate-500 block uppercase font-mono">Projected</span>
                                          </div>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">{risk.fullMonth.reason}</p>
                                      </div>

                                      <div className="space-y-1.5 pt-2 border-t border-slate-900">
                                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                                          <span>DROPOUT HAZARD:</span>
                                          <span className={`font-bold ${colorClass}`}>{risk.fullMonth.riskScore}%</span>
                                        </div>
                                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${barClass}`} style={{ width: `${risk.fullMonth.riskScore}%` }}></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-600 font-medium">
                      Failed to compile AI insights dataset.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: LEAVE REQUESTS */}
              {activeTab === "leaves" && (
                <div id="tab-leaves" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Submit Request form - HIDE FOR TEACHERS */}
                    {currentUser?.role !== "teacher" && (
                      <div className="glass-card p-6 h-fit space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-white">Apply for Medical/Urgent Leave</h3>
                          <p className="text-xs text-slate-500">Provide dates and select a specific teacher below for rapid validation.</p>
                        </div>

                        <form onSubmit={handleSubmitLeave} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase font-mono">Start Date</label>
                              <input 
                                id="leave-start"
                                type="date" 
                                value={leaveStartDate}
                                onChange={(e) => setLeaveStartDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase font-mono">End Date</label>
                              <input 
                                id="leave-end"
                                type="date" 
                                value={leaveEndDate}
                                onChange={(e) => setLeaveEndDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase font-mono">Assign to Teacher</label>
                            <select 
                              id="leave-teacher-select"
                              value={selectedTeacherId}
                              onChange={(e) => setSelectedTeacherId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {teachersList.length === 0 ? (
                                <option value="">No teachers available</option>
                              ) : (
                                teachersList.map((teacher) => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} {teacher.department ? `(${teacher.department})` : ""}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase font-mono">Reason / Description</label>
                            <textarea 
                              id="leave-reason"
                              rows={4}
                              placeholder="Provide details..."
                              value={leaveReason}
                              onChange={(e) => setLeaveReason(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            ></textarea>
                          </div>

                          <button 
                            id="leave-submit-btn"
                            type="submit" 
                            className="w-full glow-btn text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                          >
                            Submit Leave Request
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Registry list */}
                    <div className={`${currentUser?.role === 'teacher' ? 'lg:col-span-3' : 'lg:col-span-2'} glass-card p-6 space-y-6`}>
                      <div>
                        <h3 className="text-base font-bold text-white">Active Leave Registries</h3>
                        <p className="text-xs text-slate-500">
                          {currentUser?.role === 'teacher' 
                            ? "Overview of student leaves specifically addressed to your account" 
                            : "Overview of submitted and approved leaves"}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {leaveRequests
                          .filter((leave) => {
                            if (currentUser?.role === 'teacher') {
                              return leave.teacherId === currentUser.id;
                            }
                            return true;
                          })
                          .map((leave) => (
                            <div key={leave.id} className="p-4 bg-slate-900/35 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{leave.studentName}</span>
                                  <span className="text-[10px] text-slate-500">({leave.grade} {leave.section})</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{leave.reason}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] font-mono text-indigo-400">
                                  <div>Duration: {leave.startDate} to {leave.endDate}</div>
                                  {leave.teacherName && (
                                    <div className="text-slate-400">
                                      To Teacher: <span className="text-indigo-300 font-semibold">{leave.teacherName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                {leave.status === 'pending' ? (
                                  currentUser?.role === 'teacher' ? (
                                    <div className="flex gap-1.5">
                                      <button 
                                        id={`approve-${leave.id}`}
                                        onClick={() => handleLeaveDecision(leave.id, 'approved')}
                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        id={`reject-${leave.id}`}
                                        onClick={() => handleLeaveDecision(leave.id, 'rejected')}
                                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-amber-400 text-xs font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase font-bold">
                                      Pending Approval
                                    </span>
                                  )
                                ) : (
                                  <span className={`text-xs font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                                    leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {leave.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                        {leaveRequests.filter((leave) => {
                          if (currentUser?.role === 'teacher') {
                            return leave.teacherId === currentUser.id;
                          }
                          return true;
                        }).length === 0 && (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            No active leave requests found.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: GAMIFICATION */}
              {activeTab === "gamification" && (
                <div id="tab-gamification" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Leaderboard Column */}
                    <div className="lg:col-span-2 glass-card p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">Perfect Streak Leaderboard</h3>
                          <p className="text-xs text-slate-500">Compete within your specific class cohort to maintain perfect attendance streaks.</p>
                        </div>

                        {currentUser?.role === 'student' ? (
                          <div className="bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-indigo-500/20 uppercase tracking-wider">
                            Class: {(() => {
                              const myProfile = leaderboard.find(l => l.name === currentUser.name);
                              return myProfile ? `${myProfile.grade} - ${myProfile.section}` : "Grade 10 - Section A";
                            })()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Class Filter:</span>
                            <select
                              value={leaderboardClass}
                              onChange={(e) => setLeaderboardClass(e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            >
                              <option value="Grade 10 - Section A">Grade 10 - Section A</option>
                              <option value="Grade 10 - Section B">Grade 10 - Section B</option>
                              <option value="Grade 11 - Section A">Grade 11 - Section A</option>
                              <option value="Grade 11 - Section B">Grade 11 - Section B</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {filteredLeaderboard.length > 0 ? (
                          filteredLeaderboard.map((student, i) => (
                            <div key={student.id} className="p-4 bg-slate-900/35 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-bold font-mono text-slate-500 w-4">#{i + 1}</span>
                                <div>
                                  <span className="text-xs font-bold text-white block">{student.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{student.rollNo}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block">Attendance Rate</span>
                                  <span className="text-xs font-black text-white">{student.rate}%</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 block">Perfect Streak</span>
                                  <span className="text-xs font-black text-amber-400 font-mono">{student.streak} Days</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            No students registered under this class cohort.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Milestones / Rewards Column */}
                    <div className="glass-card p-6 space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Earned Badges Guide</h3>
                        <p className="text-xs text-slate-500">Unlocks automatically based on consecutive attendance parameters.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex gap-3">
                          <span className="text-2xl">🏅</span>
                          <div>
                            <span className="text-xs font-bold text-white block">Perfect Week</span>
                            <span className="text-[10px] text-slate-500 leading-relaxed">Logged present 7 consecutive operational classes.</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex gap-3">
                          <span className="text-2xl">🏆</span>
                          <div>
                            <span className="text-xs font-bold text-white block">Perfect Month</span>
                            <span className="text-[10px] text-slate-500 leading-relaxed">No late marks or leaves for 30 consecutive calendar days.</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex gap-3">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <span className="text-xs font-bold text-white block">Early Bird</span>
                            <span className="text-[10px] text-slate-500 leading-relaxed">Always scanned in prior to assembly bell chimes.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: ANNOUNCEMENTS */}
              {activeTab === "announcements" && (
                <div id="tab-announcements" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Announcement form */}
                    {(currentUser.role === 'super_admin' || currentUser.role === 'school_admin' || currentUser.role === 'teacher') && (
                      <div className="glass-card p-6 h-fit space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-white">Publish New Announcement</h3>
                          <p className="text-xs text-slate-500">Broadcaster notifications instantaneously routed across channels.</p>
                        </div>

                        <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase font-mono">Title</label>
                            <input 
                              id="ann-title-input"
                              type="text" 
                              placeholder="e.g. Campus Holiday scheduled"
                              value={annTitle}
                              onChange={(e) => setAnnTitle(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase font-mono">Message Content</label>
                            <textarea 
                              id="ann-content-input"
                              rows={4}
                              placeholder="Type details..."
                              value={annContent}
                              onChange={(e) => setAnnContent(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            ></textarea>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase font-mono">Audience Target</label>
                              <select 
                                id="ann-target-select"
                                value={annTarget}
                                onChange={(e) => setAnnTarget(e.target.value as any)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                              >
                                <option value="all">Everyone</option>
                                <option value="teachers">Teachers Only</option>
                                <option value="students">Students Only</option>
                                <option value="parents">Parents Only</option>
                              </select>
                            </div>
                            <div className="flex flex-col justify-end">
                              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                                <input 
                                  id="ann-important-toggle"
                                  type="checkbox" 
                                  checked={annImportant}
                                  onChange={(e) => setAnnImportant(e.target.checked)}
                                  className="accent-indigo-500"
                                />
                                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">High Priority</span>
                              </label>
                            </div>
                          </div>

                          <button 
                            id="ann-submit-btn"
                            type="submit" 
                            className="w-full glow-btn text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                          >
                            Broadcast Announcement
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Announcement Feed */}
                    <div className="lg:col-span-2 glass-card p-6 space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Active Board Broadcasts</h3>
                        <p className="text-xs text-slate-500">Live operational feed from school administration and teachers.</p>
                      </div>

                      <div className="space-y-4">
                        {announcements.map((ann) => (
                          <div key={ann.id} className={`p-5 rounded-xl border relative overflow-hidden bg-slate-900/35 border-slate-850 ${
                            ann.important ? 'border-rose-500/20 bg-rose-500/5' : ''
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{ann.title}</span>
                                {ann.important && (
                                  <span className="bg-rose-500/10 text-rose-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase border border-rose-500/20 animate-pulse">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">{ann.date}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{ann.content}</p>
                            <div className="mt-4 pt-3 border-t border-slate-950/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <span>Published by: {ann.author}</span>
                              <span className="uppercase">Target: {ann.targetGroup}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: AUDIT LOGS */}
              {activeTab === "audit_logs" && (
                <div id="tab-audit" className="space-y-8">
                  {/* CyberShield Pulse Core Banner */}
                  <div className="glass-card p-6 border-l-4 border-l-indigo-500 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-5 relative z-10 text-center md:text-left flex-col md:flex-row">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 relative">
                        <ShieldCheck className="w-9 h-9 animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                          <h2 className="text-xl font-bold text-white tracking-tight">AG CyberShield Security Vault</h2>
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                            Active Hardening On
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                          Robust intrusion detection, cryptographic validation, sandbox database buffers, and automated rate limiting defending all A.G Attend API vectors.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10 bg-slate-950/60 p-4 rounded-2xl border border-slate-900 min-w-[200px] justify-center md:justify-start">
                      <Cpu className="w-8 h-8 text-indigo-400 shrink-0" />
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Security Posture</span>
                        <span className="block text-lg font-bold text-emerald-400 font-mono tracking-tight">A+ / SECURE</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Settings Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Hardening Configurations */}
                    <div className="glass-card p-6 space-y-6 relative">
                      <div>
                        <h3 className="text-base font-bold text-white">CyberShield Control Board</h3>
                        <p className="text-xs text-slate-500">Configure core behavioral security filters and rate limitation caps.</p>
                      </div>

                      <div className="space-y-4">
                        {/* IPS */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                          <div>
                            <span className="block text-xs font-bold text-white">Intrusion Prevention System (IPS)</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Intercepts and drops malformed headers & bad request payloads.</span>
                          </div>
                          <button
                            onClick={() => handleToggleSecurityParam("ipsEnabled", !cyberConfig.ipsEnabled)}
                            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${cyberConfig.ipsEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${cyberConfig.ipsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* SQL Injection Sandbox */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                          <div>
                            <span className="block text-xs font-bold text-white">SQL Injection Sandbox</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Cleans query strings and neutralizes raw SQL sequences.</span>
                          </div>
                          <button
                            onClick={() => handleToggleSecurityParam("sqlSandboxEnabled", !cyberConfig.sqlSandboxEnabled)}
                            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${cyberConfig.sqlSandboxEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${cyberConfig.sqlSandboxEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* GeoFence Encryption */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                          <div>
                            <span className="block text-xs font-bold text-white">Geo-Fence Signal Signature Validation</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Restricts remote clock-ins to coordinates matching signed headers.</span>
                          </div>
                          <button
                            onClick={() => handleToggleSecurityParam("geoFenceEncryption", !cyberConfig.geoFenceEncryption)}
                            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${cyberConfig.geoFenceEncryption ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${cyberConfig.geoFenceEncryption ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Administrative 2FA Gatekeeper */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-850 rounded-xl hover:border-slate-800 transition-all">
                          <div>
                            <span className="block text-xs font-bold text-white">MFA Multi-Factor Challenge Access Gate</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Demands simulated OTP passcodes for administrative sign-in.</span>
                          </div>
                          <button
                            onClick={() => handleToggleSecurityParam("twoFactorEnabled", !cyberConfig.twoFactorEnabled)}
                            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${cyberConfig.twoFactorEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${cyberConfig.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Rate limiting and active lockouts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                            <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Throttling Threshold</span>
                            <select
                              value={cyberConfig.rateLimiterThreshold}
                              onChange={(e) => handleToggleSecurityParam("rateLimiterThreshold", parseInt(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none"
                            >
                              <option value={50}>High (50 req/min)</option>
                              <option value={100}>Medium (100 req/min)</option>
                              <option value={150}>Standard (150 req/min)</option>
                              <option value={300}>Relaxed (300 req/min)</option>
                            </select>
                          </div>

                          <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold">Locked Out Matrix</span>
                              <span className="block text-xs font-bold text-rose-400 mt-1">{activeLocks.length} Users Locked</span>
                            </div>
                            <button
                              onClick={handleReleaseLocks}
                              className="w-full mt-2 py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Flush Firewall Locks
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Penetration Audit & Interactive Security Scanner */}
                    <div className="glass-card p-6 space-y-6 relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-bold text-white">CyberShield Automated Audit Scan</h3>
                            <p className="text-xs text-slate-500">Run security penetration probes against server-side systems.</p>
                          </div>
                          {auditScanScore !== null && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block font-mono">Audit Score</span>
                              <span className={`text-2xl font-bold font-mono ${auditScanScore >= 95 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                {auditScanScore}/100
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Scanner Live Area */}
                        <div className="mt-6 p-4 bg-slate-950/80 border border-slate-900 rounded-xl min-h-[180px] flex flex-col justify-center relative font-mono text-xs">
                          {isScanningSecurity ? (
                            <div className="space-y-4 text-center">
                              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                              <div className="space-y-1">
                                <span className="text-indigo-400 font-bold block text-[11px] animate-pulse">PENETRATION PROBING IN PROGRESS...</span>
                                <p className="text-[10px] text-slate-500 leading-relaxed truncate">{securityScanStep}</p>
                              </div>
                            </div>
                          ) : auditScanResults.length > 0 ? (
                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1.5 border-b border-slate-900">
                                <span>PROBE CATEGORY</span>
                                <span>INTEGRITY CHECK</span>
                              </div>
                              {auditScanResults.map((res: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-400">{res.probe}</span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    res.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {res.status}
                                  </span>
                                </div>
                              ))}
                              {lastScanTime && (
                                <span className="block text-[9px] text-slate-600 text-right mt-2 font-mono">Last scanning signature compiled at {lastScanTime}</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-center space-y-2 text-slate-500 py-6">
                              <Cpu className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
                              <p className="text-[11px] leading-relaxed">
                                Firewalls are fully armed.<br/>
                                Click the trigger below to launch a comprehensive secure inspection.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleRunSecurityScan}
                        disabled={isScanningSecurity}
                        className="w-full mt-4 glow-btn text-white text-xs font-bold py-3 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${isScanningSecurity ? 'animate-spin' : ''}`} />
                        {isScanningSecurity ? "Compiling Cyber-Metrics..." : "Launch CyberShield Auditing Probe"}
                      </button>
                    </div>
                  </div>

                  {/* Grid of Audit Logs vs Devices history */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Security Events trail */}
                    <div className="glass-card p-6 space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Security Event & Audit Trails</h3>
                        <p className="text-xs text-slate-500">A detailed ledger of backend and portal configuration shifts.</p>
                      </div>

                      <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-xl space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{log.action}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">{log.details}</p>
                            <div className="flex justify-between text-[10px] font-mono text-indigo-400 pt-1.5 border-t border-slate-950">
                              <span>Admin: {log.userName}</span>
                              <span>IP: {log.ip}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Authenticated Device History */}
                    <div className="glass-card p-6 space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Active Sessions & Device History</h3>
                        <p className="text-xs text-slate-500">Monitors connected network fingerprints to block parallel access hacks.</p>
                      </div>

                      <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                        {loginHistory.map((history) => (
                          <div key={history.id} className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between items-center font-mono">
                              <span className="font-bold text-indigo-400">{history.userName}</span>
                              <span className="text-slate-500 text-[10px]">{new Date(history.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-slate-300">Device: {history.device}</div>
                            <div className="text-[10px] text-slate-500 font-mono">IP: {history.ip}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>

            {/* Sticky Foot Status bar */}
            <footer id="workspace-footer" className="h-14 bg-slate-950/70 border-t border-slate-900 px-8 flex items-center justify-between text-xs text-slate-500 relative z-30">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  A.G Security: Active
                </span>
                <span className="hidden md:inline">• Server Latency: 12ms</span>
                <span className="hidden md:inline">• Encryption Protocol: AES-256-GCM</span>
              </div>
              <span className="font-mono text-[10px]">VER: 4.2.0-STABLE</span>
            </footer>
          </div>

          {/* ADD USER MODAL */}
          <AnimatePresence>
            {showAddUserModal && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                 <motion.div
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   onClick={() => setShowAddUserModal(null)}
                   className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                 />
                 <motion.div
                   initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                   className="relative w-full max-w-lg glass-card p-8 space-y-6 overflow-y-auto max-h-[90vh]"
                 >
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider font-mono">Add New {showAddUserModal === 'teacher' ? 'Teacher' : 'Student'}</h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                             <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Full Name</label>
                             <input type="text" required value={showAddUserModal === 'teacher' ? tName : sName} onChange={(e) => showAddUserModal === 'teacher' ? setTName(e.target.value) : setSName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                          </div>
                          <div>
                             <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Email</label>
                             <input type="email" required value={showAddUserModal === 'teacher' ? tEmail : sEmail} onChange={(e) => showAddUserModal === 'teacher' ? setTEmail(e.target.value) : setSEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Password</label>
                          <input type="password" required value={showAddUserModal === 'teacher' ? tPassword : sPassword} onChange={(e) => showAddUserModal === 'teacher' ? setTPassword(e.target.value) : setSPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                       </div>

                       {showAddUserModal === 'teacher' ? (
                         <div>
                            <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Department</label>
                            <input type="text" value={tDept} onChange={(e) => setTDept(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                               <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Roll No</label>
                               <input type="text" value={sRollNo} onChange={(e) => setSRollNo(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                            </div>
                            <div>
                               <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Grade</label>
                               <input type="text" value={sGrade} onChange={(e) => setSGrade(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                            </div>
                            <div>
                               <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">Section</label>
                               <input type="text" value={sSection} onChange={(e) => setSSection(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                            </div>
                         </div>
                       )}

                       <button type="submit" className="w-full glow-btn text-white font-bold py-3.5 rounded-xl text-xs transition-all uppercase tracking-widest">Enroll Profile</button>
                    </form>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
