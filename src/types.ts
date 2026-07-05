export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  branch?: string;
  department?: string;
  avatar?: string;
  phone?: string;
  joinedDate: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  parentId: string;
  schoolId: string;
  streak: number;
  badges: string[];
  riskScore: number;
  attendanceGoal: number;
  subjects: string[];
}

export interface TeacherProfile {
  id: string;
  userId: string;
  name: string;
  department: string;
  schoolId: string;
  subjects: string[];
  classes: string[]; // e.g., ["Grade 10 - A", "Grade 11 - B"]
}

export interface ParentProfile {
  id: string;
  userId: string;
  name: string;
  childrenIds: string[];
  schoolId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  subject?: string;
  markedBy: string; // Teacher name / System
  method: 'manual' | 'qr' | 'face' | 'gps' | 'voice';
  location?: {
    latitude: number;
    longitude: number;
    distance?: number; // Distance from target coordinate in meters
  };
  verified: boolean;
  notes?: string;
  timestamp: string;
  timing?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetGroup: 'all' | 'teachers' | 'students' | 'parents';
  date: string;
  author: string;
  important?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  channel: 'push' | 'sms' | 'whatsapp' | 'email';
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface AIRiskAnalysis {
  studentId: string;
  studentName: string;
  subjectWise: Array<{
    subject: string;
    riskScore: number;
    prediction: string;
    reason: string;
  }>;
  wholeDay: {
    riskScore: number;
    prediction: string;
    reason: string;
  };
  fullMonth: {
    projectedRate: number;
    riskScore: number;
    prediction: string;
    reason: string;
  };
}
