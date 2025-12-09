import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, BookOpen, LayoutDashboard, Calendar, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/calendar', label: 'Calendar', icon: Calendar }
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="bg-brand-50 p-2 rounded-lg group-hover:bg-brand-100 transition-colors">
                <BookOpen className="w-6 h-6 text-brand-700" />
              </div>
              <span className="text-2xl font-serif font-bold text-brand-900 tracking-tight">CourseTracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-brand-900 text-white shadow-md'
                    : 'text-stone-600 hover:bg-brand-50 hover:text-brand-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center pl-6 border-l border-stone-200 ml-6">
            <div className="text-right mr-4">
              <p className="text-sm font-bold text-brand-900 font-serif">{user?.name}</p>
              <p className="text-xs text-stone-500 capitalize tracking-wider">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu (Keep existing mobile logic, just update colors to brand-*) */}
      {/* ... (Use the previous logic but swap blue-50 for brand-50 etc) ... */}
    </nav>
  );
};

export default Navbar;
