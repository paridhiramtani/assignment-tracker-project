// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle, BookOpen, AlertCircle } from 'lucide-react';
import { format, isWithinInterval, addDays } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/assignments')
      ]);
      setCourses(coursesRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate upcoming deadlines (next 7 days)
  const upcomingDeadlines = assignments
    .filter(a => {
      const dueDate = new Date(a.dueDate);
      const now = new Date();
      const weekFromNow = addDays(now, 7);
      return isWithinInterval(dueDate, { start: now, end: weekFromNow }) && a.status === 'Pending';
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Calculate progress per course
  const courseProgress = courses.map(course => {
    const courseAssignments = assignments.filter(a => a.course._id === course._id);
    const total = courseAssignments.length;
    const submitted = courseAssignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;
    const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return { ...course, total, submitted, percentage };
  });

  // Stats
  const totalCourses = courses.length;
  const pendingAssignments = assignments.filter(a => a.status === 'Pending').length;
  const completedAssignments = assignments.filter(a => a.status === 'Submitted' || a.status === 'Graded').length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Normal': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your courses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCourses}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingAssignments}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completedAssignments}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
            <Clock className="w-6 h-6 text-gray-400" />
          </div>

          {upcomingDeadlines.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming deadlines</p>
          ) : (
            <div className="space-y-4">
              {upcomingDeadlines.map(assignment => (
                <div key={assignment._id} className="border-l-4 border-blue-600 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">{assignment.course.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Course Progress</h2>
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>

          {courseProgress.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No courses yet</p>
              <Link
                to="/courses"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courseProgress.map(course => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="block hover:bg-gray-50 rounded-lg p-3 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {course.submitted}/{course.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${course.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{course.percentage}% complete</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
