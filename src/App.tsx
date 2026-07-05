{/* RENDER LOGIN / REGISTER SCREEN IF NOT AUTHENTICATED */}
      {!currentUser ? (
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Quick Simulation Bar for Development Testing */}
            <div className="absolute top-0 left-0 right-0 bg-slate-800/40 px-4 py-2 border-b border-slate-800 flex gap-2 overflow-x-auto text-[11px] items-center">
              <span className="text-slate-400 font-mono font-bold uppercase tracking-wider">Simulate Workspace:</span>
              <button onClick={() => handleRoleSimulation("student")} className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded hover:bg-indigo-500/30 transition">Student</button>
              <button onClick={() => handleRoleSimulation("teacher")} className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded hover:bg-emerald-500/30 transition">Teacher</button>
              <button onClick={() => handleRoleSimulation("school_admin")} className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded hover:bg-rose-500/30 transition">Admin</button>
              <button onClick={() => handleRoleSimulation("parent")} className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded hover:bg-amber-500/30 transition">Parent</button>
            </div>

            <div className="text-center mt-6 mb-8">
              <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-3 text-indigo-400">
                <Cpu className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">a.g-attend Workspace</h2>
              <p className="text-sm text-slate-400 mt-1">
                {isRegisterMode ? "Create a smart authentication profile" : "Secure biometrics and ledger login portal"}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Alex Patterson"
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="student@school.com"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" 
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">System Identity Role</label>
                  <select 
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="student">Student Account</option>
                    <option value="teacher">Faculty Account</option>
                    <option value="parent">Parental Unit</option>
                  </select>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition mt-2 flex items-center justify-center gap-2"
              >
                {isRegisterMode ? <UserPlus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isRegisterMode ? "Generate Access Key" : "Authenticate Session"}</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
              <button 
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition"
              >
                {isRegisterMode ? "Already have an account? Sign In" : "Need workspace entry? Register Profile"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        /* CORE DESKTOP AND TABLET SYSTEM LAYOUT APPLICATION */
        <>
          <Sidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            role={currentUser.role} 
          />
          
          <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto">
            <Navbar 
              currentUser={currentUser} 
              setCurrentUser={setCurrentUser} 
              theme={theme} 
              setTheme={setTheme} 
              setSidebarOpen={setSidebarOpen} 
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
            />
            
            <main className="p-4 md:p-6 max-w-[1600px] w-full mx-auto space-y-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>System Main Frame</span>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 border border-indigo-500/20 rounded">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Welcome back, {currentUser.name}. Database tracking status: synchronized.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={loadData}
                    className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/60 transition text-xs flex items-center gap-1.5"
                    title="Force API Resync"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Nodes</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Application Routing based on activeTab state */}
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary content goes here - Render statistics, check-in options, charts */}
                  <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      Quick Metrics Summary
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
                        <span className="block text-xs text-slate-400 font-medium">Recordings Cached</span>
                        <span className="text-2xl font-bold text-white font-mono mt-1 block">{filteredAttendance.length}</span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
                        <span className="block text-xs text-slate-400 font-medium">Total Registered</span>
                        <span className="text-2xl font-bold text-indigo-400 font-mono mt-1 block">{totalStudentsCount}</span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl col-span-2 sm:col-span-1">
                        <span className="block text-xs text-slate-400 font-medium">Risk Alerts Flagged</span>
                        <span className="text-2xl font-bold text-rose-400 font-mono mt-1 block">
                          {aiAnalytics?.globalInsights?.riskCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Widget inside Dashboard: Attendance Simulators */}
                  <div className="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-400" />
                      Live Attendance Devices
                    </h3>
                    <div className="space-y-2">
                      <button 
                        onClick={handleGPSFetch} 
                        disabled={gpsLoading}
                        className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <MapPin className="w-4 h-4" />
                        {gpsLoading ? "Polling Coordinates..." : "Simulate Geofence Verification"}
                      </button>

                      <button 
                        onClick={() => handleFaceVerify(false)} 
                        disabled={faceScanning}
                        className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" />
                        {faceScanning ? "Analyzing Mesh..." : "Simulate Face Biometric Scanner"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Optional fallback text if tab layout is incomplete */}
              {activeTab !== "dashboard" && (
                <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl text-center">
                  <Sliders className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">Workspace module "{activeTab}" is running in secondary processing thread.</p>
                </div>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
