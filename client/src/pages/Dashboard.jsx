{/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Courses - Rose Theme */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Enrolled Courses</p>
              <p className="text-4xl font-serif font-bold text-brand-900 mt-2">{totalCourses}</p>
            </div>
            <BookOpen className="w-10 h-10 text-brand-500" />
          </div>
        </div>

        {/* Pending Tasks - Amber/Gold Theme */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Pending Tasks</p>
              <p className="text-4xl font-serif font-bold text-stone-900 mt-2">{pendingAssignments}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        {/* Completed - Emerald/Green Theme */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
              <p className="text-4xl font-serif font-bold text-stone-900 mt-2">{completedAssignments}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
      </div>
