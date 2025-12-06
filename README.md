# 📚 CourseTracker - Course & Assignment Management System

A full-stack MERN application for students and instructors to manage courses, assignments, deadlines, and submissions with a modern, responsive UI.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with JWT tokens
- Password hashing with bcrypt
- Role-based access control (Student/Instructor)
- Persistent login sessions

### 📖 Course Management
- Create, view, edit, and delete courses
- Course enrollment system
- View course members and details
- Instructor-only course modifications

### 📝 Assignment Management
- Create assignments with title, description, due date, and priority
- Priority levels: Low, Normal, High
- Status tracking: Pending, Submitted, Graded
- Filter assignments by course, status, and due date
- File submissions (PDF, DOCX, PNG, JPG, ZIP up to 10MB)
- External URL submissions

### 📊 Dashboard
- Upcoming deadlines (next 7 days)
- Course progress visualization
- Pending assignments overview
- Quick statistics

### 📅 Calendar View
- Month view with all assignment due dates
- Color-coded by priority
- Click dates to view assignment details
- Navigate between months

### 🎨 Modern UI/UX
- Responsive mobile-first design
- Clean Tailwind CSS styling
- Card-based layouts
- Loading states and empty states
- Form validation with error messages

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **date-fns** - Date utilities
- **Lucide React** - Icons

## 📁 Project Structure

```
course-tracker/
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   └── assignmentController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── Assignment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── assignments.js
│   │   └── upload.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── uploads/
│   ├── server.js
│   ├── .env
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   └── CalendarView.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd course-tracker
```

2. **Backend Setup**
```bash
cd server
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/course-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EOF

# Create uploads directory
mkdir uploads
touch uploads/.gitkeep

# Start server
npm run dev
```

3. **Frontend Setup**
```bash
# Open new terminal
cd client
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (authenticated)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (owner/instructor)
- `DELETE /api/courses/:id` - Delete course (owner/instructor)
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/leave` - Leave course

### Assignments
- `GET /api/assignments` - List assignments (with filters)
- `POST /api/assignments` - Create assignment (instructor)
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment (instructor)
- `DELETE /api/assignments/:id` - Delete assignment (instructor)
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/assignments/:id/grade` - Grade assignment (instructor)

### File Upload
- `POST /api/upload` - Upload file (returns file URL)

## 🔒 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/course-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📸 Screenshots

### Dashboard
- View upcoming deadlines
- Track course progress
- See pending assignments

### Courses
- Browse all enrolled courses
- Create new courses
- View course details

### Calendar
- Month view of all due dates
- Color-coded priorities
- Quick assignment overview

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with validation
- [ ] User login and JWT token storage
- [ ] Protected routes redirect to login
- [ ] Create/edit/delete courses
- [ ] Enroll in courses
- [ ] Create assignments (instructor)
- [ ] Submit assignments (file & URL)
- [ ] View submissions
- [ ] Dashboard displays correct data
- [ ] Calendar shows assignments
- [ ] Mobile responsive design

## 🚢 Deployment

### Backend (Render/Railway)
1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add `VITE_API_URL` environment variable
5. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by [Your Name]

## 🙏 Acknowledgments

- MongoDB for the database
- Express.js for the backend framework
- React for the frontend library
- Tailwind CSS for styling
- Lucide for icons

## 📧 Contact

For questions or support, please email: your.email@example.com

---

**Happy Coding! 🚀**
