// client/src/pages/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  format, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment => 
      isSameDay(new Date(assignment.dueDate), date)
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Normal': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-md transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-md transition"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-t-lg overflow-hidden">
        {days.map(day => (
          <div key={day} className="bg-gray-50 p-4 text-center font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayAssignments = getAssignmentsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day}
            onClick={() => {
              if (dayAssignments.length > 0) {
                setSelectedDate(cloneDay);
                setShowModal(true);
              }
            }}
            className={`min-h-32 p-2 bg-white border-r border-b border-gray-200 ${
              !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
            } ${dayAssignments.length > 0 ? 'cursor-pointer hover:bg-blue-50' : ''} transition`}
          >
            <div className={`text-sm font-medium mb-2 ${
              isToday ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''
            }`}>
              {format(day, 'd')}
            </div>
            
            <div className="space-y-1">
              {dayAssignments.slice(0, 3).map(assignment => (
                <div
                  key={assignment._id}
                  className="text-xs p-1 rounded truncate bg-blue-50 text-blue-900"
                >
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}></div>
                    <span className="truncate">{assignment.title}</span>
                  </div>
                </div>
              ))}
              {dayAssignments.length > 3 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{dayAssignments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-px bg-gray-200">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const selectedDateAssignments = selectedDate ? getAssignmentsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderHeader()}
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {renderDays()}
        {renderCells()}
      </div>

      {/* Assignment Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedDateAssignments.map(assignment => (
                <div key={assignment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      assignment.priority === 'High' ? 'bg-red-100 text-red-800' :
                      assignment.priority === 'Normal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {assignment.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{assignment.course.title}</p>
                  
                  {assignment.description && (
                    <p className="text-sm text-gray-700 mt-2">{assignment.description}</p>
                  )}
                  
                  <div className="mt-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      assignment.status === 'Graded' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
