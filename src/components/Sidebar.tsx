import React from "react";
import { 
  LayoutDashboard, 
  UserCheck, 
  QrCode, 
  MapPin, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Award, 
  Megaphone, 
  LogOut, 
  Users, 
  Eye,
  Settings,
  X,
  Camera,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Camera as CapacitorCamera, CameraSource, CameraResultType } from '@capacitor/camera';
import { UserRole } from "../types";

interface SidebarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser: any;
  onChangeAvatar?: (newUrl: string) => void;
}

export default function Sidebar({ 
  currentRole, 
  onChangeRole, 
  activeTab, 
  setActiveTab, 
  userEmail,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  onChangeAvatar
}: SidebarProps) {
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = React.useState("");
  const [dicebearSeed, setDicebearSeed] = React.useState("");

  const handleUploadFromGallery = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        onChangeAvatar?.(image.dataUrl);
        setShowAvatarModal(false);
      }
    } catch (error) {
      console.error("Gallery access error:", error);
    }
  };

  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop"
  ];
  
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "school_admin": return "School Admin";
      case "teacher": return "Teacher";
      case "parent": return "Parent";
      case "student": return "Student";
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "super_admin": return "bg-red-500/10 text-red-400 border-red-500/30";
      case "school_admin": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "teacher": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "parent": return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "student": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "school_admin", "teacher", "parent", "student"] },
    { id: "student_list", label: "Student List", icon: Users, roles: ["super_admin", "school_admin", "teacher", "parent", "student"] },
    { id: "attendance", label: currentRole === "student" ? "Attendance Stats" : "Mark Attendance", icon: UserCheck, roles: ["teacher", "student"] },
    { id: "timetable", label: "Class Timetable", icon: Clock, roles: ["super_admin", "school_admin", "teacher", "student", "parent"] },
    { id: "qr_scanner", label: "QR Code Gateway", icon: QrCode, roles: ["super_admin", "school_admin", "teacher", "student"] },
    { id: "ai_insights", label: "AI Predict & Risk", icon: Sparkles, roles: ["super_admin", "school_admin", "teacher", "parent", "student"] },
    { id: "leaves", label: "Leave Requests", icon: FileText, roles: ["super_admin", "school_admin", "teacher", "parent", "student"] },
    { id: "gamification", label: "Leaderboard & Streaks", icon: Award, roles: ["super_admin", "teacher", "parent", "student"] },
    { id: "announcements", label: "Announcements", icon: Megaphone, roles: ["super_admin", "school_admin", "teacher", "parent", "student"] },
    { id: "manage_users", label: "Manage Teachers/Students", icon: Users, roles: ["super_admin", "school_admin"] },
    { id: "audit_logs", label: "Security & Audit", icon: ShieldCheck, roles: ["super_admin", "school_admin"] }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside 
      id="sidebar-container" 
      className={`w-80 h-screen bg-slate-950 text-slate-100 flex flex-col border-r border-slate-900 overflow-y-auto fixed md:relative inset-y-0 left-0 z-50 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      {/* Branding Header */}
      <div className="p-6 border-b border-slate-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              A.G Attend
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">AI by Gola ji</p>
          </div>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role Play Tester - Restricted to Super Admin */}
      {currentRole === 'super_admin' && (
        <div className="px-6 py-4 border-b border-slate-900/50 bg-slate-900/20">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-indigo-400 font-mono tracking-wider uppercase">
            <Eye className="w-3.5 h-3.5" /> ROLE PLAY SIMULATOR
          </div>
          <select
            id="role-play-dropdown"
            value={currentRole}
            onChange={(e) => {
              const role = e.target.value as UserRole;
              onChangeRole(role);
              // Default to main tab
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="super_admin">Super Admin</option>
            <option value="school_admin">School Admin</option>
            <option value="teacher">Teacher (Michael Chen)</option>
            <option value="parent">Parent (Robert Patterson)</option>
            <option value="student">Student (Alex Patterson)</option>
          </select>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Viewing context:</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${getRoleColor(currentRole)}`}>
              {getRoleLabel(currentRole)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav id="sidebar-nav" className="flex-1 px-4 py-6 space-y-1.5">
        {allowedItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 relative font-medium text-sm group ${
                isActive 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-indigo-500"
                />
              )}
              <Icon className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/50 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/45 transition-all">
          <div className="relative group shrink-0">
            <img 
              id="sidebar-user-avatar"
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userEmail)}`} 
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 object-cover" 
              alt="User"
            />
            {/* Hover Camera Overlay */}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Change Photo"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {currentUser?.name || 'User Profile'}
            </p>
            <p className="text-xs text-slate-500 truncate font-mono">{userEmail}</p>
          </div>
          {/* External Change Photo Trigger Button */}
          <button
            onClick={() => setShowAvatarModal(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-900 transition-colors"
            title="Edit Photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <button 
          id="logout-button"
          onClick={onLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Select Avatar Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden z-10 glass-card"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-sans">Change Profile Photo</h3>
                  <p className="text-xs text-slate-500">Upload from gallery, pick a preset, generate a seed, or paste a URL.</p>
                </div>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Portrait Presets */}
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">Portrait Presets</span>
                  <div className="grid grid-cols-4 gap-3">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onChangeAvatar?.(preset);
                          setShowAvatarModal(false);
                        }}
                        className="relative group rounded-full overflow-hidden border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer shrink-0 aspect-square"
                      >
                        <img src={preset} className="w-full h-full object-cover" alt={`Preset ${idx + 1}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone Gallery Upload */}
                <div className="space-y-2 border-t border-slate-900/50 pt-4">
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Device Storage</span>
                  <button
                    onClick={handleUploadFromGallery}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload from Phone Gallery</span>
                  </button>
                </div>

                {/* Dicebear seed generator */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Identicon Identification Seed</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Alex, Creative, Unique"
                      value={dicebearSeed}
                      onChange={(e) => setDicebearSeed(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                    <button
                      disabled={!dicebearSeed}
                      onClick={() => {
                        const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(dicebearSeed)}`;
                        onChangeAvatar?.(url);
                        setShowAvatarModal(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Custom URL */}
                <div className="space-y-2 border-t border-slate-900/50 pt-4">
                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Custom Image URL</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or any static image path"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                    <button
                      disabled={!customAvatarUrl.startsWith("http")}
                      onClick={() => {
                        onChangeAvatar?.(customAvatarUrl);
                        setShowAvatarModal(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Save Link
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
