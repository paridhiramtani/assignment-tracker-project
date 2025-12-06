// server/utils/validators.js
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation error',
      errors: errors.array() 
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    
    body('role')
      .optional()
      .isIn(['student', 'instructor', 'admin'])
      .withMessage('Invalid role'),
    
    validate
  ],
  
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    validate
  ]
};

// Course validation rules
const courseValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Course title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Course code is required')
      .isLength({ min: 2, max: 20 })
      .withMessage('Code must be between 2 and 20 characters')
      .matches(/^[A-Z0-9-]+$/i)
      .withMessage('Code can only contain letters, numbers, and hyphens'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    validate
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    validate
  ],
  
  getId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid course ID'),
    
    validate
  ]
};

// Assignment validation rules
const assignmentValidation = {
  create: [
    body('course')
      .notEmpty()
      .withMessage('Course is required')
      .isMongoId()
      .withMessage('Invalid course ID'),
    
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Assignment title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('dueDate')
      .notEmpty()
      .withMessage('Due date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Due date must be in the future');
        }
        return true;
      }),
    
    body('priority')
      .optional()
      .isIn(['Low', 'Normal', 'High'])
      .withMessage('Priority must be Low, Normal, or High'),
    
    validate
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    
    body('priority')
      .optional()
      .isIn(['Low', 'Normal', 'High'])
      .withMessage('Priority must be Low, Normal, or High'),
    
    body('status')
      .optional()
      .isIn(['Pending', 'Submitted', 'Graded'])
      .withMessage('Status must be Pending, Submitted, or Graded'),
    
    validate
  ],
  
  submit: [
    body('fileUrl')
      .notEmpty()
      .withMessage('File URL is required')
      .isURL()
      .withMessage('Must be a valid URL'),
    
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters'),
    
    validate
  ],
  
  getId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid assignment ID'),
    
    validate
  ]
};

module.exports = {
  validate,
  userValidation,
  courseValidation,
  assignmentValidation
};

// server/utils/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { AppError, errorHandler };

// server/utils/asyncHandler.js
// Wrapper for async route handlers to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

// server/utils/fileHelper.js
const fs = require('fs').promises;
const path = require('path');

class FileHelper {
  /**
   * Check if file exists
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath) {
    try {
      const exists = await this.fileExists(filePath);
      if (exists) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  static async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      return false;
    }
  }

  /**
   * Get file extension
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase().replace('.', '');
  }

  /**
   * Validate file type
   */
  static isValidFileType(filename, allowedTypes) {
    const extension = this.getFileExtension(filename);
    return allowedTypes.includes(extension);
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFilename(originalName) {
    const extension = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}${extension}`;
  }

  /**
   * Get file size in readable format
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = FileHelper;
