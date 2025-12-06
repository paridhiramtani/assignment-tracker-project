// client/src/components/CourseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';

const CourseCard = ({ course, isOwner }) => {
  return (
    <Link
      to={`/courses/${course._id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200 block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
          <p className="text-sm font-medium text-blue-600">{course.code}</p>
        </div>
        <BookOpen className="w-8 h-8 text-blue-600 opacity-80" />
      </div>

      {course.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{course.members?.length || 0} members</span>
        </div>
        {isOwner && (
          <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
            Owner
          </span>
        )}
      </div>
    </Link>
  );
};

export default CourseCard;

// client/src/components/AssignmentCard.jsx
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AssignmentCard = ({ assignment, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Normal': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Graded': return 'bg-green-100 text-green-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'Pending';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h3>
          {assignment.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{assignment.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2 ml-4">
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(assignment.priority)}`}>
            {assignment.priority}
          </span>
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(assignment.status)}`}>
            {assignment.status}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
          </div>
          {isOverdue && (
            <span className="flex items-center space-x-1 text-red-600 font-medium">
              <Clock className="w-4 h-4" />
              <span>Overdue</span>
            </span>
          )}
        </div>
        <p className="text-blue-600 font-medium">{assignment.course.code}</p>
      </div>
    </div>
  );
};

export default AssignmentCard;

// client/src/components/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ completed, total, showLabel = true }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getColorClass = () => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showLabel && (
        <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
          <span>{completed} of {total} completed</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

// client/src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

// client/src/components/EmptyState.jsx
import React from 'react';

const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-md">
      {Icon && <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;

// client/src/components/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

// client/src/components/Alert.jsx
import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div className={`${bgColor} border ${borderColor} rounded-md p-4 mb-4`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${iconColor} mr-3 flex-shrink-0 mt-0.5`} />
        <p className={`text-sm ${textColor} flex-1`}>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className={`${textColor} hover:opacity-70 ml-3`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
