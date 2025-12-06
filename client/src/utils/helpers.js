// client/src/utils/helpers.js

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Check if date is overdue
 */
export const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date();
};

/**
 * Get days until due date
 */
export const daysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get priority color classes
 */
export const getPriorityColor = (priority) => {
  const colors = {
    'High': 'bg-red-100 text-red-800 border-red-200',
    'Normal': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Low': 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Get status color classes
 */
export const getStatusColor = (status) => {
  const colors = {
    'Graded': 'bg-green-100 text-green-800 border-green-200',
    'Submitted': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pending': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate file type
 */
export const isValidFileType = (filename) => {
  const allowedExtensions = ['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg', 'zip'];
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Group assignments by course
 */
export const groupByCourse = (assignments) => {
  return assignments.reduce((acc, assignment) => {
    const courseId = assignment.course._id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: assignment.course,
        assignments: []
      };
    }
    acc[courseId].assignments.push(assignment);
    return acc;
  }, {});
};

/**
 * Sort assignments by due date
 */
export const sortByDueDate = (assignments, ascending = true) => {
  return [...assignments].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Filter assignments by status
 */
export const filterByStatus = (assignments, status) => {
  if (!status) return assignments;
  return assignments.filter(a => a.status === status);
};

/**
 * Get upcoming assignments (next 7 days)
 */
export const getUpcomingAssignments = (assignments) => {
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate >= today && dueDate <= weekFromNow && a.status === 'Pending';
  });
};

/**
 * Handle API errors
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Debounce function for search/filter
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};
