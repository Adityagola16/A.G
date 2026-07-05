import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Calendar, 
  Clock, 
  MessageSquareWarning, 
  CheckCircle, 
  X, 
  Mail, 
  Smartphone,
  Check,
  Sun,
  Moon,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationItem } from "../types";

interface NavbarProps {
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  title: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export default function Navbar({ 
  notifications, 
  onMarkNotificationRead, 
  title,
  theme,
  onToggleTheme,
  onToggleSidebar
}: NavbarProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'warning': return <MessageSquareWarning className="w-4 h-4 text-amber-400" />;
      case 'alert': return <Bell className="w-4 h-4 text-rose-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'sms': return <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase border border-indigo-500/20">SMS</span>;
      case 'whatsapp': return <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase border border-emerald-500/20">WhatsApp</span>;
      case 'email': return <span className="text-[9px] font-mono bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-bold uppercase border border-sky-500/20">Email</span>;
      default: return <span className="text-[9px] font-mono bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-500/20">Push</span>;
    }
  };

  return (
    <header id="navbar-header" className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 relative z-40">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-white cursor-pointer mr-1"
          title="Toggle Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 id="navbar-title" className="text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
        <span className="hidden md:inline-flex h-5 w-px bg-slate-800"></span>
        <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>{time.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats / Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Real-time UTC clock */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/40 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-indigo-400">
          <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>{time.toLocaleTimeString()}</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64 hidden lg:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            id="navbar-search"
            type="text" 
            placeholder="Search students, roll, methods..."
            className="w-full bg-slate-950 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 rounded-full bg-slate-950/40 hover:bg-slate-800 border border-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <Moon className="w-4.5 h-4.5 text-indigo-400" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            id="bell-icon-button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-10 h-10 rounded-full bg-slate-950/40 hover:bg-slate-800 border border-slate-800 flex items-center justify-center relative cursor-pointer group transition-colors"
          >
            <Bell className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popup */}
          <AnimatePresence>
            {showNotifDropdown && (
              <motion.div 
                id="notif-dropdown"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 shadow-indigo-500/5"
              >
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" /> Notifications Inbox
                  </h3>
                  <button 
                    id="close-notif-btn"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-900">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-600 text-xs">
                      No recent alerts or warnings.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 transition-colors relative flex gap-3 ${notif.read ? 'bg-transparent' : 'bg-slate-900/40 hover:bg-slate-900/60'}`}
                      >
                        <div className="mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-200">{notif.title}</span>
                            {getChannelBadge(notif.channel)}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] font-mono text-slate-600 mt-2">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.read && (
                          <button 
                            id={`mark-read-${notif.id}`}
                            onClick={() => onMarkNotificationRead(notif.id)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 self-center border border-slate-800/80 cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-500">SYSTEM ALERTS FEED</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
